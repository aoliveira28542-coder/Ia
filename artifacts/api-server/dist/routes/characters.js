"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const drizzle_orm_1 = require("drizzle-orm");
const src_1 = require("../../db/src");
const src_2 = require("../../api-zod/src");
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
    const rows = await src_1.db.select().from(src_1.charactersTable).orderBy(src_1.charactersTable.name);
    res.json(src_2.ListCharactersResponse.parse({ characters: rows.map(toCharacterResponse) }));
});
router.post("/characters", async (req, res) => {
    const parsed = src_2.CreateCharacterBody.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    const now = new Date();
    const [row] = await src_1.db
        .insert(src_1.charactersTable)
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
    res.status(201).json(src_2.CreateCharacterResponse.parse(toCharacterResponse(row)));
});
router.get("/characters/:id", async (req, res) => {
    const params = src_2.GetCharacterParams.safeParse(req.params);
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const [row] = await src_1.db
        .select()
        .from(src_1.charactersTable)
        .where((0, drizzle_orm_1.eq)(src_1.charactersTable.id, params.data.id));
    if (!row) {
        res.status(404).json({ error: "Character not found" });
        return;
    }
    res.json(src_2.GetCharacterResponse.parse(toCharacterResponse(row)));
});
router.patch("/characters/:id", async (req, res) => {
    const params = src_2.UpdateCharacterParams.safeParse(req.params);
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const parsed = src_2.UpdateCharacterBody.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    const [existing] = await src_1.db
        .select()
        .from(src_1.charactersTable)
        .where((0, drizzle_orm_1.eq)(src_1.charactersTable.id, params.data.id));
    if (!existing) {
        res.status(404).json({ error: "Character not found" });
        return;
    }
    const [updated] = await src_1.db
        .update(src_1.charactersTable)
        .set({
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.referenceImage !== undefined && { referenceImage: parsed.data.referenceImage }),
        ...(parsed.data.description !== undefined && { description: parsed.data.description }),
        updatedAt: new Date(),
    })
        .where((0, drizzle_orm_1.eq)(src_1.charactersTable.id, params.data.id))
        .returning();
    res.json(src_2.UpdateCharacterResponse.parse(toCharacterResponse(updated)));
});
router.delete("/characters/:id", async (req, res) => {
    const params = src_2.DeleteCharacterParams.safeParse(req.params);
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const [row] = await src_1.db
        .select({ id: src_1.charactersTable.id })
        .from(src_1.charactersTable)
        .where((0, drizzle_orm_1.eq)(src_1.charactersTable.id, params.data.id));
    if (!row) {
        res.status(404).json({ error: "Character not found" });
        return;
    }
    await src_1.db.delete(src_1.charactersTable).where((0, drizzle_orm_1.eq)(src_1.charactersTable.id, params.data.id));
    res.status(204).send();
});
exports.default = router;
