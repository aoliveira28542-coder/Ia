function createScenes(prompt){
 return [
  {
   scene:1,
   prompt: prompt + " cinematic wide shot",
   camera:"dolly",
   duration:4
  },
  {
   scene:2,
   prompt: prompt + " close cinematic shot",
   camera:"tracking",
   duration:4
  }
 ];
}

module.exports={createScenes};
