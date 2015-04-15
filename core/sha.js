var str = process.argv[2];
var crypto = require('crypto');
var shasum = crypto.createHash('sha1');
shasum.update(str);
console.log(shasum.digest('hex'));
