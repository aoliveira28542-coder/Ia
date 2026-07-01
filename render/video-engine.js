const {exec}=require("child_process");

function render(input,output){

return new Promise((resolve,reject)=>{

exec(
`ffmpeg -y -framerate 24 -i ${input}/%04d.png ${output}`,
(err)=>{

if(err) reject(err);
else resolve(output);

});

});

}

module.exports={render};
