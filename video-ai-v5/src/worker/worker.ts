import { Worker } from "bullmq";
import IORedis from "ioredis";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const connection = new IORedis(process.env.REDIS_URL!);

const worker = new Worker(
  "video",
  async (job) => {
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
  },
  { connection }
);

console.log("Worker running...");
