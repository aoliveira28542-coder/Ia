import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, jobsTable } from "@workspace/db";
import { getWorkerUptime } from "../lib/queue-worker";
import { GetSystemStatusResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/system/status", async (_req, res): Promise<void> => {
  const [queueRow] = await db
    .select({ cnt: count() })
    .from(jobsTable)
    .where(eq(jobsTable.status, "queued"));

  const [processingRow] = await db
    .select({ cnt: count() })
    .from(jobsTable)
    .where(eq(jobsTable.status, "processing"));

  const [failedRow] = await db
    .select({ cnt: count() })
    .from(jobsTable)
    .where(eq(jobsTable.status, "failed"));

  res.json(
    GetSystemStatusResponse.parse({
      worker: "online",
      queue: queueRow?.cnt ?? 0,
      processing: processingRow?.cnt ?? 0,
      failed: failedRow?.cnt ?? 0,
      uptime: getWorkerUptime(),
    }),
  );
});

export default router;
