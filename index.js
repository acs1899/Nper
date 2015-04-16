var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var route = require('./core/route.js');
var app = express();

var pidfile = path.join(__dirname + '/run/app.pid');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(multer());

app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/static'));

app.all('*',function(req,res){
  route(req,res);
});

app.listen(80);

fs.writeFileSync(pidfile,process.pid);
process.on('SIGTERM',function(){
    if(fs.existsSync(pidfile)){
        fs.unlinkSync(pidfile);
    }
    process.exit(0);
});
