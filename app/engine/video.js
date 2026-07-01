const fs=require("fs");

module.exports=async function(job){

let log=[];

function write(msg){
 log.push({
  time:new Date(),
  msg
 });
 fs.writeFileSync(
  `logs/jobs/${job.id}.json`,
  JSON.stringify(log,null,2)
 );
}

write("ENGINE START");

job.status="processing";
job.progress=10;

for(let p of [25,50,75,100]){

await new Promise(r=>setTimeout(r,800));

job.progress=p;

write("progress "+p);

}

fs.writeFileSync(
`output/${job.id}.mp4`,
"V38 GENERATED VIDEO"
);

write("ENGINE DONE");

return job;

}
