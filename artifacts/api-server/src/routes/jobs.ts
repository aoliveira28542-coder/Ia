import { Router, type IRouter } from "express";
import { eq, desc, asc } from "drizzle-orm";
import { db, jobsTable, jobAttemptsTable, assetsTable } from "@workspace/db";
import {
  CreateJobBody,
  GetJobParams,
  CancelJobParams,
  RetryJobParams,
  ListJobAttemptsParams,
  ListJobAssetsParams,
  ListJobsResponse,
  GetJobResponse,
  CreateJobResponse,
  CancelJobResponse,
  RetryJobResponse,
  ListJobAttemptsResponse,
  ListJobAssetsResponse,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";
import { requestCancel } from "../lib/queue-worker";

const router: IRouter = Router();

function toJobResponse(row: typeof jobsTable.$inferSelect) {
  return {
    id: row.id,
    prompt: row.prompt,
    duration: row.duration,
    resolutionWidth: row.resolutionWidth,
    resolutionHeight: row.resolutionHeight,
    status: row.status as "queued" | "processing" | "done" | "failed" | "cancelled",
    progress: row.progress,
    retryCount: row.retryCount,
    maxRetries: row.maxRetries,
    priority: row.priority,
    lockedAt: row.lockedAt?.toISOString() ?? null,
    lockedBy: row.lockedBy ?? null,
    errorMessage: row.errorMessage ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toAttemptResponse(row: typeof jobAttemptsTable.$inferSelect) {
  return {
    id: row.id,
    jobId: row.jobId,
    attemptNumber: row.attemptNumber,
    startedAt: row.startedAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
    durationMs: row.durationMs ?? null,
    result: row.result ?? null,
    errorMessage: row.errorMessage ?? null,
  };
}

router.get("/jobs", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(jobsTable)
    .orderBy(desc(jobsTable.createdAt));

  const jobs = rows.map(toJobResponse);
  res.json(ListJobsResponse.parse({ jobs }));
});

router.post("/jobs", async (req, res): Promise<void> => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const id = randomUUID();
  const now = new Date();

  const [row] = await db
    .insert(jobsTable)
    .values({
      id,
      prompt: parsed.data.prompt,
      duration: parsed.data.duration ?? 5,
      resolutionWidth: parsed.data.resolutionWidth ?? 720,
      resolutionHeight: parsed.data.resolutionHeight ?? 1280,
      status: "queued",
      progress: 0,
      retryCount: 0,
      maxRetries: 3,
      priority: parsed.data.priority ?? 0,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  res.status(201).json(CreateJobResponse.parse(toJobResponse(row)));
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(GetJobResponse.parse(toJobResponse(row)));
});

router.get("/jobs/:id/attempts", async (req, res): Promise<void> => {
  const params = ListJobAttemptsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.id, params.data.id));

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const rows = await db
    .select()
    .from(jobAttemptsTable)
    .where(eq(jobAttemptsTable.jobId, params.data.id))
    .orderBy(asc(jobAttemptsTable.attemptNumber));

  res.json(ListJobAttemptsResponse.parse({ attempts: rows.map(toAttemptResponse) }));
});

router.post("/jobs/:id/retry", async (req, res): Promise<void> => {
  const params = RetryJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  if (existing.status !== "failed" && existing.status !== "cancelled") {
    res.status(409).json({
      error: `Cannot retry a job with status "${existing.status}"`,
    });
    return;
  }

  if (existing.retryCount >= existing.maxRetries) {
    res.status(409).json({
      error: `Job has reached the maximum of ${existing.maxRetries} retries`,
    });
    return;
  }

  const [updated] = await db
    .update(jobsTable)
    .set({ status: "queued", progress: 0, errorMessage: null, updatedAt: new Date() })
    .where(eq(jobsTable.id, params.data.id))
    .returning();

  res.json(RetryJobResponse.parse(toJobResponse(updated)));
});

router.post("/jobs/:id/cancel", async (req, res): Promise<void> => {
  const params = CancelJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  if (existing.status !== "queued" && existing.status !== "processing") {
    res.status(409).json({
      error: `Cannot cancel a job with status "${existing.status}"`,
    });
    return;
  }

  // Processing jobs: send cancel signal to worker; return current state
  if (existing.status === "processing") {
    requestCancel(existing.id);
    res.json(CancelJobResponse.parse(toJobResponse(existing)));
    return;
  }

  const [updated] = await db
    .update(jobsTable)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(jobsTable.id, params.data.id))
    .returning();

  res.json(CancelJobResponse.parse(toJobResponse(updated)));
});

router.get("/jobs/:id/assets", async (req, res): Promise<void> => {
  const params = ListJobAssetsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.id, params.data.id));

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const rows = await db
    .select()
    .from(assetsTable)
    .where(eq(assetsTable.jobId, params.data.id))
    .orderBy(asc(assetsTable.createdAt));

  const assets = rows.map((r) => ({
    id: r.id,
    jobId: r.jobId,
    type: r.type,
    path: r.path,
    url: r.url,
    size: r.size,
    mime: r.mime,
    createdAt: r.createdAt.toISOString(),
  }));

  const video = assets.find((a) => a.type === "generated_video")?.url ?? null;
  const thumbnail = assets.find((a) => a.type === "thumbnail")?.url ?? null;

  res.json(ListJobAssetsResponse.parse({ assets, video, thumbnail }));
});

export default router;
