const http = require("http");

const BROKER = "http://localhost:4000";

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getJob() {
  return new Promise(res => {
    const req = http.get(BROKER + "/get", r => {
      let d = "";

      r.on("data", c => d += c);

      r.on("end", () => {
        try {
          res(JSON.parse(d));
        } catch {
          res({ empty: true });
        }
      });
    });

    req.on("error", () => res({ empty: true }));
  });
}

function finish(id) {
  const req = http.request(BROKER + "/finish", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  req.write(JSON.stringify({ id }));
  req.end();
}

async function loop() {
  while (true) {

    const job = await getJob();

    if (!job || job.empty) {
      await sleep(300);
      continue;
    }

    console.log("V80 PROCESS:", job.id);

    await sleep(200);

    finish(job.id);
  }
}

console.log("V80 WORKER ONLINE");
loop();
