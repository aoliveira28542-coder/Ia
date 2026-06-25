import { eq, or } from "drizzle-orm";
import { db, jobsTable } from "@workspace/db";
import { logger } from "./logger";

const TICK_INTERVAL_MS = 3000;
const PROGRESS_STEP = 20;

async function processTick() {
  const activeJobs = await db
    .select()
    .from(jobsTable)
    .where(
      or(
        eq(jobsTable.status, "queued"),
        eq(jobsTable.status, "processing")
      )
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
        await db
          .update(jobsTable)
          .set({ status: "done", progress: 100, updatedAt: now })
          .where(eq(jobsTable.id, job.id));
        logger.info({ jobId: job.id }, "Job completed");
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
