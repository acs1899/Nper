var Stream = require("stream");
 
function gulpCallback(obj) {
  "use strict";
  var stream = new Stream.Transform({objectMode: true});
 
  stream._transform = function(file, unused, callback) {
      obj(file)
      callback(null, file);
    }
 
  return stream;
};
 
module.exports = gulpCallback;
