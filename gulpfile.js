var gulp = require('gulp');
var less = require('gulp-less');
var imgmin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var gcallback = require('./lib/gulp-callback');
var fs = require('fs');
var remot = require('gulp-remote-src');
var _dir = './assets/';
var arg = process.argv.slice(3);
var host = '';

function red(){
  console.log(arguments)
}

gulp.task('default',['less']);

gulp.task('less',function(){
  gulp.src(_dir+'less/index.less')
    .pipe(less())
    .pipe(gulp.dest(_dir+'css'));
});

gulp.task('imgmin',function(){
  /*_dir+'image/*.+(jpeg|jpg|png)'*/
  arg.map(function(v,i,arr){
    arr[i] = decodeURIComponent(v.replace('-',''));
  });
  remot(arg,{base:''})
    .pipe(imgmin({
      progressive:true,
      use:[pngquant()]
    }))
    .pipe(gcallback(function(file){
      var len = parseInt(file.contents.length);
      host = file.path.match(/[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/)[0];
      var name = file.path.split('/').pop();
      console.log(_dir+host);
      console.log({'name':name,'length':len});
      //console.log(file.path)
    }));
    //.pipe(gulp.dest(''));
});

gulp.task('watch',function(){
  gulp.watch(_dir+'less/*.less',['less']);
});
