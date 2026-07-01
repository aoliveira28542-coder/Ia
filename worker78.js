const http = require("http");

const BROKER = "http://localhost:4000";

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getJob() {
  return new Promise(res => {
    const req = http.get(BROKER + "/get", r => {
      let data = "";

      r.on("data", c => data += c);

      r.on("end", () => {
        try {
          res(JSON.parse(data));
        } catch {
          res({ empty: true });
        }
      });
    });

    req.on("error", () => res({ empty: true }));
  });
}

async function loop() {
  while (true) {
    const job = await getJob();

    if (job.empty) {
      await sleep(500);
      continue;
    }

    console.log("PROCESSING:", job.id);
    await sleep(300);
  }
}

console.log("WORKER V78 ONLINE");
loop();
