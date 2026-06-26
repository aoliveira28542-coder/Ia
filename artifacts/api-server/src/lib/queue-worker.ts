import { eq, or, count, desc, asc } from "drizzle-orm";
import { db, jobsTable, jobAttemptsTable, webhooksTable } from "@workspace/db";
import { logger } from "./logger";
import { randomUUID } from "crypto";

const TICK_INTERVAL_MS = 3000;
const PROGRESS_STEP = 20;
const workerStartedAt = Date.now();

// ── Heartbeat state ──────────────────────────────────────────────────────────
interface WorkerState {
  lastHeartbeat: Date | null;
  currentJobId: string | null;
  processingStartedAt: Date | null;
}

const workerState: WorkerState = {
  lastHeartbeat: null,
  currentJobId: null,
  processingStartedAt: null,
};

// ── Cancel signal set ────────────────────────────────────────────────────────
const cancelRequested = new Set<string>();

export function requestCancel(jobId: string) {
  cancelRequested.add(jobId);
}

// ── Exported state for status route ─────────────────────────────────────────
export function getWorkerStatus() {
  const uptimeMs = Date.now() - workerStartedAt;
  const totalSeconds = Math.floor(uptimeMs / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const uptime = h > 0 ? `${h}h${m}m` : m > 0 ? `${m}m${s}s` : `${s}s`;

  const memBytes = process.memoryUsage().rss;
  const memMB = Math.round(memBytes / 1024 / 1024);

  let processingTime: string | null = null;
  if (workerState.processingStartedAt) {
    const elapsed = Math.floor((Date.now() - workerState.processingStartedAt.getTime()) / 1000);
    const pm = Math.floor(elapsed / 60);
    const ps = elapsed % 60;
    processingTime = pm > 0 ? `${pm}m${ps}s` : `${ps}s`;
  }

  return {
    lastHeartbeat: workerState.lastHeartbeat?.toISOString() ?? null,
    currentJobId: workerState.currentJobId,
    memoryMB: memMB,
    processingTime,
    uptime,
  };
}

// ── Webhooks ─────────────────────────────────────────────────────────────────
async function fireWebhooks(
  event: "job.done" | "job.failed",
  job: typeof jobsTable.$inferSelect,
) {
  const hooks = await db
    .select()
    .from(webhooksTable)
    .where(or(eq(webhooksTable.event, event), eq(webhooksTable.event, "job.all")));

  const payload = {
    event,
    timestamp: new Date().toISOString(),
    job: {
      id: job.id,
      prompt: job.prompt,
      duration: job.duration,
      resolutionWidth: job.resolutionWidth,
      resolutionHeight: job.resolutionHeight,
      status: job.status,
      progress: job.progress,
      retryCount: job.retryCount,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    },
  };

  await Promise.allSettled(
    hooks.map(async (hook) => {
      let statusCode = 0;
      try {
        const resp = await fetch(hook.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(8000),
        });
        statusCode = resp.status;
        logger.info({ webhookId: hook.id, statusCode, event }, "Webhook fired");
      } catch (err) {
        logger.warn({ err, webhookId: hook.id }, "Webhook delivery failed");
      }
      await db
        .update(webhooksTable)
        .set({ lastFiredAt: new Date(), lastStatusCode: statusCode })
        .where(eq(webhooksTable.id, hook.id));
    }),
  );
}

// ── Attempt helpers ───────────────────────────────────────────────────────────
async function closeOpenAttempt(
  jobId: string,
  result: "done" | "failed" | "cancelled",
  now: Date,
) {
  const [open] = await db
    .select()
    .from(jobAttemptsTable)
    .where(eq(jobAttemptsTable.jobId, jobId))
    .orderBy(desc(jobAttemptsTable.attemptNumber))
    .limit(1);

  if (open && !open.completedAt) {
    const durationMs = now.getTime() - open.startedAt.getTime();
    await db
      .update(jobAttemptsTable)
      .set({ completedAt: now, durationMs, result })
      .where(eq(jobAttemptsTable.id, open.id));
  }
}

// ── Main tick ─────────────────────────────────────────────────────────────────
async function processTick() {
  workerState.lastHeartbeat = new Date();

  // Priority queue: highest priority first, then oldest first
  const activeJobs = await db
    .select()
    .from(jobsTable)
    .where(or(eq(jobsTable.status, "queued"), eq(jobsTable.status, "processing")))
    .orderBy(desc(jobsTable.priority), asc(jobsTable.createdAt));

  for (const job of activeJobs) {
    const now = new Date();

    // ── Cancel signal check (processing jobs) ─────────────────────────────
    if (job.status === "processing" && cancelRequested.has(job.id)) {
      cancelRequested.delete(job.id);
      await closeOpenAttempt(job.id, "cancelled", now);
      await db
        .update(jobsTable)
        .set({ status: "cancelled", updatedAt: now })
        .where(eq(jobsTable.id, job.id));
      logger.info({ jobId: job.id }, "Job cancelled mid-processing");
      if (workerState.currentJobId === job.id) {
        workerState.currentJobId = null;
        workerState.processingStartedAt = null;
      }
      continue;
    }

    // ── queued → processing ───────────────────────────────────────────────
    if (job.status === "queued") {
      const [existing] = await db
        .select({ cnt: count() })
        .from(jobAttemptsTable)
        .where(eq(jobAttemptsTable.jobId, job.id));

      const attemptNumber = (existing?.cnt ?? 0) + 1;

      await db.insert(jobAttemptsTable).values({
        id: randomUUID(),
        jobId: job.id,
        attemptNumber,
        startedAt: now,
      });

      await db
        .update(jobsTable)
        .set({ status: "processing", progress: 0, retryCount: attemptNumber - 1, updatedAt: now })
        .where(eq(jobsTable.id, job.id));

      workerState.currentJobId = job.id;
      workerState.processingStartedAt = now;
      logger.info({ jobId: job.id, attemptNumber, priority: job.priority }, "Job started processing");
      continue;
    }

    // ── processing → advance / done ───────────────────────────────────────
    if (job.status === "processing") {
      if (workerState.currentJobId !== job.id) {
        workerState.currentJobId = job.id;
        workerState.processingStartedAt = now;
      }

      const newProgress = Math.min(job.progress + PROGRESS_STEP, 100);

      if (newProgress >= 100) {
        await closeOpenAttempt(job.id, "done", now);

        const [completed] = await db
          .update(jobsTable)
          .set({ status: "done", progress: 100, updatedAt: now })
          .where(eq(jobsTable.id, job.id))
          .returning();

        workerState.currentJobId = null;
        workerState.processingStartedAt = null;
        logger.info({ jobId: job.id }, "Job completed");

        if (completed) {
          fireWebhooks("job.done", completed).catch((err) =>
            logger.error({ err }, "Webhook dispatch error"),
          );
        }
      } else {
        await db
          .update(jobsTable)
          .set({ progress: newProgress, updatedAt: now })
          .where(eq(jobsTable.id, job.id));
      }
    }
  }
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
export function startQueueWorker() {
  logger.info("Queue worker started");
  setInterval(() => {
    processTick().catch((err) => logger.error({ err }, "Queue worker error"));
  }, TICK_INTERVAL_MS);
}
