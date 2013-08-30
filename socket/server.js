var net = require("net");
var sqlite3 = require("sqlite3");
var db = new sqlite3.Database('./trackerdb', sqlite3.OPEN_READWRITE);

//untuk simpan socket yang terbuka (per client)
var client = [];

function start() {
	var server = net.createServer(function (socket) {
		socket.setEncoding("UTF8")
		//    socket.write("You're connected to noSock peer to peer tracker \r\n");
		socket.name = socket.remoteAddress;
		console.log("Connection from : " + socket.remoteAddress);
		client.push(socket); // simpan socket ke array client
		var clName = socket.name;
		//event on error
		socket.on("error", function (error) {
			console.log(error);
		});
		//event on data arrive
		socket.on("data", function (data) {
			var command = ['FL', 'FD', 'NA', 'UP', 'UN'];
			data = data.replace(/(\r\n|\n|\r)/gm, ""); // get rid line break at last character
			var req = data.toString().split(";;");
			//socket.write(data);

			// write request to console
			for (var i = 0; i < req.length; i++) {
				console.log(" Query[" + i + "] : " + req[i]);
			}

			//handle command request
			if (req[0] == "FL") {
				fileList();
			} else if (req[0] == "FD")
				fileDetail(req[1]);
			else if (req[0] == "NA")
				nodeActive(socket.remoteAddress);
			else if (req[0] == "UP") {
				// get id_host from ip
				// should not here, but is ok :-) (dirty hack again)
				db.each("SELECT id_host FROM host WHERE ip = '" + socket.remoteAddress + "'",
					function (err, row) {
						var id_host = row.id_host;
						req.push(id_host);
						nodeUpdate(req);
					}
				);
			}
			else if (req[0] == "UN") {
				// get id_host from ip
				// get id_file from filename
				console.log("Request isinya : "+req);
				db.each("SELECT id_host FROM host WHERE ip = '" + socket.remoteAddress + "'",
					function (err, row) {
						var id_host = row.id_host;
						req.push(id_host);
						db.each("SELECT id_file FROM file WHERE nama = '" + req[1] + "'",
							function (err, row) {
								var id_file = row.id_file;
								req.push(id_file);								
								nodeUpdateName(req);
								console.log("Request isinya : "+req);
							}
						);						
					}
				);
			} 
			else if(req[0] == "ADD")
				add(req);
			else
				socket.write("Unspecified Command");

			//command request function

			function fileList() {
				//var pesan = new Array();
				db.serialize(function () {
					db.all("SELECT f.id_file,f.nama,f.bitrate,f.samplerate,f.size FROM file as f", function (err, row) {
						//pesan.push(row);
						//console.log(pesan);
						socket.write(JSON.stringify(row));
						//console.log(JSON.stringify(row));
					});
				});
			}
			//get file detail from active host

			function fileDetail(fileId) {
				db.serialize(function () {
					var query = "SELECT file.nama , host.ip, file_host_rel.block_avail FROM file_host_rel \
INNER JOIN file ON file_host_rel.id_file = file.id_file \
INNER JOIN host ON file_host_rel.id_host = host.id_host \
WHERE host.active = 1 AND file.id_file = " + fileId;
					db.all(query, function (err, row) {
						socket.write(JSON.stringify(row));
						//console.log(row);
						//console.log(query);
					});
				});
			}
			// update node active status

			function nodeActive(nodeId) {
				db.serialize(function () {
					db.all("SELECT * FROM host WHERE ip='" + nodeId + "'", function (err, row) {
						//console.log(row.length < 1);
						var time = new Date;
						if (row.length < 1) {
							// add host if we can't find it
							db.run("INSERT INTO host (ip,active,time) VALUES ('" + nodeId + "',1," + time.getTime() + ")");
						} else
						// set node status to active
							db.run("UPDATE host SET active= 1, time= " + time.getTime() + " WHERE ip='" + nodeId + "'");
						console.log(nodeId + " active");
					})
				});
				socket.write("Node " + nodeId + " is nodeActive");
			}
			// info array of data : 1 id_file, 2 avail_block
			// gimana kalau ada file yang terhapus/ sudah tak tersedia?

			function nodeUpdate(info) {	
				db.serialize(function () {
					console.log(info[3] + " " + socket.remoteAddress);
					db.all("SELECT id_file, id_host FROM file_host_rel where id_file = " + info[1] + " AND id_host = " + info[3],
						function (err, row) {
							if (row == undefined || row.length < 1) {
								var query = "INSERT INTO file_host_rel(id_file, id_host,block_avail) VALUES (" + info[1] + "," + info[3] + "," + info[2] + ")"
								console.log(query);
								db.all(query,
									function (err, row) {
										if (err)
											console.log('');
									}
								);
							} else {
								var query = "UPDATE file_host_rel SET block_avail = " + info[2] + " WHERE id_file = " + info[1] + " AND id_host= " + info[3];
								console.log(query);
								db.all(query,
									function (err, row) {
										if (err)
											console.log('');
									}
								);
							}
						}
					);
				});
			}
			function nodeUpdateName(info) {
			// 0 UN | 1 Filename | 2 block_avail | 3 id_host | 4 id_file
			for (var i = 0; i < info.length; i++) {
				console.log(" UNInfo[" + i + "] : " + info[i]);
			}
				db.serialize(function () {
					console.log(info[3] + " " + socket.remoteAddress);
					db.all("SELECT id_file, id_host FROM file_host_rel where id_file = " + info[4] + " AND id_host = " + info[3],
						function (err, row) {
							if (row == undefined || row.length < 1) {
								var query = "INSERT INTO file_host_rel(id_file, id_host,block_avail) VALUES (" + info[4] + "," + info[3] + "," + info[2] + ")"
								console.log(query);
								db.all(query,
									function (err, row) {
										if (err)
											console.log('');
									}
								);
							} else {
								var query = "UPDATE file_host_rel SET block_avail = " + info[2] + " WHERE id_file = " + info[4] + " AND id_host= " + info[3];
								console.log(query);
								db.all(query,
									function (err, row) {
										if (err)
											console.log('');
									}
								);
							}
						}
					);
				});
			}			
			// add new file
			function add(info) {
				//filename, bitrate, samplerate, size
				var query = "INSERT INTO file(nama,bitrate,samplerate,size) VALUES('"+info[1]+"',"+info[2]+","+info[3]+","+info[4]+")";
				db.serialize(function () { 
					db.run(query);
				});
				console.log("ADD "+query);				
			}
		})
	});
	// set timeout 5 minutes (30000)
	// run node active checking

	function isActive() {
		var now = new Date;
		db.serialize(function () {
			console.log("run is active");
			db.each("select * from host", function (err, row) {
				var diff = now.getTime() - row.time;
				//console.log(diff+" "+now.getTime()+" "+row.time);
				if (diff > 600000) { // more than 10 minutes
					db.run("UPDATE host SET active = 0 WHERE ip = '" + row.ip + "'");
					console.log(row.ip + " is inactive\n");
				} else
					console.log(row.ip + " is active\n");
			});
		});
	}
	setInterval(isActive, 300000);
	server.listen(1337);
}

exports.start = start