"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("@workspace/db");
const api_zod_1 = require("@workspace/api-zod");
const crypto_1 = require("crypto");
const router = (0, express_1.Router)();
function toPresetResponse(row) {
    return {
        id: row.id,
        name: row.name,
        resolution: row.resolution,
        fps: row.fps,
        style: row.style,
        description: row.description ?? null,
        isDefault: row.isDefault,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
    };
}
router.get("/presets", async (_req, res) => {
    const rows = await db_1.db.select().from(db_1.presetsTable).orderBy(db_1.presetsTable.name);
    res.json(api_zod_1.ListPresetsResponse.parse({ presets: rows.map(toPresetResponse) }));
});
router.post("/presets", async (req, res) => {
    const parsed = api_zod_1.CreatePresetBody.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    const existing = await db_1.db
        .select({ id: db_1.presetsTable.id })
        .from(db_1.presetsTable)
        .where((0, drizzle_orm_1.eq)(db_1.presetsTable.name, parsed.data.name));
    if (existing.length > 0) {
        res.status(409).json({ error: `Preset "${parsed.data.name}" already exists` });
        return;
    }
    // If isDefault, clear other defaults first
    if (parsed.data.isDefault) {
        await db_1.db.update(db_1.presetsTable).set({ isDefault: false });
    }
    const now = new Date();
    const [row] = await db_1.db
        .insert(db_1.presetsTable)
        .values({
        id: (0, crypto_1.randomUUID)(),
        name: parsed.data.name,
        resolution: parsed.data.resolution ?? "1080p",
        fps: parsed.data.fps ?? 24,
        style: parsed.data.style ?? "cinematic",
        description: parsed.data.description ?? null,
        isDefault: parsed.data.isDefault ?? false,
        createdAt: now,
        updatedAt: now,
    })
        .returning();
    res.status(201).json(api_zod_1.CreatePresetResponse.parse(toPresetResponse(row)));
});
router.get("/presets/:id", async (req, res) => {
    const params = api_zod_1.GetPresetParams.safeParse(req.params);
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const [row] = await db_1.db
        .select()
        .from(db_1.presetsTable)
        .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(db_1.presetsTable.id, params.data.id), (0, drizzle_orm_1.eq)(db_1.presetsTable.name, params.data.id)));
    if (!row) {
        res.status(404).json({ error: "Preset not found" });
        return;
    }
    res.json(api_zod_1.GetPresetResponse.parse(toPresetResponse(row)));
});
router.delete("/presets/:id", async (req, res) => {
    const params = api_zod_1.DeletePresetParams.safeParse(req.params);
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const [row] = await db_1.db
        .select({ id: db_1.presetsTable.id })
        .from(db_1.presetsTable)
        .where((0, drizzle_orm_1.eq)(db_1.presetsTable.id, params.data.id));
    if (!row) {
        res.status(404).json({ error: "Preset not found" });
        return;
    }
    await db_1.db.delete(db_1.presetsTable).where((0, drizzle_orm_1.eq)(db_1.presetsTable.id, params.data.id));
    res.status(204).send();
});
exports.default = router;
