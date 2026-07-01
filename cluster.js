const cluster = require("cluster");
const os = require("os");

const cpuCount = os.cpus().length;

if (cluster.isPrimary) {
  console.log("V72 CLUSTER MASTER ONLINE");
  console.log("CPUs:", cpuCount);

  function spawnWorker() {
    const worker = cluster.fork();

    worker.on("exit", () => {
      console.log("Worker crashed → restarting...");
      spawnWorker();
    });
  }

  for (let i = 0; i < cpuCount; i++) {
    spawnWorker();
  }

} else {
  require("./worker.js");
}
