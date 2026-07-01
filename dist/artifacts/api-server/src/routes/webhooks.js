"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("@workspace/db");
const api_zod_1 = require("@workspace/api-zod");
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
    const rows = await db_1.db
        .select()
        .from(db_1.webhooksTable)
        .orderBy(db_1.webhooksTable.createdAt);
    res.json(api_zod_1.ListWebhooksResponse.parse({ webhooks: rows.map(toWebhookResponse) }));
});
router.post("/webhooks", async (req, res) => {
    const parsed = api_zod_1.CreateWebhookBody.safeParse(req.body);
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
    const [row] = await db_1.db
        .insert(db_1.webhooksTable)
        .values({
        id: (0, crypto_1.randomUUID)(),
        url: parsed.data.url,
        event: parsed.data.event,
        label: parsed.data.label ?? null,
    })
        .returning();
    res.status(201).json(api_zod_1.CreateWebhookResponse.parse(toWebhookResponse(row)));
});
router.delete("/webhooks/:id", async (req, res) => {
    const params = api_zod_1.DeleteWebhookParams.safeParse(req.params);
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const [deleted] = await db_1.db
        .delete(db_1.webhooksTable)
        .where((0, drizzle_orm_1.eq)(db_1.webhooksTable.id, params.data.id))
        .returning();
    if (!deleted) {
        res.status(404).json({ error: "Webhook not found" });
        return;
    }
    res.sendStatus(204);
});
router.post("/webhooks/:id/test", async (req, res) => {
    const params = api_zod_1.TestWebhookParams.safeParse(req.params);
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const [hook] = await db_1.db
        .select()
        .from(db_1.webhooksTable)
        .where((0, drizzle_orm_1.eq)(db_1.webhooksTable.id, params.data.id));
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
    await db_1.db
        .update(db_1.webhooksTable)
        .set({ lastFiredAt: new Date(), lastStatusCode: statusCode })
        .where((0, drizzle_orm_1.eq)(db_1.webhooksTable.id, hook.id));
    res.json(api_zod_1.TestWebhookResponse.parse({ ok, statusCode }));
});
exports.default = router;
