import { promises as fs } from "fs";
import path from "path";
import { type StorageProvider, type SaveResult } from "./provider";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

export class LocalStorage implements StorageProvider {
  async save(key: string, data: Buffer, mime: string): Promise<SaveResult> {
    const filePath = path.join(UPLOADS_DIR, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data);

    const stats = await fs.stat(filePath);
    return {
      path: key,
      url: `/uploads/${key}`,
      size: stats.size,
    };
  }

  url(storedPath: string): string {
    return `/uploads/${storedPath}`;
  }

  async delete(storedPath: string): Promise<void> {
    const filePath = path.join(UPLOADS_DIR, storedPath);
    await fs.unlink(filePath).catch(() => undefined);
  }
}

export const storage = new LocalStorage();
