var buffer1=new Buffer('学习Node.js');
var buffer2=new Buffer(' JuvoS在学习');
var buffer3=Buffer.concat([buffer1,buffer2]);

console.log("concat之后的内容："+buffer3.toString());
