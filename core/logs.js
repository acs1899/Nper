;(function(){
  var fs = require('fs');
  var util = require('util');
  function getLogTime(){
    var date = new Date();
    date = '['+date.getFullYear()+
          '-'+
          (date.getMonth()+1)+
          '-'+
          date.getDay()+
          ' '+
          (date.getHours() < 10 ? '0'+date.getHours() : date.getHours())+':'+
          (date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes())+':'+
          (date.getSeconds() < 10 ? '0'+date.getSeconds() : date.getSeconds())+'] ';
    return date
  }

  console.Console.prototype.log = function(){
    this._stdout.write(getLogTime()+util.format.apply(this,arguments)+'\n');
  }
  console.Console.prototype.warn = function(){
    this._stderr.write(getLogTime()+util.format.apply(this,arguments)+'\n');
  }
  console.Console.prototype.info = console.Console.prototype.log;
  console.Console.prototype.error = console.Console.prototype.warn;

  var info = fs.createWriteStream('./logs/info.log',{flags:'a'});
  var error = fs.createWriteStream('./logs/error.log',{flags:'a'});
  module.exports = new console.Console(info,error)
})()
