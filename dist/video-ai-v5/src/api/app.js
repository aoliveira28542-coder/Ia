"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const prisma = new client_1.PrismaClient();
const connection = new ioredis_1.default(process.env.REDIS_URL);
const videoQueue = new bullmq_1.Queue("video", { connection });
app.post("/jobs", async (req, res) => {
    const { prompt } = req.body;
    const job = await prisma.job.create({
        data: { prompt }
    });
    await videoQueue.add("generate", { jobId: job.id });
    res.json(job);
});
app.get("/jobs", async (_, res) => {
    const jobs = await prisma.job.findMany({
        orderBy: { createdAt: "desc" }
    });
    res.json(jobs);
});
app.listen(3000, () => console.log("API running on 3000"));
