const {execFile}=require("child_process");

function sandbox(cmd,args=[]){
 return new Promise((resolve,reject)=>{
  execFile(cmd,args,{
   timeout:300000,
   env:{PATH:process.env.PATH}
  },(e,out,err)=>{
   if(e) reject(e);
   else resolve(out);
  });
 });
}

module.exports={sandbox};
