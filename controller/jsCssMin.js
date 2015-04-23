;(function(){
  var fs = require('fs');
  var gm = require('gm');
  var path = require('path');
  var request = require('request');
  var eventProxy = require('eventproxy');
  var tools = require('../lib/tools.js');
  var compressor = require('yuicompressor');
  var init = require('../init/init.json');

  var cssPath = init.cssPath;
  var jsPath = init.jsPath;

  module.exports = jsCssMin;

  function jsCssMin(type,data,url,build,callback){
    var _data = data.data.out,
        ep = eventProxy(),
        type = typeof type == 'string' ? type : 'js',
        files = tools.dataFilter(_data,type),
        callback = typeof callback == 'function' ? callback : function(){};
    var filePath = '';
    switch(type){
      case 'js' : filePath = jsPath;break;
      case 'css' : filePath = cssPath;break;
      default : filePath = jsPath;
    }

    _data[type+'list'] = files;
    ep.after('fileSave',files.length,function(){
      callback();
    });

    /*创建目录*/
    tools.mkd(build,function(){
      files.map(function(v){
        var _name = v.url.split('/').pop();
        if(_name.split('?').length > 1){
          _name = _name.split('?')[0] ? _name.split('?')[0] : _name.split('?')[1];
        }else{
          _name = _name.split('?')[0];
        }
        var file = build+'/'+ (_name ? _name : '');
        _data.comps[v.key].recmp = 0;

        /*文件是否存在*/
        fs.exists(file,function(ex){
          if(!ex){
            var _fs = fs.createWriteStream(file);
            /*保存文件回调*/
            _fs.on('close',function(){
              compressor.compress(file,{
                type : type,
                nomunge : false,
                'preserve-semi' : true
              },function(err,data,extra){
                if(!err){
                  fs.writeFile(file,data,function(){
                    _data.comps[v.key].recmp = fs.statSync(file).size;
                    ep.emit('fileSave');
                  });
                }else{
                  _data.comps[v.key].err = err;
                  ep.emit('fileSave');
                }
              });
            });
            request(v.url).pipe(_fs);
          }else{
            fs.stat(file,function(err,stat){
              if(!err){
                _data.comps[v.key].recmp = stat.size;
              }
              ep.emit('fileSave');
            });
          }
        });
      });
    });
  }
}())
