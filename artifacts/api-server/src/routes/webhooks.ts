import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, webhooksTable } from "@workspace/db";
import {
  CreateWebhookBody,
  DeleteWebhookParams,
  TestWebhookParams,
  ListWebhooksResponse,
  CreateWebhookResponse,
  TestWebhookResponse,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function toWebhookResponse(row: typeof webhooksTable.$inferSelect) {
  return {
    id: row.id,
    url: row.url,
    event: row.event as "job.done" | "job.failed" | "job.all",
    label: row.label ?? null,
    createdAt: row.createdAt.toISOString(),
    lastFiredAt: row.lastFiredAt ? row.lastFiredAt.toISOString() : null,
    lastStatusCode: row.lastStatusCode ?? null,
  };
}

router.get("/webhooks", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(webhooksTable)
    .orderBy(webhooksTable.createdAt);

  res.json(ListWebhooksResponse.parse({ webhooks: rows.map(toWebhookResponse) }));
});

router.post("/webhooks", async (req, res): Promise<void> => {
  const parsed = CreateWebhookBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let url: URL;
  try {
    url = new URL(parsed.data.url);
  } catch {
    res.status(400).json({ error: "Invalid URL format" });
    return;
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    res.status(400).json({ error: "URL must use http or https" });
    return;
  }

  const [row] = await db
    .insert(webhooksTable)
    .values({
      id: randomUUID(),
      url: parsed.data.url,
      event: parsed.data.event,
      label: parsed.data.label ?? null,
    })
    .returning();

  res.status(201).json(CreateWebhookResponse.parse(toWebhookResponse(row)));
});

router.delete("/webhooks/:id", async (req, res): Promise<void> => {
  const params = DeleteWebhookParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(webhooksTable)
    .where(eq(webhooksTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Webhook not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/webhooks/:id/test", async (req, res): Promise<void> => {
  const params = TestWebhookParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [hook] = await db
    .select()
    .from(webhooksTable)
    .where(eq(webhooksTable.id, params.data.id));

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
  } catch (err) {
    logger.warn({ err, webhookId: hook.id }, "Test webhook delivery failed");
    statusCode = 0;
    ok = false;
  }

  await db
    .update(webhooksTable)
    .set({ lastFiredAt: new Date(), lastStatusCode: statusCode })
    .where(eq(webhooksTable.id, hook.id));

  res.json(TestWebhookResponse.parse({ ok, statusCode }));
});

export default router;
