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
            /*errno = -2 上级目录不存在*/
            if(err.errno == -2){
              var aPath = path.split('/'), sPath = aPath.pop();
              mkd(aPath.join('/'),function(err){
                if(err && err.errno != -17){call(err);return}
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

  /*删除目录*/
  function rmdir(path) {
    var files = [];
    if( fs.existsSync(path) ) {
      files = fs.readdirSync(path);
      files.forEach(function(file,index){
        var curPath = path + "/" + file;
        if(fs.lstatSync(curPath).isDirectory()) {
          rmdir(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  };

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

  /*随机字符串*/
  function randomStr(num){
    var num = num || 16;
    var str = '';
    var base = 'qwertyuioplkjhgfdsazxcvbnm1230987654'
    for(var i=0;i<num;i++){
        str += base[Math.floor(Math.random()*36)];
    }
    return str
  }

  tools.mkd = mkd;
  tools.rmdir = rmdir;
  tools.dataFilter = dataFilter;
  tools.getDomain = getDomain;
  tools.randomStr = randomStr;
  module.exports = tools;
}())
