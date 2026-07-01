const http = require("http");

const PORT = 3002;

let server = null;

function start() {
  if (server) return;

  server = http.createServer((req, res) => {
    if (req.url === "/state") {
      return res.end(JSON.stringify({ ok: true }));
    }
    res.end("V77 STREAM OK");
  });

  server.listen(PORT, () => {
    console.log("STREAM ON:", PORT);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log("STREAM já rodando → não reinicia duplicado");
      process.exit(0);
    } else {
      console.log("STREAM ERROR:", err.message);
      process.exit(1);
    }
  });
}

start();
