"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("@workspace/db");
const api_zod_1 = require("@workspace/api-zod");
const crypto_1 = require("crypto");
const router = (0, express_1.Router)();
function toCharacterResponse(row) {
    return {
        id: row.id,
        name: row.name,
        referenceImage: row.referenceImage ?? null,
        description: row.description ?? null,
        embedding: row.embedding ?? null,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
    };
}
router.get("/characters", async (_req, res) => {
    const rows = await db_1.db.select().from(db_1.charactersTable).orderBy(db_1.charactersTable.name);
    res.json(api_zod_1.ListCharactersResponse.parse({ characters: rows.map(toCharacterResponse) }));
});
router.post("/characters", async (req, res) => {
    const parsed = api_zod_1.CreateCharacterBody.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    const now = new Date();
    const [row] = await db_1.db
        .insert(db_1.charactersTable)
        .values({
        id: (0, crypto_1.randomUUID)(),
        name: parsed.data.name,
        referenceImage: parsed.data.referenceImage ?? null,
        description: parsed.data.description ?? null,
        embedding: null,
        createdAt: now,
        updatedAt: now,
    })
        .returning();
    res.status(201).json(api_zod_1.CreateCharacterResponse.parse(toCharacterResponse(row)));
});
router.get("/characters/:id", async (req, res) => {
    const params = api_zod_1.GetCharacterParams.safeParse(req.params);
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const [row] = await db_1.db
        .select()
        .from(db_1.charactersTable)
        .where((0, drizzle_orm_1.eq)(db_1.charactersTable.id, params.data.id));
    if (!row) {
        res.status(404).json({ error: "Character not found" });
        return;
    }
    res.json(api_zod_1.GetCharacterResponse.parse(toCharacterResponse(row)));
});
router.patch("/characters/:id", async (req, res) => {
    const params = api_zod_1.UpdateCharacterParams.safeParse(req.params);
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const parsed = api_zod_1.UpdateCharacterBody.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    const [existing] = await db_1.db
        .select()
        .from(db_1.charactersTable)
        .where((0, drizzle_orm_1.eq)(db_1.charactersTable.id, params.data.id));
    if (!existing) {
        res.status(404).json({ error: "Character not found" });
        return;
    }
    const [updated] = await db_1.db
        .update(db_1.charactersTable)
        .set({
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.referenceImage !== undefined && { referenceImage: parsed.data.referenceImage }),
        ...(parsed.data.description !== undefined && { description: parsed.data.description }),
        updatedAt: new Date(),
    })
        .where((0, drizzle_orm_1.eq)(db_1.charactersTable.id, params.data.id))
        .returning();
    res.json(api_zod_1.UpdateCharacterResponse.parse(toCharacterResponse(updated)));
});
router.delete("/characters/:id", async (req, res) => {
    const params = api_zod_1.DeleteCharacterParams.safeParse(req.params);
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const [row] = await db_1.db
        .select({ id: db_1.charactersTable.id })
        .from(db_1.charactersTable)
        .where((0, drizzle_orm_1.eq)(db_1.charactersTable.id, params.data.id));
    if (!row) {
        res.status(404).json({ error: "Character not found" });
        return;
    }
    await db_1.db.delete(db_1.charactersTable).where((0, drizzle_orm_1.eq)(db_1.charactersTable.id, params.data.id));
    res.status(204).send();
});
exports.default = router;
