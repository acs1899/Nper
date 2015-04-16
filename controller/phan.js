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
        var stdout = stdout || '',
            stderr = stderr || '';
        var data = {
          code:err ? 0 : 200,
          data:{out:stdout,err:stderr},
          err:err,
          msg:''
        }
        if(err){
          return res.send(data)
        }
        if(stdout === 'FAIL to load undefined\n'){
          handleErr(req,res,404,'无效的URL');
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
      handleErr(req,res,404,'无效的URL');
    }
  }

  function handleErr(req,res,code,msg){
    res.send({code:code,data:{out:{},err:{}},err:null,msg:msg});
  }

  phan.getHtml = function(req,res,url,token,filter){
    getPage(req,res,url,token,'html',filter);
  }

  phan.getA = function(req,res,url,token,filter){
    getPage(req,res,url,token,'a',filter);
  }

  function getPage(req,res,url,token,type,filter){
    if(token !== init.token){
      handleErr(req,res,500,'无效的token');
      return
    }
    if(!url){
      handleErr(req,res,404,'无效的URL');
      return
    }

    url = urls.parse(decodeURIComponent(url));
    url = (url.protocol?url.protocol:'http:') + '//' + (url.host?url.host:url.href) + (url.host?url.path:'');

    var args = [__dirname + '/../core/getPage.js',url,type,filter];
    childProcess.exec(cmd + ' ' + args.join(' '), function(err, stdout, stderr){
      var stdout = stdout || '',
          stderr = stderr || '';
      var data = {
        code:err ? 0 : 200,
        data:stdout,
        err:err,
        msg:''
      }

      switch(true){
        case !!err : res.send(data);return;
        case stdout === 'FAIL to load undefined\n' : handleErr(req,res,404,'无效的URL');return;
        case stdout === 'fail' : handleErr(req,res,500,'load URL fail');return
      }

      switch(type){
        case 'a' : data.data = JSON.parse(stdout);break;
      }
      res.send(data);
    });
  }

  module.exports = phan;
}())