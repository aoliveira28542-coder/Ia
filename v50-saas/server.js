const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/**
 * =========================
 * STORAGE (SIMPLE SAAS LAYER)
 * =========================
 */
function load(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file));
  } catch {
    return fallback;
  }
}

function save(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

let queue = load("./data/queue.json", []);
let results = load("./data/results.json", {});

/**
 * =========================
 * SAAS WORKER (INDEPENDENT LOOP)
 * =========================
 */
let processing = false;

setInterval(() => {
  if (processing) return;
  if (queue.length === 0) return;

  processing = true;

  const job = queue.shift();

  // simulate async work (AI/video/etc)
  setTimeout(() => {
    results[job.id] = {
      ok: true,
      id: job.id,
      prompt: job.prompt,
      output: "v50-saas-result",
      createdAt: Date.now()
    };

    save("./data/results.json", results);
    save("./data/queue.json", queue);

    processing = false;
  }, 700);
}, 250);

/**
 * =========================
 * API LAYER
 * =========================
 */

/**
 * HEALTH / METRICS
 */
app.get("/metrics", (req, res) => {
  res.json({
    ok: true,
    version: "V50-SAAS-CORE",
    queueSize: queue.length,
    resultsCount: Object.keys(results).length,
    uptime: process.uptime()
  });
});

/**
 * CREATE JOB
 */
app.post("/generate", (req, res) => {
  const { prompt } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ ok: false, error: "missing prompt" });
  }

  const job = {
    id: Date.now().toString(),
    prompt,
    status: "queued"
  };

  queue.push(job);

  save("./data/queue.json", queue);

  res.json({
    ok: true,
    jobId: job.id,
    status: "queued"
  });
});

/**
 * GET RESULT
 */
app.get("/result/:id", (req, res) => {
  const r = results[req.params.id];

  if (!r) {
    return res.json({
      ok: false,
      status: "processing"
    });
  }

  res.json(r);
});

/**
 * START SERVER
 */
app.listen(PORT, "0.0.0.0", () => {
  console.log("V50 SAAS CORE RUNNING ON", PORT);
});
