const fs = require("fs");

const JOBS="./jobs";
const RESULTS="./results";

setInterval(()=>{

  const jobs = fs.readdirSync(JOBS);
  if(!jobs.length) return;

  const file = jobs[0];
  const job = JSON.parse(fs.readFileSync(`${JOBS}/${file}`));

  const result = {
    ok:true,
    id: job.id,
    prompt: job.prompt,
    result:"V66-FILE-OK"
  };

  fs.writeFileSync(
    `${RESULTS}/${job.id}.json`,
    JSON.stringify(result)
  );

  fs.unlinkSync(`${JOBS}/${file}`);

},300);

console.log("V66 WORKER RUNNING");
