var libHttp = require('http'); //HTTP协议模块
var config = require("./config"); //配置文件 

var webSvr = libHttp.createServer(function(req, res) {
  res.writeHeader(200, {'Content-Type':'text/html;charset=UTF-8'})
  res.end("DEMO 更新中...");
});

webSvr.listen(config.port, function() {
  console.log('500.js now running at port:'+ config.port );
}).on("error", function(error) {
  console.log(error); //在控制台中输出错误信息 
});
