#nodeTracker

Tracker for peer to peer audio streaming based node.js

##Protocol

We use plain text in TCP connection to talk with nodeTracker.

###Sintax :
[command];;[option;;[option];;[option]

###Commands :

1. FL (no option)  
  Get files list available in network. You will get string formatted in JSON, containing file id, file name, bitrate, sample rate and size (in byte).  
1. FD;;[file ID]  
  Get information about specific file including available host to get this fail. This command will provie you with this information file id, IP address of host and available host.  
1. NA;;[IP Address]  
  Update host activity status, this command just like ping to tool ensure your host is in active state.
1. UP;;[file id];;[host id];;[block available]  
  Update available files on node including information about available blocks.  
  >[to do] mechanism to delete unavailable files in node  
1. HOSTID (Not yet implemented)  
  Get host id information  
  
 > [To Do]
  Use more familiar name and sintax convention for commands  
