const os = require("os");
const fs = require("fs");
const { exec } = require("child_process");

let workers = [];

function getQueueSize() {
  try {
    return fs.readdirSync("jobs/queue/high").length +
           fs.readdirSync("jobs/queue/medium").length +
           fs.readdirSync("jobs/queue/low").length;
  } catch {
    return 0;
  }
}

function spawnWorker() {
  const p = exec("node worker.js");
  workers.push(p);
  console.log("WORKER SPAWNED → total:", workers.length);
}

function killWorker() {
  const w = workers.pop();
  if (w) w.kill();
  console.log("WORKER KILLED → total:", workers.length);
}

function loop() {
  const queueSize = getQueueSize();
  const cpu = os.cpus().length;

  // ⚡ SCALE UP
  if (queueSize > workers.length * 2 && workers.length < cpu * 2) {
    spawnWorker();
  }

  // 🔻 SCALE DOWN
  if (queueSize < workers.length && workers.length > 1) {
    killWorker();
  }

  setTimeout(loop, 1000);
}

console.log("V75 CONTROL CENTER ONLINE");
loop();
EOFcat > control.js << 'EOF'
const os = require("os");
const fs = require("fs");
const { exec } = require("child_process");

let workers = [];

function getQueueSize() {
  try {
    return fs.readdirSync("jobs/queue/high").length +
           fs.readdirSync("jobs/queue/medium").length +
           fs.readdirSync("jobs/queue/low").length;
  } catch {
    return 0;
  }
}

function spawnWorker() {
  const p = exec("node worker.js");
  workers.push(p);
  console.log("WORKER SPAWNED → total:", workers.length);
}

function killWorker() {
  const w = workers.pop();
  if (w) w.kill();
  console.log("WORKER KILLED → total:", workers.length);
}

function loop() {
  const queueSize = getQueueSize();
  const cpu = os.cpus().length;

  // ⚡ SCALE UP
  if (queueSize > workers.length * 2 && workers.length < cpu * 2) {
    spawnWorker();
  }

  // 🔻 SCALE DOWN
  if (queueSize < workers.length && workers.length > 1) {
    killWorker();
  }

  setTimeout(loop, 1000);
}

console.log("V75 CONTROL CENTER ONLINE");
loop();
EOFcat > control.js << 'EOF'
const os = require("os");
const fs = require("fs");
const { exec } = require("child_process");

let workers = [];

function getQueueSize() {
  try {
    return fs.readdirSync("jobs/queue/high").length +
           fs.readdirSync("jobs/queue/medium").length +
           fs.readdirSync("jobs/queue/low").length;
  } catch {
    return 0;
  }
}

function spawnWorker() {
  const p = exec("node worker.js");
  workers.push(p);
  console.log("WORKER SPAWNED → total:", workers.length);
}

function killWorker() {
  const w = workers.pop();
  if (w) w.kill();
  console.log("WORKER KILLED → total:", workers.length);
}

function loop() {
  const queueSize = getQueueSize();
  const cpu = os.cpus().length;

  // ⚡ SCALE UP
  if (queueSize > workers.length * 2 && workers.length < cpu * 2) {
    spawnWorker();
  }

  // 🔻 SCALE DOWN
  if (queueSize < workers.length && workers.length > 1) {
    killWorker();
  }

  setTimeout(loop, 1000);
}

console.log("V75 CONTROL CENTER ONLINE");
loop();
EOFcat > control.js << 'EOF'
const os = require("os");
const fs = require("fs");
const { exec } = require("child_process");

let workers = [];

function getQueueSize() {
  try {
    return fs.readdirSync("jobs/queue/high").length +
           fs.readdirSync("jobs/queue/medium").length +
           fs.readdirSync("jobs/queue/low").length;
  } catch {
    return 0;
  }
}

function spawnWorker() {
  const p = exec("node worker.js");
  workers.push(p);
  console.log("WORKER SPAWNED → total:", workers.length);
}

