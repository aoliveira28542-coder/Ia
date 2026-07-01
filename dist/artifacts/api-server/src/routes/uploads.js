"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const local_1 = require("../lib/storage/local");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter(_req, file, cb) {
        const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error(`Unsupported mime type: ${file.mimetype}`));
        }
    },
});
router.post("/uploads", upload.single("file"), async (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: "No file provided" });
        return;
    }
    const ext = path_1.default.extname(req.file.originalname) || ".png";
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const result = await local_1.storage.save(key, req.file.buffer, req.file.mimetype);
    res.status(201).json({
        url: result.url,
        path: result.path,
        size: result.size,
        mime: req.file.mimetype,
    });
});
exports.default = router;
