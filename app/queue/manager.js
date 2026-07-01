const fs=require("fs");
const path=require("path");

const Q="jobs/queue";
const P="jobs/processing";

function next(){

let jobs=fs.readdirSync(Q);

if(!jobs.length) return null;

let file=jobs[0];

let src=path.join(Q,file);
let dst=path.join(P,file);

try{

fs.renameSync(src,dst);

return {
file,
path:dst
};

}catch(e){

return null;

}

}


function stats(){

return {

queue:fs.existsSync(Q)?fs.readdirSync(Q).length:0,

processing:fs.existsSync(P)?fs.readdirSync(P).length:0

};

}


module.exports={next,stats};

