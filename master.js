var cl = require('cluster');
var init = require('./init/init.json');
var cpus = init.workers || require('os').cpus().length;
var path = require('path');
var fs = require('fs');
var workers = {};

cl.setupMaster({
  exec:'index.js'
});

for(var i=0,l=cpus;i<l;i++){
  var _worker = cl.fork();
  workers[_worker.process.pid] = _worker;
  workerHandle(_worker);
}

process.on('exit',function(){
  for(var i in workers){
    if(workers.hasOwnProperty(i)){
      process.kill(i,'SIGTERM');
    }
  }
});

var pidfile = path.join(__dirname,'run/app.pid');
fs.writeFileSync(pidfile,process.pid);


process.on('SIGTERM',function(){
  if(fs.existsSync(pidfile)){
      fs.unlinkSync(pidfile);
  }
  process.exit(0);
});

function workerHandle(worker){
  var pid = worker.process.pid;
  worker
    .on('message', function(msg){
      console.log('Master got a message '+msg);
    })
    .on('exit',function(){
      console.log('worker '+pid+' exit');
      delete workers[pid];
      var _worker = cl.fork();
      workers[_worker.process.pid] = _worker;
      workerHandle(_worker);
    });
}
