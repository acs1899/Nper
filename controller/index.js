;(function(){
  var path = require('path');
  var index = {};
  index.index = function(req,res){
    var npath = path.resolve('');
    res.sendFile(npath + '/view/index.html');
  }
  module.exports = index;
})()
