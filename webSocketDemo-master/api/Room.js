
var extend = require('util')._extend;
var _ = require('lodash');

function UUID(firstletter,length){
  if(!length) length = 16;
  var s = [],hexDigits = "0123456789abcdef";
  if(firstletter)
      hexDigits = "abcdefghijklmnop";

  for (var i = 0; i < length; i++) {
      if(i > 0 && firstletter)
          hexDigits = "0123456789abcdef";

      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  var uuid = s.join("");
  return uuid;
}


// room = {
//   id:uuid,
//   startTime:Date.now(),
//   maxplayer:2,
//   type:"1d" ,"2d" ,"3d"  
//   status:0   // 0: "apply" ,1:"init" , 2:"ready" , 3:"process"
//   player:[{ socket:connectOBJ,place:number }]
// };

var Handler = function(URIarray,req,res){
  var postdata = "",params;
  
  if(req.method == "POST"){
    req.addListener('data', function(chunk){
      postdata += chunk;
    }).addListener('end',function(){
      
      params = JSON.parse(postdata);
      
      var uuid = UUID(true,8),room = {
        player:[],
        projector:[],
        id:uuid,
        startTime:Date.now(),
        maxplayer:params.maxplayer,
        type:params.type,
        roomname:params.roomname,
        status:0
      };
      
      if(!global.ShareMem.rooms[uuid]){
        global.ShareMem.rooms[uuid] = room;
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(uuid);
      }
    })
  }else if(req.method == "GET"){
    var roomlist = [];
    for(key in global.ShareMem.rooms){
      // roomlist.push(global.ShareMem.rooms[key])  //不能直接去推MEMMAP
      var temp = extend({},global.ShareMem.rooms[key]);
      temp.player = temp.player.length;
      temp.projector = temp.projector.length;
      roomlist.push(temp);
    }
    roomlist = _.orderBy(roomlist,['startTime'],['desc']);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(roomlist));
  }else{
    res.writeHead(405, {'Content-Type': 'text/html'});
    res.end("Method Not Allow");
  }
}

module.exports = Handler;
