const fs=require("fs");

const ID=process.argv[2]||"W1";

console.log("V43 WORKER ONLINE",ID);


function run(){

let files=fs.readdirSync("jobs/queue");

if(!files.length)return;


let file=files[0];


try{

fs.renameSync(
"jobs/queue/"+file,
"jobs/processing/"+file
);


let job=JSON.parse(
fs.readFileSync("jobs/processing/"+file)
);


job.worker=ID;
job.status="processing";
job.started=new Date();


fs.writeFileSync(
"jobs/processing/"+file,
JSON.stringify(job,null,2)
);


setTimeout(()=>{


job.status="done";
job.progress=100;
job.finished=new Date();


fs.writeFileSync(
"output/"+job.id+".json",
JSON.stringify(job,null,2)
);


fs.renameSync(
"jobs/processing/"+file,
"jobs/done/"+file
);


console.log(
"V43 DONE",
ID,
job.id
);


},2000);


}catch(e){}


}


setInterval(run,500);

