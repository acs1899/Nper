var path = require('path');
var childProcess = require('child_process');
var phantomjs = require('phantomjs');
var binPath = phantomjs.path;

var childArgs = [
  path.join(__dirname, 'yslow.js'),
  ' -i grade -f json http://sae.sina.com.cn'
]

childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
  console.log(err);
  console.log(stdout)
  console.log(stderr)
});
