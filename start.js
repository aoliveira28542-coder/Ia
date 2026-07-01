const { spawn } = require("child_process");
const fs = require("fs");
const { canRestart } = require("./cooldown");

const running = new Map();

function run(name, file, delay) {
  setTimeout(() => {

    if (running.has(name)) return;

    const p = spawn("node", [file], { stdio: "inherit" });

    running.set(name, p);

    p.on("exit", () => {
      running.delete(name);

      console.log(name + " caiu");

      if (!canRestart()) {
        console.log("RESTART BLOQUEADO (COOLDOWN GLOBAL)");
        return;
      }

      setTimeout(() => run(name, file, 0), 3000);
    });

  }, delay);
}

console.log("V77 FINAL STABLE ENGINE BOOT");

run("cluster", "cluster.js", 0);
run("worker", "worker.js", 1000);
run("api", "api.js", 2000);
run("stream", "stream.js", 3000);
