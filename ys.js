var YSlow = require('yslowjs');
var yslow = new YSlow('http://www.baidu.com', ['-i','grade'],['--cdns','bdstatic.com'],['-f','tap']);

yslow.run(function(err, result){
    console.log(result)
});
