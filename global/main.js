//输出全局变量—__filename的值
console.log("当前正在执行的脚本文件名:"+ __filename );

//输出全局变量—__dirname的值
console.log("当前执行的脚本所在的目录:"+ __dirname);

//单次定时器
	function printHello(){
		console.log("Hello world!");
	}
	//两秒后执行以上函数
	var t = setTimeout(printHello,2000);
	//清除定时器
	//clearTimeout(t);

//持续定时器
	function pp(){
		console.log("pp -->hello!");
	}
	//两秒后执行以上函数
	setInterval(pp,2000);

