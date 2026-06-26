import { eq, or, count } from "drizzle-orm";
import { db, jobsTable, jobAttemptsTable, webhooksTable } from "@workspace/db";
import { logger } from "./logger";
import { randomUUID } from "crypto";

const TICK_INTERVAL_MS = 3000;
const PROGRESS_STEP = 20;

const workerStartedAt = Date.now();

function formatUptime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h${m}m`;
  if (m > 0) return `${m}m${s}s`;
  return `${s}s`;
}

export function getWorkerUptime(): string {
  return formatUptime(Date.now() - workerStartedAt);
}

async function fireWebhooks(
  event: "job.done" | "job.failed",
  job: typeof jobsTable.$inferSelect,
) {
  const hooks = await db
    .select()
    .from(webhooksTable)
    .where(
      or(
        eq(webhooksTable.event, event),
        eq(webhooksTable.event, "job.all"),
      ),
    );

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

async function processTick() {
  const activeJobs = await db
    .select()
    .from(jobsTable)
    .where(
      or(
        eq(jobsTable.status, "queued"),
        eq(jobsTable.status, "processing"),
      ),
    );

  for (const job of activeJobs) {
    const now = new Date();

    if (job.status === "queued") {
      // Find current attempt count for this job to determine attempt number
      const [existing] = await db
        .select({ cnt: count() })
        .from(jobAttemptsTable)
        .where(eq(jobAttemptsTable.jobId, job.id));

      const attemptNumber = (existing?.cnt ?? 0) + 1;

      // Create attempt record
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

      logger.info({ jobId: job.id, attemptNumber }, "Job started processing");
      continue;
    }

    if (job.status === "processing") {
      const newProgress = Math.min(job.progress + PROGRESS_STEP, 100);

      if (newProgress >= 100) {
        const completedAt = now;

        // Find the open attempt for this job
        const [openAttempt] = await db
          .select()
          .from(jobAttemptsTable)
          .where(eq(jobAttemptsTable.jobId, job.id))
          .orderBy(jobAttemptsTable.attemptNumber)
          .limit(1);

        if (openAttempt && !openAttempt.completedAt) {
          const durationMs = completedAt.getTime() - openAttempt.startedAt.getTime();
          await db
            .update(jobAttemptsTable)
            .set({ completedAt, durationMs, result: "done" })
            .where(eq(jobAttemptsTable.id, openAttempt.id));
        }

        const [completed] = await db
          .update(jobsTable)
          .set({ status: "done", progress: 100, updatedAt: completedAt })
          .where(eq(jobsTable.id, job.id))
          .returning();

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

export function startQueueWorker() {
  logger.info("Queue worker started");
  setInterval(() => {
    processTick().catch((err) => {
      logger.error({ err }, "Queue worker error");
    });
  }, TICK_INTERVAL_MS);
}
