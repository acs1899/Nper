;(function(){
  var webPage = require('webpage');
  var system = require('system');
  var page = webPage.create();
  var args = system.args;
  var type = args[2] ? args[2] : 'html';
  var filter = args[3] ? args[3] : '';

  page.open(args[1], function(statu) {
    var out = '';
    if(statu != 'fail'){
      switch(type){
        case 'html' :
          out = page.evaluate(function() {
            return document.getElementsByTagName('html')[0].innerHTML;
          });
          break;
        case 'a' :
          switch(filter){
            case 'crs' :
              out = page.evaluate(function(){
                var local = window.location.host;
                var aList = document.getElementsByTagName('a');
                var getDomain = function(url){
                  if(typeof url == 'string'){
                    var _url = url.match(/[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/);
                    return (_url ? _url[0] : '')
                  }
                }
                var unique = function(arr){
                    var n = {},r = [];
                    for(var i=0,l=arr.length;i<l;i++){
                        var _k = arr[i].host + arr[i].pathname + arr[i].search + arr[i].hash;
                        if(!n[_k]){
                            n[_k] = true;
                            r.push(arr[i].href);
                        }
                    }
                    return r
                }

                for(var i=0,arr=[],l=aList.length;i<l;i++){
                  var host = aList[i].host;
                  var href = aList[i].href;
                  if(host !== local && getDomain(host) && href.toLowerCase().indexOf('javascript:') == -1){
                    arr.push(aList[i]);
                  }
                }
                arr = unique(arr);
                return arr
              });break;
            case 'all' : 
              out = page.evaluate(function(){
                var aList = document.getElementsByTagName('a');
                var getDomain = function(url){
                  if(typeof url == 'string'){
                    var _url = url.match(/[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/);
                    return (_url ? _url[0] : '')
                  }
                }
                var unique = function(arr){
                    var n = {},r = [];
                    for(var i=0,l=arr.length;i<l;i++){
                        var _k = arr[i].host + arr[i].pathname + arr[i].search + arr[i].hash;
                        if(!n[_k]){
                            n[_k] = true;
                            r.push(arr[i].href);
                        }
                    }
                    return r
                }
                

                for(var i=0,arr=[],l=aList.length;i<l;i++){
                  var host = aList[i].host;
                  var href = aList[i].href;
                  if(getDomain(host) && href.toLowerCase().indexOf('javascript:') == -1){
                    arr.push(aList[i]);
                  }
                }
                arr = unique(arr);
                return arr
              });break;
            default : 
              out = page.evaluate(function(){
                var local = window.location.host;
                var aList = document.getElementsByTagName('a');
                var getDomain = function(url){
                  if(typeof url == 'string'){
                    var _url = url.match(/[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/);
                    return (_url ? _url[0] : '')
                  }
                }
                var unique = function(arr){
                    var n = {},r = [];
                    for(var i=0,l=arr.length;i<l;i++){
                        var _k = arr[i].host + arr[i].pathname + arr[i].search + arr[i].hash;
                        if(!n[_k]){
                            n[_k] = true;
                            r.push(arr[i].href);
                        }
                    }
                    return r
                }

                for(var i=0,arr=[],l=aList.length;i<l;i++){
                  var host = aList[i].host;
                  var href = aList[i].href;
                  if(host == local && getDomain(href) && href.toLowerCase().indexOf('javascript:') == -1){
                    arr.push(aList[i]);
                  }
                }
                arr = unique(arr);
                return arr
              });
          }
      }
      console.log(JSON.stringify(out));
      phantom.exit();
    }else{
      console.log(statu);
      phantom.exit();
    }
  });

})()
