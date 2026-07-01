import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { Queue } from "bullmq";
import IORedis from "ioredis";

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();
const connection = new IORedis(process.env.REDIS_URL!);

const videoQueue = new Queue("video", { connection });

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
