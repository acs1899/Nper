var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var route = require('./core/route.js');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(multer());

app.use(express.static(__dirname + '/assets'));

/*app.get('/',function(req,res){
  res.sendFile(__dirname + '/view/index.html');
});

app.post('/phan',function(req,res){
  phan(req,res,{url:req.body.url,cdns:req.body.cdns});
});*/
app.all('*',function(req,res){
  route(req,res);
});

app.listen(8080);
