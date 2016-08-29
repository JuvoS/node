var buf1 = new Buffer('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

var buf2 = new Buffer(10);
buf1.copy(buf2,0,5,10);

console.log("buf2 content:" + buf2.toString());
