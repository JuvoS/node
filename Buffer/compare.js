var buf1 = new Buffer('ABC');
var buf2 = new Buffer('ABCD');
var result = buf1.compare(buf2);

if(result<0){
	console.log(buf1+"在"+buf2+"前部分相同");
}else if(result==0){
	console.log(buf1+"在"+buf2+"全部相同");
}else{
	console.log(buf1+"在"+buf2+"后部分相同");
}
