import { eq, or } from "drizzle-orm";
import { db, jobsTable, webhooksTable } from "@workspace/db";
import { logger } from "./logger";

const TICK_INTERVAL_MS = 3000;
const PROGRESS_STEP = 20;

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
      await db
        .update(jobsTable)
        .set({ status: "processing", progress: 0, updatedAt: now })
        .where(eq(jobsTable.id, job.id));
      logger.info({ jobId: job.id }, "Job started processing");
      continue;
    }

    if (job.status === "processing") {
      const newProgress = Math.min(job.progress + PROGRESS_STEP, 100);

      if (newProgress >= 100) {
        const [completed] = await db
          .update(jobsTable)
          .set({ status: "done", progress: 100, updatedAt: now })
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
