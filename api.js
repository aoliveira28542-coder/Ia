const http = require("http");

http.createServer((req,res)=>{

  if(req.url==="/generate" && req.method==="POST"){
    let b="";
    req.on("data",c=>b+=c);
    req.on("end",()=>{

      require("http").request("http://localhost:4000/add",{
        method:"POST",
        headers:{"Content-Type":"application/json"}
      }).end(b);

      res.end(JSON.stringify({ok:true}));
    });
    return;
  }

  res.end("API READY");
}).listen(3000, ()=>console.log("API READY"));
