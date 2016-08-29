var PC = "PC",MOBILE = "Mobile";

function SetPlayer(playerArray,place,field,value){
  playerArray.forEach(function(item,index){
    if(item['place']==place){
      item[field] = value;
      return false; 
    }
  })
}

function FindPlayer(playerArray,field,value){
  var result = null;
  playerArray.forEach(function(item,index){
    if(item[field]==value){
      result = item;
      return false; 
    }
  })
  return result;
}

//广播消息格式
// {
//   "who":"string",       // Mobile , PC,
//   "place":number,       // 1 2 3 ....
//   "dowhat":"string",    // "connect","ready","message","lost"
// }

function msgPack(){
  return JSON.stringify({
    "who":arguments[0],
    "place":arguments[1],     
    "dowhat":arguments[2],
    "content":arguments[3]||""
  })
} 

function boradCast(room,msg,ignore){
  room.projector.forEach(function(item,index){
    if(ignore&&ignore._ultron.id===item.socket._ultron.id){
      // console.log("ignore!!!")
    }
    else{
      try{
        item.socket.send(msg);
      }catch(e){}
    }
  });
  room.player.forEach(function(item,index){
    if(ignore&&ignore._ultron.id===item.socket._ultron.id){
      // console.log("ignore!!!")
    }
    else{
      try{
        item.socket.send(msg);
      }catch(e){}
    }
  });
}

function Handler(connection){
  console.log(connection._ultron.id);

  //  console.log(connection.upgradeReq);
  var keeplifeHandler;
  var messageCount = 0,platform = (connection.upgradeReq.headers['user-agent'] && connection.upgradeReq.headers['user-agent'].indexOf("Mobile")==-1?PC:MOBILE);
  var roomid = "",place = -1,lastkeeplife = 100;

  connection.on('message',function(msg){
      lastkeeplife = 100;
      var msgObj = {},room = {};
      try{
          msgObj = JSON.parse(msg);
      }catch(e){
          return ;
      }
      if(!msgObj.room)
          return ;

      if(!roomid){
          roomid = msgObj.room;
      }
      room = global.ShareMem.rooms[msgObj.room];
      place = msgObj.place;

      if(messageCount==0 && room){
          if(platform === PC){
              room.projector.push({
                socket:connection
              });
          }
          else if(room.maxplayer > room.player.length && !FindPlayer(room.player,"place",place) ){
              room.player.push({
                  socket:connection,
                  place:place
              });
              boradCast( room, msgPack(platform,place,"connect") , connection );
          }else{
            connection.close();
          }
      }else if(messageCount > 0 && room){
        
          if(platform === PC){   //消息来自投影
            
            if(msgObj.action!="ack"){ //心跳回应 不广播

            }
            
          }else {   //消息来自mobile
//          if(msgObj.action=="ready"){
//            SetPlayer(room.player,place,"adjust",msgObj.msg);
//          }
            if(msgObj.action!="ack"){ //心跳回应 不广播
              boradCast( room, msgPack(platform,place,(msgObj.action||"message"), (msgObj.msg||"{}")) ,connection )
            }
          }
      }else{
        connection.send("Room Not Found")
      }
//    console.log(messageCount);
      messageCount++;
  });

  connection.on('close',function(){
      try{
        if(keeplifeHandler){
          clearInterval(keeplifeHandler);
        }
      }catch(e){
        console.log(e);
      }
      console.log("close!",roomid,place);
      var room = global.ShareMem.rooms[roomid];
      if(!room)
        return;
      
      if(platform === PC){
          room.projector.forEach(function(item,index){
              if(item.socket === connection){
                  room.projector.splice(index,1);
                  return false;
              }
          })
      }else{
          room.player.forEach(function(item,index){
              if(item.socket === connection){
                  room.player.splice(index,1);
                  return false;
              }
          })
      }
      console.log("losted!!");
      boradCast( room, msgPack(platform,place,"lost") , connection );
  });

  connection.on('error',function(msg){
      console.log("error!",msg);
  });
  
  keeplifeHandler = setInterval(function(){
  //  console.log(lastkeeplife,messageCount);
      if( lastkeeplife == -100 ){
        connection.close();
        connection.emit("close");
        clearInterval(keeplifeHandler);
      }
      try{
        lastkeeplife = -100;
        connection.send("{}");
      }catch(e){
        console.log("keep live error! "+ e +"\n\n");
        connection.close();
        connection.emit("close");
        clearInterval(keeplifeHandler);
      }
  },20000)
}
module.exports = Handler;