var http = require("http");
var url = require("url");

function start(route) {
  function onRequest(request,response){
    console.log("response received");
    // parse url
    var pathname = url.parse(request.url).pathname;
    console.log("request from "+pathname);
    route(pathname);
    // response
    response.writeHead(202,{"Content-Type":"Text/plain"});
    response.write("Hi world");
    response.end();
  }
  http.createServer(onRequest).listen(8888);
  console.log("server started");
}
exports.start = start;