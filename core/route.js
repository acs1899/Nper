;(function(){
  var url = require('url');

  module.exports = function(req,res){
    var pathname = url.parse(req.url).pathname;
    var type = req.method.toLowerCase();
    var paths = pathname.split('/');
    var controller = paths[1] || 'index';
    var action = paths[2] || 'index';
    var args = paths.slice(3);
    var mod;
    if(type !== 'get'){
      args = req.body;
    }
    try{
      mod = require(__dirname + '/../controller/'+controller+'.js');
    }catch(err){
      handleErr(req,res);
      return
    }
    var method = mod[action];
    if(method){
      method.apply(null,[req,res].concat(args));
    }else{
      handleErr(req,res);
    }
  }

  function handleErr(req,res){
    var type = req.method.toLowerCase();
    switch(type){
      case 'get' : res.redirect('/');break;
      default : res.send({code:500,data:{out:{},err:{}},err:null,msg:'server error'});
    }
  }
})()
