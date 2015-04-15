;(function(){
  var fs = require('fs');
  var gm = require('gm');
  var request = require('request');
  var eventProxy = require('eventproxy');
  var tools = require('../lib/tools.js');
  var init = require('./init.json');

  var staticPath = __dirname + '/..' +init.staticPath;
  var imgPath = init.imgPath;

  module.exports = imgMin;

  /*图片压缩*/
  function imgMin(data,url,callback){
    var ep = new eventProxy(),
        _data = data.data.out,
        imgs = tools.dataFilter(_data,'image').concat(tools.dataFilter(_data,'cssimage')),
        callback = typeof callback == 'function' ? callback : function(){};

    _data.imglist = imgs;
    ep.after('minImg',imgs.length,function(){
      callback();
    });

    /*创建目录*/
    tools.mkd(staticPath+url+imgPath,function(){
      imgs.map(function(v){
        var _name = v.url.split('/').pop();
        if(_name.split('?').length > 1){
          _name = _name.split('?')[0] ? _name.split('?')[0] : _name.split('?')[1];
        }else{
          _name = _name.split('?')[0];
        }
        var file = staticPath+url+imgPath+'/'+ (_name ? _name : '');
        _data.comps[v.key].recmp = 0;
        /*图片是否存在*/
        fs.exists(file,function(ex){
          if(!ex){
            var _fs = fs.createWriteStream(file);
            /*保存图片回调*/
            _fs.on('close',function(chunk){
              /*压缩图片*/
              gm(file)
                .command('convert')
                .in('-quality','50')
                //.in('+dither')
                //.in('-depth','24')
                //.in('-colors','254')
                .write(file,function(err){
                  if(err){
                        console.log(file)
                    ep.emit('minImg');
                    _data.comps[v.key].err = err;
                  }else{
                    fs.stat(file,function(err,stat){
                      if(!err){
                        _data.comps[v.key].recmp = stat.size
                      }
                      ep.emit('minImg');
                    });
                  }
                });
            });
            request(v.url).pipe(_fs);
          }else{
            fs.stat(file,function(err,stat){
              if(!err){
                _data.comps[v.key].recmp = stat.size;
              }
              ep.emit('minImg');
            });
          }
        });
      });
    });
  }
}())
