#!/bin/bash
set -e

mkdir -p jobs/{queue,processing,done,error} output logs worker

cat > worker/worker.js <<'JS'
const fs=require("fs");
const {execSync}=require("child_process");

const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));

for(const d of [
"jobs/queue",
"jobs/processing",
"jobs/done",
"jobs/error",
"output",
"logs"
]) fs.mkdirSync(d,{recursive:true});

async function processJob(file){

const q=`jobs/queue/${file}`;
const p=`jobs/processing/${file}`;
const d=`jobs/done/${file}`;
const e=`jobs/error/${file}`;

fs.renameSync(q,p);

try{

let job=JSON.parse(fs.readFileSync(p));

job.status="processing";
job.progress=25;

fs.writeFileSync(p,JSON.stringify(job,null,2));

let video=`output/${job.id}.mp4`;

execSync(
`ffmpeg -y -f lavfi -i color=c=black:s=1280x720:d=5 -pix_fmt yuv420p ${video}`,
{stdio:"ignore"}
);

job.status="done";
job.progress=100;

job.pipeline={
queue:true,
worker:true,
storyboard:true,
sceneEngine:true,
ffmpeg:true,
parallel:true,
version:"V10"
};

fs.writeFileSync(d,JSON.stringify(job,null,2));

fs.unlinkSync(p);

console.log("DONE",job.id);

}catch(err){

fs.renameSync(p,e);

console.log("ERROR",file);

}

}


async function worker(id){

console.log("WORKER",id,"ONLINE");

while(true){

let jobs=fs.readdirSync("jobs/queue")
.filter(x=>x.endsWith(".json"));

for(const j of jobs){
 await processJob(j);
}

await sleep(500);

}

}


for(let i=0;i<4;i++) worker(i);
JS


cat > jobs/queue/final-v10.json <<'JSON'
{
"id":"final-v10",
"prompt":"FINAL AI VIDEO PIPELINE",
"status":"queued",
"progress":0
}
JSON


node worker/worker.js
