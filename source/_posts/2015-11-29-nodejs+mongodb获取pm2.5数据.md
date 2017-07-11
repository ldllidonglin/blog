---
title: nodejs+mongodb获取pm2.5数据
tags: [nodejs,mongodb,pm2.5]
date: 2015.11.29
categories: 前端
---
*特别感谢[pm2.5](http://pm25.in/)提供接口*
因为返回的数据直接就是[{},{}]格式，所以偷懒直接用mongodb来存储了。
<!--more-->
# nodejs代码
```
//aqi.js
var http = require("http"),url = require("url"),MongoClient = require('mongodb').MongoClient, assert = require('assert'),fs = require('fs');

var dataURL = "http://www.pm25.in/api/querys/aqi_ranking.json?token=";
http.get(dataURL, function(res){
    res.setEncoding("utf-8");
    var date=new Date();
    var time=date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes();
    var result=[];
    res.on("data", function(chunk){
        result.push(chunk);
    })
    .on("end", function(){
        result=JSON.parse(result.join(""));
        var url = 'mongodb://localhost:27017/aqi';
        //写入日志文件 绝对路径，因为在cmd下是在C:/windows/system32/下执行的
        fs.open('D:/Nodejs/aqilog.log', 'a+',function (err,fd) {
            if (err) {
               return fs.write(fd,time+" "+err); 
            }
            fs.write(fd,time+" 获取数据成功\r\n");   
            fs.close(fd);
        });
        MongoClient.connect(url, function(err, db) {
            var collection = db.collection('cityaqi');
            collection.insertMany(result,function(inserterr, result) {
                fs.open('D:/Nodejs/aqilog.log', 'a+',function (err,fd) {
                    if (err) {
                       return fs.write(fd,time+" "+err); 
                    }
                    if(inserterr){
                        fs.write(fd,time+" 条记录写入失败"+inserterr+"\r\n");   
                    }else{
                        fs.write(fd,time+" "+result.insertedCount+"条记录写入成功\r\n");   
                    }
                    
                    fs.close(fd);
                });
                db.close();
            });
        });
    });
});
```

*需要先安装mongodb和nodejs npm*
把mongodb安装成服务,在cmd下cd到mongodb的bin目录下
```
mongod --dbpath F:\data --logpath=F:\data\log\mongodb.log --install
```
然后win+r 输入services.msc，在window服务里启动mongodb就ok了，

nodejs需要安装 [mongodb插件](http://mongodb.github.io/node-mongodb-native/2.0/);
```
npm install mongodb   //安装在当前目录就好了，不需要-g
```

在windows下需要每个小时执行一次，用windows的计划任务，一开始只能设置一天启动一次，然后建立任务后在属性-触发器那修改成每小时重复一次，持续24小时
```
//getCityAQI.bat
node D:\Nodejs\aqi.js   //node需要在系统的PATH目录
exit                     //退出cmd窗口，不然程序不会退出，后续的任务就不会重复执行了
```
