"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestCancel = requestCancel;
exports.getWorkerStatus = getWorkerStatus;
exports.startQueueWorker = startQueueWorker;
const drizzle_orm_1 = require("drizzle-orm");
const src_1 = require("../../db/src");
const logger_1 = require("./logger");
const crypto_1 = require("crypto");
const local_1 = require("./storage/local");
// Minimal 1×1 white pixel PNG (placeholder thumbnail)
const PNG_1X1 = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==", "base64");
// ── Config ────────────────────────────────────────────────────────────────────
const TICK_INTERVAL_MS = 3000;
const PROGRESS_STEP = 20;
const WORKER_CONCURRENCY = Math.max(1, parseInt(process.env["WORKER_CONCURRENCY"] ?? "1", 10));
const JOB_TIMEOUT_MS = Math.max(60000, parseInt(process.env["JOB_TIMEOUT_MINUTES"] ?? "30", 10) * 60000);
const WORKER_ID = `worker-${process.pid}-${Date.now()}`;
const workerStartedAt = Date.now();
// ── State ─────────────────────────────────────────────────────────────────────
const cancelRequested = new Set();
let lastHeartbeat = null;
const activeJobIds = new Set();
function requestCancel(jobId) {
    cancelRequested.add(jobId);
}
function getWorkerStatus() {
    const uptimeMs = Date.now() - workerStartedAt;
    const s = Math.floor(uptimeMs / 1000);
    const uptime = s >= 3600 ? `${Math.floor(s / 3600)}h${Math.floor((s % 3600) / 60)}m`
        : s >= 60 ? `${Math.floor(s / 60)}m${s % 60}s`
            : `${s}s`;
    return {
        workerId: WORKER_ID,
        concurrency: WORKER_CONCURRENCY,
        uptime,
        lastHeartbeat: lastHeartbeat?.toISOString() ?? null,
        currentJobIds: Array.from(activeJobIds),
        memoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    };
}
// ── Asset generation ──────────────────────────────────────────────────────────
async function generateAssets(job) {
    const now = new Date();
    // Thumbnail: 1×1 PNG placeholder
    const thumbKey = `${job.id}/thumbnail.png`;
    const thumbResult = await local_1.storage.save(thumbKey, PNG_1X1, "image/png");
    await src_1.db.insert(src_1.assetsTable).values({
        id: (0, crypto_1.randomUUID)(),
        jobId: job.id,
        type: "thumbnail",
        path: thumbResult.path,
        url: thumbResult.url,
        size: thumbResult.size,
        mime: "image/png",
        createdAt: now,
    });
    // Video: minimal placeholder MP4 stub
    const videoContent = Buffer.from(`RENDERSYNC_VIDEO_PLACEHOLDER\njob:${job.id}\nprompt:${job.prompt}\nduration:${job.duration}s\nresolution:${job.resolutionWidth}x${job.resolutionHeight}\n`);
    const videoKey = `${job.id}/video.mp4`;
    const videoResult = await local_1.storage.save(videoKey, videoContent, "video/mp4");
    await src_1.db.insert(src_1.assetsTable).values({
        id: (0, crypto_1.randomUUID)(),
        jobId: job.id,
        type: "generated_video",
        path: videoResult.path,
        url: videoResult.url,
        size: videoResult.size,
        mime: "video/mp4",
        createdAt: now,
    });
    logger_1.logger.info({ jobId: job.id, thumbUrl: thumbResult.url, videoUrl: videoResult.url }, "Assets generated");
}
// ── Webhooks ──────────────────────────────────────────────────────────────────
async function fireWebhooks(event, job) {
    const hooks = await src_1.db.select().from(src_1.webhooksTable).where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(src_1.webhooksTable.event, event), (0, drizzle_orm_1.eq)(src_1.webhooksTable.event, "job.all")));
    const payload = {
        event,
        timestamp: new Date().toISOString(),
        job: {
            id: job.id, prompt: job.prompt, duration: job.duration,
            resolutionWidth: job.resolutionWidth, resolutionHeight: job.resolutionHeight,
            status: job.status, progress: job.progress, retryCount: job.retryCount,
            createdAt: job.createdAt.toISOString(), updatedAt: job.updatedAt.toISOString(),
        },
    };
    await Promise.allSettled(hooks.map(async (hook) => {
        let statusCode = 0;
        try {
            const resp = await fetch(hook.url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(8000),
            });
            statusCode = resp.status;
            logger_1.logger.info({ webhookId: hook.id, statusCode, event }, "Webhook fired");
        }
        catch (err) {
            logger_1.logger.warn({ err, webhookId: hook.id }, "Webhook delivery failed");
        }
        await src_1.db.update(src_1.webhooksTable)
            .set({ lastFiredAt: new Date(), lastStatusCode: statusCode })
            .where((0, drizzle_orm_1.eq)(src_1.webhooksTable.id, hook.id));
    }));
}
// ── Attempt helpers ───────────────────────────────────────────────────────────
async function openAttempt(jobId, now) {
    const [existing] = await src_1.db
        .select({ cnt: (0, drizzle_orm_1.count)() })
        .from(src_1.jobAttemptsTable)
        .where((0, drizzle_orm_1.eq)(src_1.jobAttemptsTable.jobId, jobId));
    await src_1.db.insert(src_1.jobAttemptsTable).values({
        id: (0, crypto_1.randomUUID)(),
        jobId,
        attemptNumber: (existing?.cnt ?? 0) + 1,
        startedAt: now,
    });
}
async function closeAttempt(jobId, result, now) {
    const [open] = await src_1.db
        .select()
        .from(src_1.jobAttemptsTable)
        .where((0, drizzle_orm_1.eq)(src_1.jobAttemptsTable.jobId, jobId))
        .orderBy((0, drizzle_orm_1.desc)(src_1.jobAttemptsTable.attemptNumber))
        .limit(1);
    if (open && !open.completedAt) {
        await src_1.db.update(src_1.jobAttemptsTable)
            .set({ completedAt: now, durationMs: now.getTime() - open.startedAt.getTime(), result })
            .where((0, drizzle_orm_1.eq)(src_1.jobAttemptsTable.id, open.id));
    }
}
// ── Crash recovery ────────────────────────────────────────────────────────────
async function recoverStuckJobs() {
    const cutoff = new Date(Date.now() - JOB_TIMEOUT_MS);
    const stuck = await src_1.db
        .select({ id: src_1.jobsTable.id })
        .from(src_1.jobsTable)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(src_1.jobsTable.status, "processing"), (0, drizzle_orm_1.lt)(src_1.jobsTable.lockedAt, cutoff)));
    if (stuck.length === 0)
        return;
    const ids = stuck.map((r) => r.id);
    await src_1.db.update(src_1.jobsTable)
        .set({ status: "queued", progress: 0, lockedAt: null, lockedBy: null, updatedAt: new Date() })
        .where((0, drizzle_orm_1.inArray)(src_1.jobsTable.id, ids));
    logger_1.logger.warn({ count: ids.length, ids }, "Recovered stuck jobs");
}
// ── Atomic claim: grab up to N queued jobs ────────────────────────────────────
async function claimQueuedJobs(slots) {
    if (slots <= 0)
        return [];
    const now = new Date();
    // Sub-select the top N by priority DESC, created_at ASC, then atomically update
    const claimed = await src_1.db
        .update(src_1.jobsTable)
        .set({ status: "processing", progress: 0, lockedAt: now, lockedBy: WORKER_ID, updatedAt: now })
        .where((0, drizzle_orm_1.inArray)(src_1.jobsTable.id, src_1.db
        .select({ id: src_1.jobsTable.id })
        .from(src_1.jobsTable)
        .where((0, drizzle_orm_1.eq)(src_1.jobsTable.status, "queued"))
        .orderBy((0, drizzle_orm_1.desc)(src_1.jobsTable.priority), (0, drizzle_orm_1.asc)(src_1.jobsTable.createdAt))
        .limit(slots)))
        .returning();
    return claimed;
}
// ── Main tick ─────────────────────────────────────────────────────────────────
async function processTick() {
    lastHeartbeat = new Date();
    // 1. Recover crashed/stuck jobs
    await recoverStuckJobs();
    // 2. Claim new jobs up to concurrency limit
    const openSlots = WORKER_CONCURRENCY - activeJobIds.size;
    const claimed = await claimQueuedJobs(openSlots);
    for (const job of claimed) {
        activeJobIds.add(job.id);
        await openAttempt(job.id, new Date());
        logger_1.logger.info({ jobId: job.id, priority: job.priority, workerId: WORKER_ID }, "Job claimed");
    }
    // 3. Advance all processing jobs
    const processingJobs = await src_1.db
        .select()
        .from(src_1.jobsTable)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(src_1.jobsTable.status, "processing"), (0, drizzle_orm_1.eq)(src_1.jobsTable.lockedBy, WORKER_ID)));
    for (const job of processingJobs) {
        const now = new Date();
        // Cancel signal check
        if (cancelRequested.has(job.id)) {
            cancelRequested.delete(job.id);
            activeJobIds.delete(job.id);
            await closeAttempt(job.id, "cancelled", now);
            await src_1.db.update(src_1.jobsTable)
                .set({ status: "cancelled", lockedAt: null, lockedBy: null, updatedAt: now })
                .where((0, drizzle_orm_1.eq)(src_1.jobsTable.id, job.id));
            logger_1.logger.info({ jobId: job.id }, "Job cancelled mid-processing");
            continue;
        }
        const newProgress = Math.min(job.progress + PROGRESS_STEP, 100);
        // Map progress → pipeline stage
        const stage = newProgress <= 20 ? "parsing"
            : newProgress <= 40 ? "storyboard"
                : newProgress <= 60 ? "frames"
                    : newProgress <= 80 ? "encoding"
                        : "finalizing";
        if (newProgress >= 100) {
            activeJobIds.delete(job.id);
            await closeAttempt(job.id, "done", now);
            const [completed] = await src_1.db.update(src_1.jobsTable)
                .set({ status: "done", progress: 100, lockedAt: null, lockedBy: null, updatedAt: now })
                .where((0, drizzle_orm_1.eq)(src_1.jobsTable.id, job.id))
                .returning();
            logger_1.logger.info({ jobId: job.id }, "Job completed");
            if (completed) {
                generateAssets(completed).catch((err) => logger_1.logger.error({ err }, "Asset generation error"));
                fireWebhooks("job.done", completed).catch((err) => logger_1.logger.error({ err }, "Webhook dispatch error"));
            }
        }
        else {
            await src_1.db.update(src_1.jobsTable)
                .set({ progress: newProgress, currentStage: stage, updatedAt: now })
                .where((0, drizzle_orm_1.eq)(src_1.jobsTable.id, job.id));
        }
    }
}
// ── Bootstrap ─────────────────────────────────────────────────────────────────
function startQueueWorker() {
    logger_1.logger.info({ workerId: WORKER_ID, concurrency: WORKER_CONCURRENCY }, "Queue worker started");
    setInterval(() => {
        processTick().catch((err) => logger_1.logger.error({ err }, "Queue worker error"));
    }, TICK_INTERVAL_MS);
}
