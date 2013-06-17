var net = require("net");

//untuk simpan socket yang terbuka (per client)
var client=[];

function start(){
  var server = net.createServer(function(socket){
    socket.setEncoding("utf8")
    socket.write("Wellcome to GEGE chat\r\n");
    socket.pipe(socket); 
    socket.name = socket.remoteAddress;
    console.log("Connection from : "+socket.remoteAddress);
    broadcast(socket.name+" joined this room");
    client.push(socket); // simpan socket ke array client
    var clName=socket.name;
    //event on data arrive
    socket.on("data",function(data){
      console.log(data);
      var query = data.split(" ");
      console.log(query[0].substr(0.0));
      if(query[0].substr(0.0)==":"){
	switch(command(query[0])) {
	  case 1:
	    setName(query[2]);
	    break;
	  case 2:
	    helpMessage();
	    break;
	  default:
	    broadcast(clName+" : "+data,socket);
	    break
	}
      }
    });
    //command handler
    function command(command){
      if(command == ":name")
	return 1;
      else(command == ":help")
	return 2;
      
      return 10;
    }
    function helpMessage(){
      socket.write("Available command\n");
      socket.write(":name to change name\n");
    }
    function setName(name){
      clName = name;
      socket.write("Welcome "+clName);
    }
    //socket specific function
    function broadcast(message,sender){
      client.forEach(function(client){
      if(client==sender)  return; // jangan kirim ke diri sendiri
	client.write(message);
      });
    }
  });
  server.listen(1337);
}
exports.start=start