CREATE TABLE file (
    "id_file" INTEGER PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT,
    "bitrate" TEXT,
    "samplerate" TEXT,
    "size" INTEGER
)
CREATE TABLE host (
    "id_host" INTEGER PRIMARY KEY AUTOINCREMENT,
    "ip" TEXT,
	"time" INTEGER, 
	"active" INTEGER)
CREATE TABLE "file_host_rel" (
    "id_rel" INTEGER PRIMARY KEY AUTOINCREMENT,
    "id_file" INTEGER,
    "id_host" INTEGER,
    "block_avail" INTEGER
)
