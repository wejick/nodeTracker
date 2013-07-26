var net = require("net");
var sqlite3 = require("sqlite3");
var db = new sqlite3.Database('./trackerdb',sqlite3.OPEN_READWRITE);

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

      // write request to console
      for(var i = 0;i < req.length;i++){
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
	db.serialize(function(){
	  db.each("SELECT f.id_file,f.nama,f.bitrate,f.samplerate,f.size FROM file as f", function(err,row){
	    socket.write(row.id_file+" "+row.nama+" "+row.bitrate+" "+row.samplerate+" "+row.size);
	  })
	});
	socket.write("FileList requested");
      }
      //get file detail
      function fileDetail(fileId){
	socket.write("FileDetail for "+fileId+" requested");
      }
      function nodeActive(nodeId){
	db.serialize(function(){
	  db.all("SELECT * FROM host WHERE ip='"+nodeId+"'", function(err,row){
	    console.log(row.length < 1);
	    if(row.length < 1) {
	      // add host if we can't find it
	      db.run("INSERT INTO host (ip,active) VALUES ('"+nodeId+"',1)");
	    } else
	      // set node status to active
	      db.run("UPDATE host SET active= 1 WHERE ip='"+nodeId+"'");
	  })
	});
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
