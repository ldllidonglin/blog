---
title: gulp+babelify+browserify实现在es6下工作流
tags: [gulp,es6,module,模块化]
date: 2015.12.22
categories: 前端
---
es6火了这么久，一直没有抽时间来实践一把，今天顺便把gulp flow也一起实践了一下。之前我是用RequireJS来实现的模块化，既然前端发展的那么迅速，RequireJS在可预见的未来会应该会"过时"，索性就用es6来实现模块化，零经验起步，搜索的过程中才发现中文资料是有多匮乏，折腾了好久，赶紧记录下来，以备后用。
<!--more-->
## 安装组件
```
npm install --save-dev gulp
npm install --save-dev babelify   //将es6->es5
npm install --save-dev babel-core
npm install --save-dev babel-preset-es2015   //babel 6.0以后自身已不带任何功能，需要自己安装组件，这个是一个组件包
npm install --save-dev browserify  //打包工具
npm install --save-dev gulp-sourcemaps   //映射源码
npm install --save-dev vinyl-source-stream  //把 browserify 输出的数据进行准换，使之流符合gulp的标准
npm install --save-dev gulp-uglify  //压缩js
npm install --save-dev vinyl-buffer  //将 vinyl 对象内容中的 Stream 转换为 Buffer,sourse-map 和uglify需要buffer格式
```
## gulpfile.babel.js 内容
```
import gulp from 'gulp';
import sourcemaps from "gulp-sourcemaps";
import babelify from "babelify";
import browserify from 'browserify';
import source from "vinyl-source-stream";
import uglify from 'gulp-uglify';
import buffer from 'vinyl-buffer';

gulp.task("default", ()=>{
  return browserify('src/main.js')
         .transform(babelify)
         .bundle()
         .pipe(source('bundle.js'))
         .pipe(buffer())
         .pipe(sourcemaps.init({ loadMaps: true }))
         .pipe(uglify()) // Use any gulp plugins you want now
         .pipe(sourcemaps.write('./'))
         .pipe(gulp.dest('./dist'));
});
```
## 需要注意的点
1. babel6.0以后，安装babel-core后，并不带任何功能，还需安装所需要的插件，可以按照自己需要的来安装，也可以安装babel-preset-es2015，这个是一个预设包，带很多常用插件。然后新建一个文件.babelrc，写入
{
    "presets": ["es2015"]
}


参考的博文
[Gulp + Browserify: The Everything Post](https://viget.com/extend/gulp-browserify-starter-faq)
[Using gulp with Babel](http://macr.ae/article/gulp-and-babel.html)
[探究Gulp的Stream](http://segmentfault.com/a/1190000003770541)
[在 Gulp 中使用 Browserify](http://csspod.com/using-browserify-with-gulp/)