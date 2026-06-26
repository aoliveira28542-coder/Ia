import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import { storage } from "../lib/storage/local";

const router: IRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported mime type: ${file.mimetype}`));
    }
  },
});

router.post("/uploads", upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file provided" });
    return;
  }

  const ext = path.extname(req.file.originalname) || ".png";
  const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const result = await storage.save(key, req.file.buffer, req.file.mimetype);

  res.status(201).json({
    url: result.url,
    path: result.path,
    size: result.size,
    mime: req.file.mimetype,
  });
});

export default router;
