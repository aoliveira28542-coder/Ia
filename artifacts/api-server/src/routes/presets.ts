import { Router, type IRouter } from "express";
import { eq, or } from "drizzle-orm";
import { db, presetsTable } from "@workspace/db";
import {
  ListPresetsResponse,
  GetPresetResponse,
  CreatePresetResponse,
  CreatePresetBody,
  GetPresetParams,
  DeletePresetParams,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();

function toPresetResponse(row: typeof presetsTable.$inferSelect) {
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

router.get("/presets", async (_req, res): Promise<void> => {
  const rows = await db.select().from(presetsTable).orderBy(presetsTable.name);
  res.json(ListPresetsResponse.parse({ presets: rows.map(toPresetResponse) }));
});

router.post("/presets", async (req, res): Promise<void> => {
  const parsed = CreatePresetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select({ id: presetsTable.id })
    .from(presetsTable)
    .where(eq(presetsTable.name, parsed.data.name));

  if (existing.length > 0) {
    res.status(409).json({ error: `Preset "${parsed.data.name}" already exists` });
    return;
  }

  // If isDefault, clear other defaults first
  if (parsed.data.isDefault) {
    await db.update(presetsTable).set({ isDefault: false });
  }

  const now = new Date();
  const [row] = await db
    .insert(presetsTable)
    .values({
      id: randomUUID(),
      name: parsed.data.name,
      resolution: parsed.data.resolution ?? "1080p",
      fps: parsed.data.fps ?? 24,
      style: (parsed.data.style as typeof presetsTable.$inferSelect["style"]) ?? "cinematic",
      description: parsed.data.description ?? null,
      isDefault: parsed.data.isDefault ?? false,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  res.status(201).json(CreatePresetResponse.parse(toPresetResponse(row)));
});

router.get("/presets/:id", async (req, res): Promise<void> => {
  const params = GetPresetParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(presetsTable)
    .where(or(eq(presetsTable.id, params.data.id), eq(presetsTable.name, params.data.id)));

  if (!row) {
    res.status(404).json({ error: "Preset not found" });
    return;
  }

  res.json(GetPresetResponse.parse(toPresetResponse(row)));
});

router.delete("/presets/:id", async (req, res): Promise<void> => {
  const params = DeletePresetParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select({ id: presetsTable.id })
    .from(presetsTable)
    .where(eq(presetsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Preset not found" });
    return;
  }

  await db.delete(presetsTable).where(eq(presetsTable.id, params.data.id));
  res.status(204).send();
});

export default router;
