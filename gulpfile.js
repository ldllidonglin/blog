var gulp = require('gulp');
var clean = require('gulp-rimraf');
var webserver = require('gulp-webserver');
var Hexo = require('hexo'),hexo = new Hexo(process.cwd(), {}); // 初始化一个hexo对象


// clean
gulp.task('clean', function() {
	 return gulp.src(['2014','2015','about','archives','categories','css','fonts','images','js','page','tags'])
	 .pipe(clean());
});

gulp.task('generate', function(){
	hexo.init().then(function(){
	  hexo.call('generate');
	}).catch(function(err){
	  console.log(err);
	});
	
});

/*
folder public->root 但是generate是一个异步任务，在还没生成完就拷贝完了
最终的解决办法就是加一个git hook pre commit
*/
gulp.task('dis',['generate']);

// push之前先拷贝publish的内容到根目录 这个方法在有git hook的情况下是不需要使用的
gulp.task('copy', function () {
	gulp.src(['public/**/**.*']).pipe(gulp.dest('./'));
})

//open browser
gulp.task('webserver', function() {
  gulp.src('./public')
    .pipe(webserver({
      port:8090,
      livereload: true,
      directoryListing: false,
      path: '/blog/',
      open: '/blog/'
    }));
});

gulp.task('default', ['dis','webserver']);
