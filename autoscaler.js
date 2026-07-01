const http = require("http");
const { spawn } = require("child_process");
const registry = require("./registry");

function metrics() {
  return new Promise(res => {
    http.get("http://localhost:4000/metrics", r => {
      let d = "";

      r.on("data", c => d += c);

      r.on("end", () => {
        try {
          res(JSON.parse(d));
        } catch {
          res(null);
        }
      });

    }).on("error", () => res(null));
  });
}

function spawnWorker() {
  const w = spawn("node", ["worker80.js"]);

  registry.add(w);

  w.on("exit", () => {
    registry.remove(w);
  });

  console.log("WORKER UP:", registry.size());
}

function killWorker() {
  const arr = Array.from(registry.workers);
  const w = arr.pop();

  if (w) {
    w.kill();
    registry.remove(w);
    console.log("WORKER DOWN:", registry.size());
  }
}

async function loop() {
  while (true) {

    const m = await metrics();

    if (!m) {
      console.log("BROKER OFFLINE");
      await new Promise(r => setTimeout(r, 1000));
      continue;
    }

    const load = m.queued + m.processing;

    const target = Math.max(1, Math.ceil(load / 2));

    const current = registry.size();

    if (current < target) spawnWorker();
    if (current > target) killWorker();

    await new Promise(r => setTimeout(r, 1000));
  }
}

console.log("V80 AUTOSCALER ONLINE");
loop();
