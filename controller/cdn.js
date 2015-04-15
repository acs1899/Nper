;(function(){
  var tools = require('../lib/tools.js');
  module.exports = cdn;

  /*CDN使用*/
  function cdn(data,cdns,callback){
    var callback = typeof callback == 'function' ? callback : function(){};
    data.comps.map(function(v){
      var type = v.type;
      var _url = tools.getDomain(decodeURIComponent(v.url));
      v.cdn = false;
      if(type == 'js' || type == 'image' || type == 'cssimage'){
        cdns.map(function(p){
          var reg = new RegExp('\.?'+p+'$','ig');
          reg.test(_url) && !!p && (v.cdn = true)
          return p
        });
      }
    });
    callback();
  }
}())
