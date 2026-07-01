"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const connection = new ioredis_1.default(process.env.REDIS_URL);
const worker = new bullmq_1.Worker("video", async (job) => {
    const { jobId } = job.data;
    await prisma.job.update({
        where: { id: jobId },
        data: { status: "processing" }
    });
    for (let i = 0; i <= 100; i += 20) {
        await new Promise(r => setTimeout(r, 500));
        await prisma.job.update({
            where: { id: jobId },
            data: { progress: i }
        });
    }
    await prisma.job.update({
        where: { id: jobId },
        data: { status: "done", progress: 100 }
    });
}, { connection });
console.log("Worker running...");
