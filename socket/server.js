var net = require("net");
var sqlite3 = require("sqlite3");
var db = new sqlite3.Database('./trackerdb',sqlite3.OPEN_READWRITE);

//untuk simpan socket yang terbuka (per client)
var client=[];

function start(){
  var server = net.createServer(function(socket){
    socket.setEncoding("UTF8")
//    socket.write("You're connected to noSock peer to peer tracker \r\n");
    socket.name = socket.remoteAddress;
    console.log("Connection from : "+socket.remoteAddress);
    client.push(socket); // simpan socket ke array client
    var clName=socket.name;
    //event on error
    socket.on("error",function(error) {
	console.log(error);
      }
    );
    //event on data arrive
    socket.on("data",function(data){
      var command = ['FL','FD','NA'];
      data = data.replace(/(\r\n|\n|\r)/gm,""); // get rid line break at last character
      var req = data.toString().split(";;");
      //socket.write(data);

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
	nodeActive(socket.remoteAddress);
      else if(req[0] == "UP")
	nodeUpdate(req);
      else
	socket.write("Unspecified Command");
      
      //command request function
      function fileList(){
	//var pesan = new Array();
	db.serialize(function(){
	  db.all("SELECT f.id_file,f.nama,f.bitrate,f.samplerate,f.size FROM file as f", function(err,row){
	    //pesan.push(row);
	    //console.log(pesan);
	    socket.write(JSON.stringify(row));
	    console.log(JSON.stringify(row));
	  });
	});
      }
      //get file detail
      function fileDetail(fileId){
	db.serialize(function(){
	  var query = "select f.id_file, h.ip, hfr.block_avail from file as f, file_host_rel as hfr , host as h where f.id_file = "+fileId+" AND hfr.id_file="+fileId;
	  db.all(query,function(err,row){
	    socket.write(JSON.stringify(row));
	//	console.log(row);
	//	console.log(query);
	  });
	}
	);
      }
      // update node active status
      function nodeActive(nodeId){
	db.serialize(function(){
	  db.all("SELECT * FROM host WHERE ip='"+nodeId+"'", function(err,row){
	    //console.log(row.length < 1);
		var time = new Date;
	    if(row.length < 1) {
	      // add host if we can't find it
	      db.run("INSERT INTO host (ip,active,time) VALUES ('"+nodeId+"',1,"+time.getTime()+")");
	    } else
	      // set node status to active
	      db.run("UPDATE host SET active= 1, time= "+time.getTime()+"WHERE ip='"+nodeId+"'");
	  })
	});
	socket.write("Node "+nodeId+" is nodeActive");
      }
      // info array of data : 1 id_file, 2 id_host, 3 avail_block
      // gimana kalau ada file yang terhapus/ sudah tak tersedia?
      function nodeUpdate(info){
	db.serialize(function(){
	  db.all("SELECT id_file, id_host FROM file_host_rel where id_file = "+info[1]+" AND id_host = "+info[2],
	    function(err,row){
	      //console.log("SELECT id_file, id_host FROM file_host_rel where id_file = "+info[1] +" AND id_host = "+info[2]);
	      console.log(row);
	      console.log(row == undefined || row.length < 1);
	      if(row == undefined || row.length < 1){
		var query = "INSERT INTO file_host_rel(id_file, id_host,block_avail) VALUES ("+info[1]+","+info[2]+","+info[3]+")"
		db.all(query,function(err,row){
		  if(err)
		    console.log('');
		}
		);
		console.log(query);
	      } else {
		var query = "UPDATE file_host_rel SET id_file = "+info[1]+", id_host = "+info[2]+", block_avail = "+info[3];
		db.all(query,function(err,row){
		  if(err)
		    console.log('');
		});
	      }
	    }
	  );
	  //socket.write("NodeUpdate executed");
      });
      }
    })
  });
server.listen(1337);
}

exports.start=start
