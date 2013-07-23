var net = require("net");
var util = require("util");

//untuk simpan socket yang terbuka (per client)
var client=[];

function start(){
  var server = net.createServer(function(socket){
    socket.setEncoding("UTF8")
    socket.write("You're connected to noSock peer to peer tracker \r\n");
    socket.name = socket.remoteAddress;
    console.log("Connection from : "+socket.remoteAddress);
    client.push(socket); // simpan socket ke array client
    var clName=socket.name;
    //event on data arrive
    socket.on("data",function(data){
      var command = ['FL','FD','NA'];
      data = data.replace(/(\r\n|\n|\r)/gm,""); // get rid line break at last character
      var req = data.toString().split(";");
      socket.write(data);
      
      for(var i = 0;i < req.length;i++){
	  socket.write(" Query["+i+"] : "+req[i]);
	  console.log(" Query["+i+"] : "+req[i]);
      }
      
      //handle command request
      if(req[0] == "FL") {
	fileList();
      }
      else if(req[0] == "FD")
	fileDetail(req[1]);
      else if(req[0] == "NA")
	nodeActive(req[1]);
      else
	socket.write("Unspecified Command");
      
      //command request function
      function fileList(){
	socket.write("FileList requested");
      }
      function fileDetail(fileId){
	socket.write("FileDetail for "+fileId+" requested");
      }
      function nodeActive(nodeId){
	socket.write("Node "+nodeId+" is nodeActive");
      }
      // info is json data : nodeId, fileId, available block
      function nodeUpdate(info){
	socket.write("NodeUpdate executed");
      }
    })
  });
server.listen(1337);
}

exports.start=start
