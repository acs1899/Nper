;(function(){
  var fs = require('fs');
  var tools = {};

  /*创建目录*/
  function mkd(path,callback){
    var call = typeof callback == 'function' ? callback : function(){};
    fs.exists(path,function(ex){
      if(!ex){
        fs.mkdir(path,function(err){
          if(err){
            /*errno = 34 上级目录不存在*/
            if(err.errno == 34){
              var aPath = path.split('/'), sPath = aPath.pop();
              mkd(aPath.join('/'),function(err){
                /* errno = 47 目录已存在
                 * 这里mkdir是异步操作，当第一次创建script,css,image
                 * 目录时，都会抛出errno=34的错误。当创建了上级目录
                 * 后，由于是异步操作后续的操作才开始创建上级目录
                 * 这时会抛出errno=47错误*/
                if(err && !err.errno == 47){call(err);return}
                mkd(aPath.join('/')+'/'+sPath,call);
              });
            }else{
              call(err)
            }
          }else{call()}
        });
      }else{
        call();
      }
    });
  }

  /*静态文件过滤*/
  function dataFilter(data,type){
    var arr = [];
    /*反转义URL*/
    data.comps.map(function(v,j){
      if(v.type === type){
        arr.push({url:decodeURIComponent(v.url),key:j});
      }
    });
    return arr
  }

  /*过滤URL主域名*/
  function getDomain(url){
    if(typeof url == 'string'){
      var _url = url.match(/[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/);
      return (_url ? _url[0] : '')
    }
  }

  tools.mkd = mkd;
  tools.dataFilter = dataFilter;
  tools.getDomain = getDomain;
  module.exports = tools;
}())
