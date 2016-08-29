var config = {
  allowPCDuplicate:true,      //是否允许PC端多开
  maxPCDuplicatCount:2,       //如果多开，设置多开上限数目
  port:4000,
  wsport:4002,
  wsMaxPackageSize:1024             //Byte
}

module.exports = config;

/*
    创建房间的请求是HTTP
    两个服务共享房间数据  
 */