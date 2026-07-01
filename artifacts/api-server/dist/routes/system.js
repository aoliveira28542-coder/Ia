"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const drizzle_orm_1 = require("drizzle-orm");
const src_1 = require("../../db/src");
const queue_worker_1 = require("../lib/queue-worker");
const src_2 = require("../../api-zod/src");
const router = (0, express_1.Router)();
router.get("/system/status", async (_req, res) => {
    const [queueRow] = await src_1.db.select({ cnt: (0, drizzle_orm_1.count)() }).from(src_1.jobsTable).where((0, drizzle_orm_1.eq)(src_1.jobsTable.status, "queued"));
    const [processingRow] = await src_1.db.select({ cnt: (0, drizzle_orm_1.count)() }).from(src_1.jobsTable).where((0, drizzle_orm_1.eq)(src_1.jobsTable.status, "processing"));
    const [failedRow] = await src_1.db.select({ cnt: (0, drizzle_orm_1.count)() }).from(src_1.jobsTable).where((0, drizzle_orm_1.eq)(src_1.jobsTable.status, "failed"));
    const ws = (0, queue_worker_1.getWorkerStatus)();
    res.json(src_2.GetSystemStatusResponse.parse({
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
    const [total] = await src_1.db.select({ cnt: (0, drizzle_orm_1.count)() }).from(src_1.jobsTable);
    const [success] = await src_1.db.select({ cnt: (0, drizzle_orm_1.count)() }).from(src_1.jobsTable).where((0, drizzle_orm_1.eq)(src_1.jobsTable.status, "done"));
    const [failed] = await src_1.db.select({ cnt: (0, drizzle_orm_1.count)() }).from(src_1.jobsTable).where((0, drizzle_orm_1.eq)(src_1.jobsTable.status, "failed"));
    const [cancelled] = await src_1.db.select({ cnt: (0, drizzle_orm_1.count)() }).from(src_1.jobsTable).where((0, drizzle_orm_1.eq)(src_1.jobsTable.status, "cancelled"));
    const [avgRow] = await src_1.db
        .select({ avg: (0, drizzle_orm_1.avg)(src_1.jobAttemptsTable.durationMs) })
        .from(src_1.jobAttemptsTable)
        .where((0, drizzle_orm_1.eq)(src_1.jobAttemptsTable.result, "done"));
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
    res.json(src_2.GetSystemMetricsResponse.parse({
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
