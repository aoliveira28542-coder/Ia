const fs=require("fs");

const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));

async function run(){
console.log("WORKER OK");

while(true){

if(!fs.existsSync("queue")){
await sleep(500);
continue;
}

const files=fs.readdirSync("queue").filter(f=>f.endsWith(".json"));

if(files.length===0){
await sleep(500);
continue;
}

const file=files[0];

try{
fs.renameSync(`queue/${file}`,`processing/${file}`);
}catch(e){
continue;
}

const job=JSON.parse(fs.readFileSync(`processing/${file}`));

console.log("PROCESS",job.id);

await sleep(1000);

job.status="done";

fs.writeFileSync(`done/${file}`,JSON.stringify(job,null,2));

console.log("DONE",job.id);
}
}

run();
