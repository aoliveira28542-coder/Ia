"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const drizzle_orm_1 = require("drizzle-orm");
const src_1 = require("../../db/src");
const src_2 = require("../../api-zod/src");
const crypto_1 = require("crypto");
const logger_1 = require("../lib/logger");
const router = (0, express_1.Router)();
function toWebhookResponse(row) {
    return {
        id: row.id,
        url: row.url,
        event: row.event,
        label: row.label ?? null,
        createdAt: row.createdAt.toISOString(),
        lastFiredAt: row.lastFiredAt ? row.lastFiredAt.toISOString() : null,
        lastStatusCode: row.lastStatusCode ?? null,
    };
}
router.get("/webhooks", async (_req, res) => {
    const rows = await src_1.db
        .select()
        .from(src_1.webhooksTable)
        .orderBy(src_1.webhooksTable.createdAt);
    res.json(src_2.ListWebhooksResponse.parse({ webhooks: rows.map(toWebhookResponse) }));
});
router.post("/webhooks", async (req, res) => {
    const parsed = src_2.CreateWebhookBody.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    let url;
    try {
        url = new URL(parsed.data.url);
    }
    catch {
        res.status(400).json({ error: "Invalid URL format" });
        return;
    }
    if (!["http:", "https:"].includes(url.protocol)) {
        res.status(400).json({ error: "URL must use http or https" });
        return;
    }
    const [row] = await src_1.db
        .insert(src_1.webhooksTable)
        .values({
        id: (0, crypto_1.randomUUID)(),
        url: parsed.data.url,
        event: parsed.data.event,
        label: parsed.data.label ?? null,
    })
        .returning();
    res.status(201).json(src_2.CreateWebhookResponse.parse(toWebhookResponse(row)));
});
router.delete("/webhooks/:id", async (req, res) => {
    const params = src_2.DeleteWebhookParams.safeParse(req.params);
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const [deleted] = await src_1.db
        .delete(src_1.webhooksTable)
        .where((0, drizzle_orm_1.eq)(src_1.webhooksTable.id, params.data.id))
        .returning();
    if (!deleted) {
        res.status(404).json({ error: "Webhook not found" });
        return;
    }
    res.sendStatus(204);
});
router.post("/webhooks/:id/test", async (req, res) => {
    const params = src_2.TestWebhookParams.safeParse(req.params);
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const [hook] = await src_1.db
        .select()
        .from(src_1.webhooksTable)
        .where((0, drizzle_orm_1.eq)(src_1.webhooksTable.id, params.data.id));
    if (!hook) {
        res.status(404).json({ error: "Webhook not found" });
        return;
    }
    const payload = {
        event: "test",
        webhook_id: hook.id,
        timestamp: new Date().toISOString(),
        job: null,
    };
    let statusCode = 0;
    let ok = false;
    try {
        const response = await fetch(hook.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(10000),
        });
        statusCode = response.status;
        ok = response.ok;
    }
    catch (err) {
        logger_1.logger.warn({ err, webhookId: hook.id }, "Test webhook delivery failed");
        statusCode = 0;
        ok = false;
    }
    await src_1.db
        .update(src_1.webhooksTable)
        .set({ lastFiredAt: new Date(), lastStatusCode: statusCode })
        .where((0, drizzle_orm_1.eq)(src_1.webhooksTable.id, hook.id));
    res.json(src_2.TestWebhookResponse.parse({ ok, statusCode }));
});
exports.default = router;
