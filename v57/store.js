const fs = require("fs");

function read(p,f){
  try { return JSON.parse(fs.readFileSync(p)); }
  catch { return f; }
}

function write(p,d){
  fs.writeFileSync(p, JSON.stringify(d,null,2));
}

module.exports = { read, write };
