const fs = require("fs");

function recover() {
  const processing = fs.readdirSync("jobs/processing");

  for (const file of processing) {
    const src = "jobs/processing/" + file;

    try {
      const job = JSON.parse(fs.readFileSync(src, "utf-8"));

      // devolve pra fila se estava em processamento
      const target = "jobs/queue/high/" + file;

      fs.renameSync(src, target);

      console.log("Recovered job:", file);
    } catch {}
  }
}

recover();
