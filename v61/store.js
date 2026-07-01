const fs = require("fs");

function read(path, fallback){
  try {
    return JSON.parse(fs.readFileSync(path));
  } catch {
    return fallback;
  }
}

function write(path, data){
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

module.exports = { read, write };
