import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, jobsTable } from "@workspace/db";
import {
  CreateJobBody,
  GetJobParams,
  CancelJobParams,
  RetryJobParams,
  ListJobsResponse,
  GetJobResponse,
  CreateJobResponse,
  CancelJobResponse,
  RetryJobResponse,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";

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
    errorMessage: row.errorMessage ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
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

  if (existing.status !== "queued") {
    res.status(409).json({
      error: `Cannot cancel a job with status "${existing.status}"`,
    });
    return;
  }

  const [updated] = await db
    .update(jobsTable)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(jobsTable.id, params.data.id))
    .returning();

  res.json(CancelJobResponse.parse(toJobResponse(updated)));
});

export default router;
