var child_process = require('child_process');

var cmd;
if (process.platform === 'win32') {
  cmd = "start";
//var regDefault = child_process.execSync("REG QUERY HKEY_CLASSES_ROOT\\http\\shell\\open\\command /ve",{encoding:"utf8"}).split("    ");
//if(regDefault.length>=4){
//  cmd = regDefault[3].split(" ")[0];
//}else{
//  cmd = 'start "%ProgramFiles%\Internet Explorer\iexplore.exe"';
//}
} else if (process.platform === 'linux') {
  cmd = 'xdg-open';
} else if (process.platform === 'darwin') {
  cmd = 'open';
}

module.exports = function (uri) {
  if (process.platform === 'win32'){
     child_process.exec(cmd + ' ' + uri );
  }else{
    child_process.exec(cmd + ' "' + uri + '"');
  }
};