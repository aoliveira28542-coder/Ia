const { spawn } = require("child_process");
const http = require("http");

const services = [
  { name: "broker", cmd: "node broker.js", port: 4000 },
  { name: "api", cmd: "node api.js", port: 3000 },
  { name: "worker1", cmd: "node worker.js" },
  { name: "worker2", cmd: "node worker.js" },
  { name: "dashboard", cmd: "node dashboard.js", port: 5050 }
];

const procs = {};

function start(svc){
  if(procs[svc.name]) return;

  console.log("START:", svc.name);

  const p = spawn("sh", ["-c", svc.cmd], {
    stdio: ["ignore", "pipe", "pipe"]
  });

  p.stdout.on("data", d => console.log(`[${svc.name}] ${d}`));
  p.stderr.on("data", d => console.log(`[${svc.name} ERROR] ${d}`));

  p.on("exit", () => {
    console.log("RESTART:", svc.name);
    setTimeout(() => start(svc), 1000);
  });

  procs[svc.name] = p;
}

function checkPorts(){
  services.forEach(svc=>{
    if(!svc.port) return;

    http.get(`http://localhost:${svc.port}/`, () => {
      console.log("OK:", svc.name);
    }).on("error", () => {
      console.log("DOWN:", svc.name);
      try { procs[svc.name]?.kill(); } catch {}
      delete procs[svc.name];
      start(svc);
    });
  });
}

console.log("V79 SUPERVISOR ONLINE");

services.forEach(start);

setInterval(checkPorts, 3000);
