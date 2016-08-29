var libUrl = require('url'); //URL解析模块 
var libFs = require("fs"); //文件系统模块 
var zlib = require('zlib'); //压缩模块
var libPath = require("path"); //路径解析模块 
var funMap = require('./api/funMap');
var config = require('./config');
var ejs = require("ejs");
var Buffer = require("buffer").Buffer;
var crypto = require("crypto");
              
function md5(data) {
    // var buf = new Buffer(data);         // 0x20 0x12 0x33 0xff
    // var str = buf.toString("binary");   // '20 12 33 ff 33 ....'
    return crypto.createHash("md5").update(data).digest("hex");
}

var parseAPI = function(URIarray,req,res){
  if(funMap[URIarray[2]]){
    res.setHeader('Content-Type', 'text/json');
    funMap[URIarray[2]](URIarray,req,res);
  }else{
    res.writeHead(404, {
      "Content-Type": "text/html"
    });
    res.end("<h1>Function Not Found</h1>");
  }
}


var funGetContentType = function(filePath) {
    var contentType = "";
    //使用路径解析模块获取文件扩展名 
    var ext = libPath.extname(filePath);
    switch (ext) {
      case ".html":
        contentType = "text/html";
        break;
      case ".js":
        contentType = "text/javascript";
        break;
      case ".css":
        contentType = "text/css";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      case ".jpg":
        contentType = "image/jpeg";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".ico":
        contentType = "image/x-icon";
        break;
      default:
        contentType = "application/octet-stream";
    }
    return contentType; //返回内容类型字符串 
  }


var funWebSvr = function(req, res) {
    
    var reqUrl = req.url ,filePath, platform = "m";
    var pathName = libUrl.parse(reqUrl).pathname;
    var params = pathName.split('/');
    
    if (libPath.extname(pathName) == "") {
      //如果路径没有扩展名 
      if(params.length<=2){
        pathName += "/"; //访问根目录 
      }
      else if(params[1]=="api"){
        parseAPI(params,req,res);  //功能函数
        return ;
      }else{
        pathName = params[1]+".html";
      }
    }

    if (pathName.charAt(pathName.length - 1) == "/") {
      pathName += "index.html"; //指定为默认网页 
    }
    
    //判断平台
    if(req.headers['user-agent'] && req.headers['user-agent'].indexOf("Mobile")!=-1){
      // platform = "m"
    }else{
      platform = "p"
//    console.log("pc!!");
    }

    //判断目录
    if(params[1]=="common"){      //公共资源存放目录
      filePath = libPath.join("./webRoot", pathName);
    }else {
      filePath = libPath.join("./webRoot/" + platform, pathName);       
    }
    //判断文件是否存在 
    libFs.exists(filePath, function(exists) {
      if (exists) { //文件存在 
//      if(lastmodified != req.headers['if-modified-since'] ){  //lastmodified 过期
//        //创建只读流用于返回 
          var stream = libFs.createReadStream(filePath, {
            flags: "r",
            encoding: null
          }),chunks = [], size = 0 , content;
          //指定如果流读取错误,返回404错误 
          stream.on("error", function() {
            res.writeHead(404);
            res.end("<h1>404 Read Error</h1>");
          });
          
          //在返回头中写入内容类型 

          stream.on('data', function(chunk) {
            // content+=chunk;  // 这种方法是不对的 buffer 和字符串是有区别的
            chunks.push(chunk);  
            size += chunk.length;  
          }).on('end',function(){
            
            content = new Buffer(size);
            for (var i = 0, pos = 0, l = chunks.length; i < l; i++) {  
              var chunk = chunks[i];  
              chunk.copy(content, pos);  
              pos += chunk.length;  
            }  

            if(libPath.extname(filePath) == ".html"){
              var roomdata = {};
              if(params[1]=="roomdd" || params[1]=="roomddd"){
                var room = global.ShareMem.rooms[params[2]];
                if(room){
                  roomdata = room;
                }else{
                  res.writeHead(404, {
                    "Content-Type": "text/html;charset=UTF-8"
                  });
                  res.end("<h1>Room Not Found</h1>");
                  return ;
                }
              }
              content = ejs.render(content.toString(),{
                config:config,
                data:roomdata
              })
            }

            var etag = md5(content);

            if(etag != req.headers['if-none-match']){ //文件变化

              // 接受压缩类型gzip
              if(req.headers['accept-encoding'] && req.headers['accept-encoding'].indexOf("gzip")!=-1){
                res.writeHead(200, {
                  "Content-Type": funGetContentType(filePath),
                  "Etag":etag,
                  "Cache-Control":"max-age=0",
                  "Content-encoding":"gzip"   // 说明这是压缩的
                });

                res.end(
                  zlib.gzipSync(   //gzip 压缩
                    content
                  )
                ,"binary");

              }else{

                res.writeHead(200, {
                  "Content-Type": funGetContentType(filePath),
                  "Etag":etag,
                  "Cache-Control":"max-age=0",
                  "Accept-Ranges":"bytes"
                });

                res.end(
                    content
                );
              }

            }else{  //文件未变化
              res.writeHead(304,{
                "Content-Type": funGetContentType(filePath),
                "Etag":etag,
              });
              res.end("");
            }
          });

          //连接文件流和http返回流的管道,用于返回实际Web内容 

//      var lastmodified = Date.parse(libFs.statSync(filePath).mtime);
//     if(lastmodified != req.headers['if-modified-since'] ){  //lastmodified 过期
//        //创建只读流用于返回 
//        var stream = libFs.createReadStream(filePath, {
//          flags: "r",
//          encoding: null
//        }),content = "";
//        //指定如果流读取错误,返回404错误 
//        stream.on("error", function() {
//          res.writeHead(404);
//          res.end("<h1>404 Read Error</h1>");
//        });
//        
//        //在返回头中写入内容类型 
//
//        stream.on('data', function(chunk) {
//           content += chunk;
//        }).on('end',function(){
//          res.writeHead(200, {
//            "Content-Type": funGetContentType(filePath),
//            "Last-Modified":lastmodified,
//            "Cache-Control":"max-age=0"
//          });            
//          
//           res.end(
//              ejs.render(content,{
//                config:config
//              })
//            );
//        });
//
//        //连接文件流和http返回流的管道,用于返回实际Web内容 
////        stream.pipe(res);
//      }else{  //lastmodified 没过期
//        res.writeHead(304,{
//          "Content-Type": funGetContentType(filePath),
//          "Last-Modified":lastmodified,
//        });
//        res.end("");
//      }
        
      } else { //文件不存在 
        console.log("not found\n");

        res.writeHead(404, {
          "Content-Type": "text/html"
        });
        res.end("<h1>404 Not Found</h1>");
      }
    });
  }
module.exports = funWebSvr;