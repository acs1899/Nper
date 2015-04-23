var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var route = require('./core/route.js');
var log4js = require('log4js');
var app = express();

log4js.configure({
 appenders: [
    { type: 'dateFile', filename: './logs/log/', pattern: 'yyyy-MM-dd.log', alwaysIncludePattern: true, category: 'info' },
    { type: 'dateFile', filename: './logs/err/', pattern: 'yyyy-MM-dd.log', alwaysIncludePattern: true, category: 'err' }
  ]
});

var logger = log4js.getLogger('info');
var errer = log4js.getLogger('err');
logger.setLevel('INFO');
errer.setLevel('ERROR');

app.use(log4js.connectLogger(logger, {level: log4js.levels.INFO}));
app.use(log4js.connectLogger(errer, {level: log4js.levels.ERROR}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(multer());

app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/static'));

app.all('*',function(req,res){
  route(req,res);
});

var server = app.listen(8080);

process.on('exit',function(code){
  console.log('process exit with code: ' + code);
});
process.on('uncaughtException',function(err){
  console.log('worker '+process.pid+' Caught exception: ' + err);
  /*通知master该进程即将结束*/
  process.send('suicide');
  /*停止接收新请求*/
  server.close(function(){
    console.log('worker '+process.pid+' closed!!!')
    process.exit(1);
  });
  setTimeout(function(){
    process.exit(1);
  },5000);
});
process.on('SIGTERM',function(){
  process.exit(0);
});
