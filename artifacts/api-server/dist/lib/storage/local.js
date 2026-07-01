"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.LocalStorage = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const UPLOADS_DIR = path_1.default.resolve(process.cwd(), "uploads");
class LocalStorage {
    async save(key, data, mime) {
        const filePath = path_1.default.join(UPLOADS_DIR, key);
        await fs_1.promises.mkdir(path_1.default.dirname(filePath), { recursive: true });
        await fs_1.promises.writeFile(filePath, data);
        const stats = await fs_1.promises.stat(filePath);
        return {
            path: key,
            url: `/uploads/${key}`,
            size: stats.size,
        };
    }
    url(storedPath) {
        return `/uploads/${storedPath}`;
    }
    async delete(storedPath) {
        const filePath = path_1.default.join(UPLOADS_DIR, storedPath);
        await fs_1.promises.unlink(filePath).catch(() => undefined);
    }
}
exports.LocalStorage = LocalStorage;
exports.storage = new LocalStorage();
