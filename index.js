var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var path = require('path');
var childProcess = require('child_process');
var phantomjs = require('phantomjs');
var request = require('request');
var fs = require('fs');
var gm = require('gm');
var ep = require('eventproxy');

var binPath = phantomjs.path;
var url = '';
var staticPath = './static/';
var imgPath = '/image';
var cssPath = '/css';
var jsPath = '/script';
var cdns = ['bdstatic.com'];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(multer());

app.use(express.static(__dirname + '/assets'));

app.get('/',function(req,res){
    res.sendFile(__dirname + '/view/index.html');
});

app.get('/phantom',function(req,res){
  url = getDomain(req.query.url);
  phantom(req.query.url,res);
});

function getDomain(url){
  if(typeof url == 'string'){
    var _url = url.match(/[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/);
    return (_url ? _url[0] : '')
  }
}

/*创建目录*/
function mkd(path,callback){
  var call = typeof callback == 'function' ? callback : function(){};
  fs.exists(path,function(ex){
    if(!ex){
      fs.mkdir(path,function(err){
        if(err){
          if(err.errno == 34){
            var aPath = path.split('/'), sPath = aPath.pop();
            mkd(aPath.join('/'),function(err){
              if(err){call(err);return}
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

/*图片压缩*/
function imgMin(res,data){
  var _data = data.data.out,
      imgs = dataFilter(_data,'image').concat(dataFilter(_data,'cssimage'));

  _data.imglist = imgs;
  var i = 0, l = imgs.length;

  /*创建目录*/
  mkd(staticPath+url+imgPath,function(){
    imgs.map(function(v){
      var _name = (v.url.split('/').pop()).split('&')[0];
      var file = staticPath+url+imgPath+'/'+ (_name ? _name : '');

      /*图片是否存在*/
      fs.exists(file,function(ex){
        if(!ex){
          var _fs = fs.createWriteStream(file);
          /*保存图片回调*/
          _fs.on('close',function(chunk){
            /*gm(file).quality(80).write(file,function(err){
              err && console.dir(err)
              ++i == l && res.send(data)
            });*/

            /*压缩图片*/
            gm(file)
              .command('convert')
              .in('+dither')
              .in('-depth','8')
              .in('-colors','254')
              .write(file,function(err){
                _data.comps[v.key].recmp = 0;
                if(err){
                  console.dir(err);
                  ++i == l && res.send(data)
                }else{
                  fs.stat(file,function(err,stat){
                    if(!err){
                      _data.comps[v.key].recmp = stat.size
                    }
                    ++i == l && res.send(data)
                  });
                }
              });
          });
          request(v.url)
            .pipe(_fs);
        }else{
          fs.stat(file,function(err,stat){
            if(!err){
              _data.comps[v.key].recmp = stat.size
            }
            ++i == l && res.send(data)
          });
        }
      });
    });
  });
  /*childProcess.execFile(__dirname + '/node_modules/gulp/bin/gulp.js',['imgmin'].concat(imgs), function(err,stdout,stderr){
    //res.send(stdout)
    console.log(stdout)
  });*/
}

/*CDN使用*/
function cdn(data){
  data.comps.map(function(v){
    var type = v.type;
    var _url = getDomain(decodeURIComponent(v.url));
    v.cdn = false;
    if(type == 'js' || type == 'image' || type == 'cssimage'){
      cdns.map(function(p){
        var reg = new RegExp('\.?'+p+'$','ig');
        reg.test(_url) && (v.cdn = true)
      });
    }
  });
}

/*main*/
function phantom(url,res){
  var childArgs = [
    path.join(__dirname, 'yslow.js'),
    '-i',
    'all',
    '--cdns',
    '-f',
    'json',
    url
  ];
  Array.prototype.splice.apply(childArgs,[4,0].concat(cdns));

  if(url){
    childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
      var stdout = stdout || {},
          stderr = stderr || {};
      var data = {
        code:err ? 0 : 200,
        data:{out:{},err:{}},
        err:err,
        msg:''
      }
      if(err){
        return res.send(data)
      }
      if(stdout === 'FAIL to load undefined\n'){
        data.code = 404;
        data.msg = '无效的URL';
        return res.send(data)
      }
      data.data.out = JSON.parse(stdout);
      cdn(data.data.out);
      imgMin(res,data);
    });
  }else{
    res.send({code:404,data:{out:{},err:{}},err:null,msg:'无效的URL'});
  }
}
app.listen(8080);
