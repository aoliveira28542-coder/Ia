import { Router, type IRouter } from "express";
import { eq, count, avg, sql } from "drizzle-orm";
import { db, jobsTable, jobAttemptsTable } from "@workspace/db";
import { getWorkerStatus } from "../lib/queue-worker";
import { GetSystemStatusResponse, GetSystemMetricsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/system/status", async (_req, res): Promise<void> => {
  const [queueRow] = await db.select({ cnt: count() }).from(jobsTable).where(eq(jobsTable.status, "queued"));
  const [processingRow] = await db.select({ cnt: count() }).from(jobsTable).where(eq(jobsTable.status, "processing"));
  const [failedRow] = await db.select({ cnt: count() }).from(jobsTable).where(eq(jobsTable.status, "failed"));

  const ws = getWorkerStatus();

  res.json(
    GetSystemStatusResponse.parse({
      worker: "online",
      workerId: ws.workerId,
      concurrency: ws.concurrency,
      queue: queueRow?.cnt ?? 0,
      processing: processingRow?.cnt ?? 0,
      failed: failedRow?.cnt ?? 0,
      uptime: ws.uptime,
      lastHeartbeat: ws.lastHeartbeat,
      currentJobIds: ws.currentJobIds,
      memoryMB: ws.memoryMB,
    }),
  );
});

router.get("/system/metrics", async (_req, res): Promise<void> => {
  const [total] = await db.select({ cnt: count() }).from(jobsTable);
  const [success] = await db.select({ cnt: count() }).from(jobsTable).where(eq(jobsTable.status, "done"));
  const [failed] = await db.select({ cnt: count() }).from(jobsTable).where(eq(jobsTable.status, "failed"));
  const [cancelled] = await db.select({ cnt: count() }).from(jobsTable).where(eq(jobsTable.status, "cancelled"));

  const [avgRow] = await db
    .select({ avg: avg(jobAttemptsTable.durationMs) })
    .from(jobAttemptsTable)
    .where(eq(jobAttemptsTable.result, "done"));

  const avgMs = avgRow?.avg ? Math.round(Number(avgRow.avg)) : null;

  let avgProcessingTime: string | null = null;
  if (avgMs !== null) {
    const s = Math.floor(avgMs / 1000);
    avgProcessingTime = s >= 60 ? `${Math.floor(s / 60)}m${s % 60}s` : `${s}s`;
  }

  const totalCount = total?.cnt ?? 0;
  const successCount = success?.cnt ?? 0;
  const failedCount = failed?.cnt ?? 0;
  const cancelledCount = cancelled?.cnt ?? 0;
  const terminal = successCount + failedCount;
  const successRate = terminal > 0 ? `${Math.round((successCount / terminal) * 100)}%` : "N/A";

  res.json(
    GetSystemMetricsResponse.parse({
      totalJobs: totalCount,
      success: successCount,
      failed: failedCount,
      cancelled: cancelledCount,
      avgProcessingTimeMs: avgMs,
      avgProcessingTime,
      successRate,
    }),
  );
});

export default router;
