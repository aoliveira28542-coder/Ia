const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/**
 * V49 STATE
 */
let queue = [];
let results = {};
let processing = false;

/**
 * SNAPSHOT (simple persistence)
 */
function save() {
  fs.writeFileSync("./queue.json", JSON.stringify(queue));
  fs.writeFileSync("./results.json", JSON.stringify(results));
}

function load() {
  try { queue = JSON.parse(fs.readFileSync("./queue.json")); } catch {}
  try { results = JSON.parse(fs.readFileSync("./results.json")); } catch {}
}

load();

/**
 * WORKER (SAFE SINGLE THREAD)
 */
setInterval(() => {
  if (processing) return;
  if (queue.length === 0) return;

  processing = true;

  const job = queue.shift();

  setTimeout(() => {
    results[job.id] = {
      ok: true,
      id: job.id,
      prompt: job.prompt,
      result: "v49-production-result",
      timestamp: Date.now()
    };

    save();
    processing = false;
  }, 600);
}, 300);

/**
 * METRICS
 */
app.get("/metrics", (req, res) => {
  res.json({
    ok: true,
    version: "V49-PRODUCTION-GRADE",
    queue: queue.length,
    results: Object.keys(results).length,
    uptime: process.uptime()
  });
});

/**
 * GENERATE
 */
app.post("/generate", (req, res) => {
  const { prompt } = req.body || {};

  if (!prompt) return res.status(400).json({ ok: false });

  const job = {
    id: Date.now().toString(),
    prompt
  };

  queue.push(job);
  save();

  res.json({
    ok: true,
    jobId: job.id,
    status: "queued"
  });
});

/**
 * RESULT
 */
app.get("/result/:id", (req, res) => {
  const r = results[req.params.id];

  if (!r) return res.json({ ok: false, status: "processing" });

  res.json(r);
});

/**
 * START SAFE
 */
app.listen(PORT, "0.0.0.0", () => {
  console.log("V49 PRODUCTION RUNNING ON", PORT);
});
