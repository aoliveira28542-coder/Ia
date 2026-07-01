const express=require("express");
const fs=require("fs");

const app=express();

app.use(express.json());

app.get("/version",(req,res)=>{
res.json({
version:"V43-FLASH",
engine:"multi-worker"
});
});


app.get("/status",(req,res)=>{

res.json({
version:"V43-FLASH",
queue:fs.existsSync("jobs/queue")?fs.readdirSync("jobs/queue"):[],
processing:fs.existsSync("jobs/processing")?fs.readdirSync("jobs/processing"):[],
done:fs.existsSync("jobs/done")?fs.readdirSync("jobs/done"):[],
});

});


app.post("/generate",(req,res)=>{

const id=Date.now().toString();

fs.mkdirSync("jobs/queue",{recursive:true});

const job={
id,
prompt:req.body.prompt,
status:"queued",
created:new Date()
};


fs.writeFileSync(
`jobs/queue/${id}.json`,
JSON.stringify(job,null,2)
);


res.json(job);

});


app.listen(3000,()=>{
console.log("V43 FLASH ONLINE");
});
