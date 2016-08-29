var funMap = require('./socketAPI/funMap');

var connectHandler = function(connection){
  // :4002/api/fda/feqf/few/  msg={}
  var URIarray = connection.upgradeReq.url.split("/")
  if(funMap[URIarray[2]]){
    funMap[URIarray[2]](connection);
  }else{
    connection.send("{err:Function Not Found!!}");
  }
}

//
//server.listen(3001);
module.exports = connectHandler;