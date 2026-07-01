function log(event, data){
  console.log(JSON.stringify({
    ts: Date.now(),
    event,
    data
  }));
}

module.exports = { log };
