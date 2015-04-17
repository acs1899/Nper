$(function(){
  var body = $('body'),
      input = $('.url'),
      btn = $('.submit-url'),
      lt = $('.total-time'),
      r = $('.total-req'),
      dt = $('.total-download'),
      tableBox = $('.table-responsive'),
      resultArea = $('.result-area'),
      cdns = ['sae.sinacdn.com'];

  function deal(_data){
    var total = 0;
    for(var i=0,l=_data.comps.length;i<l;i++){
      total += _data.comps[i].size;
      var __data = _data.comps[i];
      __data.url = decodeURIComponent(__data.url);
      if(__data.type == 'js' || __data.type == 'css' || __data.type == 'image' || __data.type == 'cssimage'){
        if(!__data.err){
          __data.cmr = (((__data.recmp-__data.size)/__data.size)*100);
          if(__data.cmr < 0){
            __data.cmr = __data.cmr.toFixed(2)+'%';
            __data.recmp = dealSize(__data.recmp);
          }else{
            __data.cmr = '';
            __data.recmp = '';
          }
        }else{
          __data.cmr = '';
          __data.recmp = '';
        }
      }
      __data.size = dealSize(__data.size);
      var resp = __data.resp;
      var exp = (__data.headers.response['Cache-Control']+'').match(/max-age=(\d+)/);
      exp = exp ? parseInt(exp[1]) : 0;
      __data.resp = dealReqTime(resp);
      __data.exp = dealCacheTime(exp);
    }

    lt.text(dealReqTime(_data.lt)).prev().removeClass('hide');
    r.text(_data.r).prev().removeClass('hide');
    dt.text(dealSize(total)).prev().removeClass('hide');
    var html = template('resultTable',_data);
    tableBox.html('').append(html);
    en();

    var trs = $('.table-reqs tbody tr');

    function toogleTable(classNa){
      trs.each(function(i,v){
        var $this = $(this);
        var k = 0;
        switch(true){
          case isArray(classNa) :
            $.each(classNa,function(i,v){
              if($this.hasClass(v)){
                $this.fadeIn();
                k = 1;
                return false
              }
            });
            if(!k){$this.fadeOut();}
            break;
          case typeof classNa == 'string' :
            if($this.hasClass(classNa)){
              $this.fadeIn();
            }else{$this.fadeOut();}
            break;
          default : $this.fadeIn();
        }
      });
    }

    $('.type-change').on('click',function(event){
      var a = event.target;
      var $a = $(a);
      var lis = $a.parents('.type-change').find('li');
      lis.removeClass('active');
      $a.parent().addClass('active');
      switch(true){
        case a.className == 'img-req' : toogleTable(['image','cssimage']);break;
        case a.className == 'scr-req' : toogleTable('js');break;
        case a.className == 'css-req' : toogleTable('css');break;
        default : toogleTable();
      }
    });

  }

  function isArray(arr){
    return Object.prototype.toString.call(arr) == '[object Array]'
  }

  function isNum(n){
    return typeof n === 'number' ? true : false
  }

  function dealSize(size){
    var size = isNum(size) ? size : 0;
    switch(true){
      case size/1024 < 1 : size = size + 'B';break;
      case size/1048576 < 1 : size = (size/1024).toFixed(2) + 'KB';break;
      case size/1073741824 < 1 : size = (size/1048576).toFixed(2) + 'MB';break;
    }
    return size
  }

  function dealReqTime(time){
    var time = isNum(time) ? time : 0;
    switch(true){
      case time/1000 < 1 : time = time+'ms';break;
      default: time = (time/1000).toFixed(2)+'s';
    }
    return time
  }

  function dealCacheTime(time){
    var time = isNum(time) ? time : 0;
    switch(true){
      case time == 0 : time = 'no-cache';break;
      case time/3600 < 1 : time = '<1小时';break;
      case time/86400 < 1 : time = (time/3600).toFixed(2)+'小时';break;
      case time/2591999 < 1 : time = parseInt(time/86400)+'天';break;
      case time/31104000 < 1 : time = parseInt(time/2592000)+'月';break;
      default : time = parseInt(time/31104000)+'年';
    }
    return time
  }
  
  var mutex = false;
  function fetchUrl(){
    if(!mutex){
      mutex = true;
      $.ajax({
        url:'/phan/analyse',
        type:'POST',
        data:{'url':encodeURIComponent(input.val()),'cdns':cdns},
        error:function(){
          en();
        },
        success:function(data){
          if(data.code === 200){
            var _data = data.data.out;
            deal(_data);
          }else{
            input.focus();
            en();
          }
          mutex = false;
        }
      });
    }
  }

  function dis(){
    btn.addClass('loading').prop('disabled',true);
    resultArea.css('opacity',0.5);
  }

  function en(){
    btn.removeClass('loading').prop('disabled',false);
    resultArea.css('opacity',1);
  }

  function ValidURL(str) {
    var reg = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|(www\\.)?){1}([0-9A-Za-z-\\.@:%_\‌​+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");
    if(!reg.test(str)) {
      return false;
    } else {
      return true;
    }
  }

  function alert(){
    var old = $('#phanModal');
  }

  function goSearch(){
    var val = input.val();
    if(ValidURL(val)){
      dis();
      fetchUrl();
    }else{
      input.focus();
    }
  }

  function init(){
    btn.on('click',goSearch);
    input.on('keyup',function(e){
      if(e.keyCode == 13){
        goSearch();
      }
    });
  }
  init();
})
