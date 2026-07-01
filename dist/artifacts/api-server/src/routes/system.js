"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("@workspace/db");
const queue_worker_1 = require("../lib/queue-worker");
const api_zod_1 = require("@workspace/api-zod");
const router = (0, express_1.Router)();
router.get("/system/status", async (_req, res) => {
    const [queueRow] = await db_1.db.select({ cnt: (0, drizzle_orm_1.count)() }).from(db_1.jobsTable).where((0, drizzle_orm_1.eq)(db_1.jobsTable.status, "queued"));
    const [processingRow] = await db_1.db.select({ cnt: (0, drizzle_orm_1.count)() }).from(db_1.jobsTable).where((0, drizzle_orm_1.eq)(db_1.jobsTable.status, "processing"));
    const [failedRow] = await db_1.db.select({ cnt: (0, drizzle_orm_1.count)() }).from(db_1.jobsTable).where((0, drizzle_orm_1.eq)(db_1.jobsTable.status, "failed"));
    const ws = (0, queue_worker_1.getWorkerStatus)();
    res.json(api_zod_1.GetSystemStatusResponse.parse({
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
    }));
});
router.get("/system/metrics", async (_req, res) => {
    const [total] = await db_1.db.select({ cnt: (0, drizzle_orm_1.count)() }).from(db_1.jobsTable);
    const [success] = await db_1.db.select({ cnt: (0, drizzle_orm_1.count)() }).from(db_1.jobsTable).where((0, drizzle_orm_1.eq)(db_1.jobsTable.status, "done"));
    const [failed] = await db_1.db.select({ cnt: (0, drizzle_orm_1.count)() }).from(db_1.jobsTable).where((0, drizzle_orm_1.eq)(db_1.jobsTable.status, "failed"));
    const [cancelled] = await db_1.db.select({ cnt: (0, drizzle_orm_1.count)() }).from(db_1.jobsTable).where((0, drizzle_orm_1.eq)(db_1.jobsTable.status, "cancelled"));
    const [avgRow] = await db_1.db
        .select({ avg: (0, drizzle_orm_1.avg)(db_1.jobAttemptsTable.durationMs) })
        .from(db_1.jobAttemptsTable)
        .where((0, drizzle_orm_1.eq)(db_1.jobAttemptsTable.result, "done"));
    const avgMs = avgRow?.avg ? Math.round(Number(avgRow.avg)) : null;
    let avgProcessingTime = null;
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
    res.json(api_zod_1.GetSystemMetricsResponse.parse({
        totalJobs: totalCount,
        success: successCount,
        failed: failedCount,
        cancelled: cancelledCount,
        avgProcessingTimeMs: avgMs,
        avgProcessingTime,
        successRate,
    }));
});
exports.default = router;
