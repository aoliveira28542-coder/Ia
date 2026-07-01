const http = require("http");
const fs = require("fs");

const DB = "./queue.json";
let queue = [];

try { queue = JSON.parse(fs.readFileSync(DB)); } catch {}

function save(){
  fs.writeFileSync(DB, JSON.stringify(queue, null, 2));
}

http.createServer((req,res)=>{

  if(req.url==="/add" && req.method==="POST"){
    let b="";
    req.on("data",c=>b+=c);
    req.on("end",()=>{
      const job = JSON.parse(b);
      job.id = Date.now();
      job.status="queued";
      queue.push(job);
      save();
      res.end(JSON.stringify({ok:true}));
    });
    return;
  }

  if(req.url==="/get"){
    const job = queue.find(j=>j.status==="queued");
    if(!job) return res.end(JSON.stringify({empty:true}));
    job.status="processing";
    save();
    return res.end(JSON.stringify(job));
  }

  if(req.url==="/done" && req.method==="POST"){
    let b="";
    req.on("data",c=>b+=c);
    req.on("end",()=>{
      const d = JSON.parse(b);
      const j = queue.find(x=>x.id===d.id);
      if(j) j.status="done";
      save();
      res.end("ok");
    });
    return;
  }

  if(req.url==="/status"){
    return res.end(JSON.stringify({
      queued: queue.filter(x=>x.status==="queued").length,
      processing: queue.filter(x=>x.status==="processing").length,
      done: queue.filter(x=>x.status==="done").length
    }));
  }

  res.end("OK");
}).listen(4000, ()=>console.log("BROKER READY"));
