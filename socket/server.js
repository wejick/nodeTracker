var net = require("net");

//untuk simpan socket yang terbuka (per client)
var client=[];

function start(){
  var server = net.createServer(function(socket){
    socket.setEncoding("ascii")
    socket.write("You're connected to noSock peer to peer tracker \r\n");
    socket.name = socket.remoteAddress;
    console.log("Connection from : "+socket.remoteAddress);
    client.push(socket); // simpan socket ke array client
    var clName=socket.name;
    //event on data arrive
    socket.on("data",function(data){
      
      function fileList(){

      }
    })
  });
server.listen(1337);
}

exports.start=start
