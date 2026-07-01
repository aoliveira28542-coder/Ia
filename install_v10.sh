#!/bin/bash

mkdir -p jobs/{queue,processing,done,error} logs worker output

cat > worker/worker.js <<'JS'
const fs=require("fs");
const path=require("path");
const {execSync}=require("child_process");

const DIRS={
q:"jobs/queue",
p:"jobs/processing",
d:"jobs/done",
e:"jobs/error"
};

for(const d of Object.values(DIRS)) fs.mkdirSync(d,{recursive:true});
fs.mkdirSync("output",{recursive:true});

const sleep=m=>new Promise(r=>setTimeout(r,m));

async function render(job){

const out=`output/${job.id}.mp4`;

try{

job.status="rendering";
job.progress=50;

fs.writeFileSync(
`jobs/processing/${job.id}.json`,
JSON.stringify(job,null,2)
);

execSync(
`ffmpeg -y -f lavfi -i color=c=black:s=1280x720:d=5 -vf "drawtext=text='${job.prompt}':fontsize=40:x=(w-text_w)/2:y=(h-text_h)/2" ${out}`,
{stdio:"ignore"}
);

job.video=out;
job.progress=100;
job.status="done";
job.version="V10";

fs.writeFileSync(
`${DIRS.d}/${job.id}.json`,
JSON.stringify(job,null,2)
);

fs.unlinkSync(`jobs/processing/${job.id}.json`);

console.log("DONE",job.id);

}catch(e){

job.status="error";

fs.writeFileSync(
`${DIRS.e}/${job.id}.json`,
JSON.stringify(job,null,2)
);

}
}


async function worker(id){

console.log("WORKER",id,"ONLINE");

while(true){

let files=fs.readdirSync(DIRS.q)
.filter(f=>f.endsWith(".json"));

for(const f of files){

let src=`${DIRS.q}/${f}`;
let dst=`${DIRS.p}/${f}`;

fs.renameSync(src,dst);

let job=JSON.parse(fs.readFileSync(dst));

await render(job);

}

await sleep(300);

}

}


for(let i=0;i<4;i++) worker(i);

JS


cat > jobs/queue/final-v10.json <<'JSON'
{
"id":"final-v10",
"prompt":"AI VIDEO V10 FINAL PIPELINE",
"status":"queued",
"progress":0
}
JSON


node worker/worker.js
