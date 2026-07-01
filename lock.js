const fs = require("fs");
if(fs.existsSync("engine.lock")){
  console.log("ALREADY RUNNING");
  process.exit(0);
}
fs.writeFileSync("engine.lock", String(process.pid));
process.on("exit", ()=> {
  try { fs.unlinkSync("engine.lock"); } catch {}
});
