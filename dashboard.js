const http = require("http");

http.createServer((req,res)=>{

  if(req.url==="/"){
    return res.end(`
      <html>
      <body>
      <h1>V78 ENGINE DASHBOARD</h1>
      <pre id="out"></pre>

      <script>
      async function load(){
        const r = await fetch("http://localhost:4000/metrics");
        const d = await r.json();
        document.getElementById("out").textContent =
        JSON.stringify(d,null,2);
      }
      setInterval(load,800);
      load();
      </script>
      </body>
      </html>
    `);
  }

}).listen(5050, ()=>console.log("DASHBOARD V78 ON 5050"));
