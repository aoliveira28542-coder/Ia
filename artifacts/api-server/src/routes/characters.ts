import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, charactersTable } from "../../db/src";
import {
  ListCharactersResponse,
  GetCharacterResponse,
  CreateCharacterResponse,
  UpdateCharacterResponse,
  CreateCharacterBody,
  UpdateCharacterBody,
  GetCharacterParams,
  UpdateCharacterParams,
  DeleteCharacterParams,
} from "../../api-zod/src";
import { randomUUID } from "crypto";

const router: IRouter = Router();

function toCharacterResponse(row: typeof charactersTable.$inferSelect) {
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

router.get("/characters", async (_req, res): Promise<void> => {
  const rows = await db.select().from(charactersTable).orderBy(charactersTable.name);
  res.json(ListCharactersResponse.parse({ characters: rows.map(toCharacterResponse) }));
});

router.post("/characters", async (req, res): Promise<void> => {
  const parsed = CreateCharacterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const now = new Date();
  const [row] = await db
    .insert(charactersTable)
    .values({
      id: randomUUID(),
      name: parsed.data.name,
      referenceImage: parsed.data.referenceImage ?? null,
      description: parsed.data.description ?? null,
      embedding: null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  res.status(201).json(CreateCharacterResponse.parse(toCharacterResponse(row)));
});

router.get("/characters/:id", async (req, res): Promise<void> => {
  const params = GetCharacterParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(charactersTable)
    .where(eq(charactersTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Character not found" });
    return;
  }

  res.json(GetCharacterResponse.parse(toCharacterResponse(row)));
});

router.patch("/characters/:id", async (req, res): Promise<void> => {
  const params = UpdateCharacterParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCharacterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(charactersTable)
    .where(eq(charactersTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Character not found" });
    return;
  }

  const [updated] = await db
    .update(charactersTable)
    .set({
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.referenceImage !== undefined && { referenceImage: parsed.data.referenceImage }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
      updatedAt: new Date(),
    })
    .where(eq(charactersTable.id, params.data.id))
    .returning();

  res.json(UpdateCharacterResponse.parse(toCharacterResponse(updated)));
});

router.delete("/characters/:id", async (req, res): Promise<void> => {
  const params = DeleteCharacterParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select({ id: charactersTable.id })
    .from(charactersTable)
    .where(eq(charactersTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Character not found" });
    return;
  }

  await db.delete(charactersTable).where(eq(charactersTable.id, params.data.id));
  res.status(204).send();
});

export default router;
