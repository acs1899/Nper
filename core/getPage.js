;(function(){
  var webPage = require('webpage');
  var page = webPage.create();
  var args = phantom.args;
  var type = args[1] ? args[1] : 'html';
  page.open(args[0], function(statu) {
    var out = '';
    if(statu != 'fail'){
      switch(type){
        case 'html' :
          out = page.evaluate(function() {
            return document.getElementsByTagName('html')[0].innerHTML;
          });
          break;
        case 'a' :
          out = page.evaluate(function() {
            var aList = document.getElementsByTagName('a'),arr=[];
            for(var i=0,l=aList.length;i<l;i++){
              arr.push(aList[i].href);
            }
            return arr
          });
      }
      console.log(JSON.stringify(out));
      phantom.exit();
    }else{
      console.log(statu);
      phantom.exit();
    }
  });
})()
