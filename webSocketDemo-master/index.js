global.ShareMem = {
  rooms:{
       "12345678":{
         player:[],
         projector:[],
         id:"12345678",
         startTime:Date.now(),
         maxplayer:2,
         type:"ddd",
         roomname:"厅主最帅",
         status:0
       }
  }
};

var libHttp = require('http'); //HTTP协议模块
var libWs = require("ws");
var config = require("./config"); //配置文件 
var webServerFun = require("./webServer"); //webServer 
var socketServerFun = require("./socketServer"); //webSocketServer

var ip = require('./Util/IpAddress')();
var openBrowser = require('./Util/openDefaultBrowser');
//console.log(config);

var webSvr = libHttp.createServer(webServerFun);

webSvr.listen(config.port, function() {
  openBrowser("http://" + ip + ":" + config.port);
  console.log('now running at port:'+ config.port );
}).on("error", function(error) {
  console.log(error); //在控制台中输出错误信息 
});


var wsSvr = libWs.createServer({
  port:config.wsport,
  maxPayload:config.wsMaxPackageSize
},socketServerFun);

// wsSvr._server.timeout = 1000;

wsSvr.on("error", function(error) {
  console.log(error); //在控制台中输出错误信息 
});

setInterval(function(){
  var now = Date.now();
  for(key in global.ShareMem.rooms){
    // roomlist.push(global.ShareMem.rooms[key])  //不能直接去推MEMMAP
    var temp = global.ShareMem.rooms[key];
    if(now - temp.startTime > 24 * 3600 * 1000 
      && temp.id!="12345678" 
      && temp.projector.length == 0 
      && temp.player.length == 0){
      delete global.ShareMem.rooms[key];
    }
  }
},7200)
