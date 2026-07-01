const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/**
 * SIMPLE IN-MEMORY QUEUE (V2 LIGHT)
 */
const jobs = [];
const results = {};

function processJob(job) {
  setTimeout(() => {
    results[job.id] = {
      ok: true,
      prompt: job.prompt,
      result: "v2-generated-ok",
      finishedAt: Date.now()
    };
  }, 1000);
}

/**
 * HEALTH CHECK
 */
app.get("/metrics", (req, res) => {
  res.json({
    ok: true,
    version: "V45-CLEAN-V2",
    jobs: jobs.length,
    results: Object.keys(results).length,
    time: new Date().toISOString()
  });
});

/**
 * CREATE JOB (ASYNC STYLE V2)
 */
app.post("/generate", (req, res) => {
  const { prompt } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ ok: false, error: "missing prompt" });
  }

  const job = {
    id: Date.now().toString(),
    prompt
  };

  jobs.push(job);
  processJob(job);

  return res.json({
    ok: true,
    jobId: job.id,
    status: "processing"
  });
});

/**
 * GET RESULT
 */
app.get("/result/:id", (req, res) => {
  const result = results[req.params.id];

  if (!result) {
    return res.json({ ok: false, status: "not_ready" });
  }

  res.json(result);
});

/**
 * START SERVER (DEPLOY READY)
 */
app.listen(PORT, "0.0.0.0", () => {
  console.log("V45 CLEAN V2 RUNNING ON PORT", PORT);
});
