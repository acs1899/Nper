;(function(){
  var path = require('path');
  var childProcess = require('child_process');
  var eventProxy = require('eventproxy');
  var cdn = require('./cdn.js');
  var imgMin = require('./imgMin.js');
  var jsCssMin = require('./jsCssMin.js');
  var tools = require('../lib/tools.js');
  var init = require('./init.json');
  var urls = require('url');
  var cmd = 'phantomjs';
  var url = '';
  var cdns = ['sae.sinacdn.com'];
  var phan = {};

  /*main*/
  phan.analyse = function(req,res,options){
    var url = options.url || '';
    var cdns = options.cdns || [];
    url = tools.getDomain(url);
    var childArgs = [
      path.join(__dirname, '../lib/yslow.js'),
      '-i',
      'all',
      '--cdns',
      '-f',
      'json',
      url
    ];
    Array.prototype.splice.apply(childArgs,[4,0].concat(cdns));

    if(url){
      childProcess.exec(cmd + ' ' +  childArgs.join(' '), function(err, stdout, stderr) {
        var stdout = stdout.trim() || '',
            stderr = stderr.trim() || '';
        var data = {
          code:err ? 0 : 200,
          data:{out:stdout,err:stderr},
          err:err,
          msg:''
        }
        if(err){
          console.error('analyse :' + url + ' throw err: '+err);
          return res.send(data)
        }
        if(stdout === 'FAIL to load undefined'){
          console.error('analyse : Yslow FAIL to load ' + url);
          handleErr(req,res,404,{out:{},err:{}},null,'无效的URL');
          return
        }

        data.data.out = JSON.parse(stdout);
        var ep = new eventProxy();
        var build = path.resolve('') + init.staticPath + url + '_' + tools.randomStr();

        ep.all('cdn','imgMin','jsMin','cssMin',function(){
          res.send(data);
          /*删除静态资源*/
          tools.rmdir(build);
        });

        imgMin(data,url,build+init.imgPath,function(){
          ep.emit('imgMin');
        });

        jsCssMin('js',data,url,build+init.jsPath,function(){
          ep.emit('jsMin');
        });

        jsCssMin('css',data,url,build+init.cssPath,function(){
          ep.emit('cssMin');
        });

        cdn(data.data.out,cdns,function(){
          ep.emit('cdn');
        });

      });
    }else{
      console.error('analyse : invalid url ' + url)
      handleErr(req,res,404,{out:{},err:{}},null,'无效的URL');
    }
  }

  function handleErr(req,res,code,data,err,msg){
    res.send({code:code,data:data,err:err,msg:msg});
  }

  phan.getHtml = function(req,res,url,token,filter){
    getPage(req,res,url,token,'html',filter);
  }

  phan.getA = function(req,res,url,token,filter){
    getPage(req,res,url,token,'a',filter);
  }

  function getPage(req,res,url,token,type,filter){
    if(token !== init.token){
      console.error('getPage : invalid token ' + token + ' with ' + url);
      handleErr(req,res,500,{},null,'无效的token');
      return
    }
    if(!url){
      console.error('getPage : invalid url ' + url);
      handleErr(req,res,404,{},null,'无效的URL');
      return
    }

    url = urls.parse(decodeURIComponent(url));
    url = (url.protocol?url.protocol:'http:') + '//' + (url.host?url.host:url.href) + (url.host?url.path:'');

    var args = [__dirname + '/../core/getPage.js',url,type,filter];
    var t1 = new Date().getTime();

    childProcess.exec(cmd + ' ' + args.join(' '), function(err, stdout, stderr){
      var stdout = stdout.trim() || '',
          stderr = stderr.trim() || '';

      var reg = /<\$sos%=([\s\S]*)=%sos\$>/;
      var _stdout = stdout.match(reg);
      stdout = _stdout ? _stdout[1] : '{}';

      var data = {
        code:err ? 0 : 200,
        data:stdout,
        err:err,
        msg:''
      }

      switch(true){
        case !!err : 
          console.error('getPage : throw err ' + err + ' with ' + url);
          res.send(data);return;
        case stdout === 'fail' : 
          console.error('getPage : load URL fail ' + url);
          handleErr(req,res,500,{},null,'load URL fail');return;
        case !!stderr:
          console.error('getPage : throw stderr ' + stderr + ' with ' + url);
          data.err = stderr;
          res.send(data);return;
      }
      
      try{
        switch(type){
          case 'a' : data.data = JSON.parse(stdout);break;
        }
      }catch(error){
          data.code = 0;
          data.data = null;
          data.err = error;
          data.msg = 'parse stdout error';
          console.log(stdout);
          console.log('getPage : parse stdou error: ' + error + ' with ' + url);
      }
      
      data.time = (((new Date().getTime())-t1)/1000).toFixed(2);
      res.send(data);
    });
  }

  module.exports = phan;
}())