function killWorker() {
  const w = workers.pop();
  if (w) w.kill();
  console.log("WORKER KILLED → total:", workers.length);
}

function loop() {
  const queueSize = getQueueSize();
  const cpu = os.cpus().length;

  // ⚡ SCALE UP
  if (queueSize > workers.length * 2 && workers.length < cpu * 2) {
    spawnWorker();
  }

  // 🔻 SCALE DOWN
  if (queueSize < workers.length && workers.length > 1) {
    killWorker();
  }

  setTimeout(loop, 1000);
}

console.log("V75 CONTROL CENTER ONLINE");
loop();
EOFcat > control.js << 'EOF'
const os = require("os");
const fs = require("fs");
const { exec } = require("child_process");

let workers = [];

function getQueueSize() {
  try {
    return fs.readdirSync("jobs/queue/high").length +
           fs.readdirSync("jobs/queue/medium").length +
           fs.readdirSync("jobs/queue/low").length;
  } catch {
    return 0;
  }
}

function spawnWorker() {
  const p = exec("node worker.js");
  workers.push(p);
  console.log("WORKER SPAWNED → total:", workers.length);
}

function killWorker() {
  const w = workers.pop();
  if (w) w.kill();
  console.log("WORKER KILLED → total:", workers.length);
}

function loop() {
  const queueSize = getQueueSize();
  const cpu = os.cpus().length;

  // ⚡ SCALE UP
  if (queueSize > workers.length * 2 && workers.length < cpu * 2) {
    spawnWorker();
  }

  // 🔻 SCALE DOWN
  if (queueSize < workers.length && workers.length > 1) {
    killWorker();
  }

  setTimeout(loop, 1000);
}

console.log("V75 CONTROL CENTER ONLINE");
loop();
EOFcat > control.js << 'EOF'
const os = require("os");
const fs = require("fs");
const { exec } = require("child_process");

let workers = [];

function getQueueSize() {
  try {
    return fs.readdirSync("jobs/queue/high").length +
           fs.readdirSync("jobs/queue/medium").length +
           fs.readdirSync("jobs/queue/low").length;
  } catch {
    return 0;
  }
}

function spawnWorker() {
  const p = exec("node worker.js");
  workers.push(p);
  console.log("WORKER SPAWNED → total:", workers.length);
}

function killWorker() {
  const w = workers.pop();
  if (w) w.kill();
  console.log("WORKER KILLED → total:", workers.length);
}

function loop() {
  const queueSize = getQueueSize();
  const cpu = os.cpus().length;

  // ⚡ SCALE UP
  if (queueSize > workers.length * 2 && workers.length < cpu * 2) {
    spawnWorker();
  }

  // 🔻 SCALE DOWN
  if (queueSize < workers.length && workers.length > 1) {
    killWorker();
  }

  setTimeout(loop, 1000);
}

console.log("V75 CONTROL CENTER ONLINE");
loop();
EOFcat > control.js << 'EOF'
const os = require("os");
const fs = require("fs");
const { exec } = require("child_process");

let workers = [];

function getQueueSize() {
  try {
    return fs.readdirSync("jobs/queue/high").length +
           fs.readdirSync("jobs/queue/medium").length +
           fs.readdirSync("jobs/queue/low").length;
  } catch {
    return 0;
  }
}

function spawnWorker() {
  const p = exec("node worker.js");
  workers.push(p);
  console.log("WORKER SPAWNED → total:", workers.length);
}

function killWorker() {
  const w = workers.pop();
  if (w) w.kill();
  console.log("WORKER KILLED → total:", workers.length);
}

function loop() {
  const queueSize = getQueueSize();
  const cpu = os.cpus().length;

  // ⚡ SCALE UP
  if (queueSize > workers.length * 2 && workers.length < cpu * 2) {
    spawnWorker();
  }

  // 🔻 SCALE DOWN
  if (queueSize < workers.length && workers.length > 1) {
    killWorker();
  }

  setTimeout(loop, 1000);
}

console.log("V75 CONTROL CENTER ONLINE");
loop();
