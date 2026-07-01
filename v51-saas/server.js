const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

/**
 * =========================
 * STORAGE LAYER
 * =========================
 */
function read(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file));
  } catch {
    return fallback;
  }
}

function write(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/**
 * STATE
 */
let queue = read("./data/queue.json", []);
let results = read("./data/results.json", {});
let lock = false;

/**
 * =========================
 * V51 WORKER (ISOLATED LOGIC)
 * =========================
 */
function worker() {
  if (lock) return;
  if (queue.length === 0) return;

  lock = true;

  const job = queue.shift();

  setTimeout(() => {
    results[job.id] = {
      ok: true,
      id: job.id,
      prompt: job.prompt,
      output: "v51-saas-result",
      createdAt: Date.now()
    };

    write("./data/results.json", results);
    write("./data/queue.json", queue);

    lock = false;
  }, 500);
}

/**
 * LOOP WORKER (SEPARATED FROM API)
 */
setInterval(worker, 200);

/**
 * =========================
 * API
 * =========================
 */

app.get("/metrics", (req, res) => {
  res.json({
    ok: true,
    version: "V51-PRODUCTION-SAAS",
    queue: queue.length,
    results: Object.keys(results).length
  });
});

app.post("/generate", (req, res) => {
  const { prompt } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ ok: false });
  }

  const job = {
    id: Date.now().toString(),
    prompt
  };

  queue.push(job);
  write("./data/queue.json", queue);

  res.json({
    ok: true,
    jobId: job.id,
    status: "queued"
  });
});

app.get("/result/:id", (req, res) => {
  const r = results[req.params.id];

  if (!r) {
    return res.json({ ok: false, status: "processing" });
  }

  res.json(r);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("V51 SAAS RUNNING ON", PORT);
});
