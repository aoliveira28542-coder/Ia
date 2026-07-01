const { spawn } = require("child_process");

console.log("🚀 BOOT AUTO FIX 2L");

spawn("node", ["server.js"], { stdio: "inherit" });
spawn("node", ["worker.js"], { stdio: "inherit" });

console.log("🔥 SISTEMA ONLINE FIXO");