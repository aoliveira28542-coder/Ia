const bus = require("./eventBus");

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

bus.on("job:new", async (job) => {

  console.log("V81 WORKER RECEIVED:", job.id);

  await sleep(300);

  bus.emit("job:done", job);
});
