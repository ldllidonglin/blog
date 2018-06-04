title: service worker的思考
date: 2018.06.03
tags: [service-worker，缓存]
categories: 前端
---
对service worker的思考
<!--more-->
## what？
* Chrome 提出和力推的一个 WEB API，用于给 web 应用提供高级的可持续的后台处理能力。该 WEB API 标准起草于 2013 年，于 2014 年纳入 W3C WEB 标准草案，当前还在草案阶段。
* Service workers 本质上充当Web应用程序与浏览器之间的代理服务器，也可以在网络可用时作为浏览器和网络间的代理。它们旨在（除其他之外）使得能够创建有效的离线体验，拦截网络请求并基于网络是否可用以及更新的资源是否驻留在服务器上来采取适当的动作。他们还允许访问推送通知和后台同步API
* 在页面中注册并安装成功后，运行于浏览器后台，不受页面刷新的影响，可以监听和截拦作用域范围内所有页面的 HTTP 请求。结合 Fetch API、Cache API、Push API、postMessage API 和 Notification API，可以在基于浏览器的 web 应用中实现如离线缓存、消息推送、静默更新等 native 应用常见的功能，以给 web 应用提供更好更丰富的使用体验。
* 必须在 localhost 域或 HTTPS 域下运行、注册的js必须和站点同域
* [兼容性](https://caniuse.com/#feat=serviceworkers)
* 应用场景（MDN）
  + 后台数据同步
  + 响应来自其它源的资源请求
  + 集中接收计算成本高的数据更新，比如地理位置和陀螺仪信息，这样多个页面就可以利用同一组数据
  + 在客户端进行CoffeeScript，LESS，CJS/AMD等模块编译和依赖管理（用于开发目的）
  + 后台服务钩子
  + 自定义模板用于特定URL模式
  + 性能增强，比如预取用户可能需要的资源，比如相册中的后面数张图片

## how？
### 快速上手
* 在html中加入如下脚本
```
if (navigator.serviceWorker != null) {
    navigator.serviceWorker.register('/service-worker.js')
    .then(function(registration) {
      console.log('Registered events at scope: ', registration.scope);
    });
  } else {
    console('不支持sw')
  }
```
* service-worker.js
```
var cacheStorageKey = 'blog-pwa-2018060100'
var cacheList = [
  '/',
  "/index.html",
  "/statics/css/swiper.css",
  "/statics/js/swiper.js",
  "/statics/images/1.jpeg",
  "/statics/images/6.jpeg",
  "/statics/images/7.jpeg"
]

this.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheStorageKey)
    .then(cache => cache.addAll(cacheList))
    .then(() => self.skipWaiting())
  )
})

this.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      if (response != null) {
        return response
      }
      return fetch(e.request.url)
    })
  )
})
```
* 经过以上处理，站点就能简单的拥有离线能力了。

### 需要思考的问题
* 如何快速方便的更新service-worker.js?
  + 由于service-worker.js 需要和站点同源，所以在前后端分离的项目，就需要后端将将service-worker.js的请求转发到前端能控制的某个资源处
  + 如果站点的html是由前端控制，而不是由后端模板控制的话，前端发布上线的时候需要更新service-worker的请求，带上时间戳或者md5戳都行，防止被http缓存从而没法更新
  + 如果站点的html不是由前端控制，那为了保证service-worker.js的及时更新，最好设为无缓存时间，或者缓存时间特别短，比如5s。或者请求url上每次都自动加上时间戳，其实就是无缓存时间。避免每次上线还需要更新后端的模板。
* 如何更新被serviceWorker缓存的资源？
  + 更新service-worker.js，会重新执行 install actived等事件，在这些事件中删除旧缓存，添加新缓存
  + 由于旧的已经激活了的service worker还在运行，就会导致fetch会执行。在fetch中使用cache.match来判断是否命中缓存。由于cache.match是用request来匹配的，所以如果url没有变化的话，会返回true，从而直接从缓存中取response，会导致第一次打开页面获取的资源还是上一版本的。
  + 所以要在前端更新的时候，url必须变化，从而在第一次打开的时候能正确更新
* 自动化生成service-worker.js?
  + [sw-precache](https://www.npmjs.com/package/sw-precache)和[sw-toolbox](https://github.com/GoogleChromeLabs/sw-toolbox)是谷歌早前开发的工具；sw-precache是cache-first策略的缓存工具，会自动根据文件hash自动生成sw.js。fetch命中缓存后会直接返回缓存，然后会根据最新的缓存列表对缓存进行增删操作。sw-toolbox用来缓存一些第三方的资源以及增加了根据路由定制缓存策略的能力
  + 谷歌都不会再维护以上两种工具了，他们认为的终极解决方案是[workbox](https://developers.google.com/web/tools/workbox/)，比上述两个工具的功能还要丰富，并且配合插件，使用也更便捷。
  + 官方提供了npm包、cli、webpack的插件[workbox-webpack-plugin](https://www.npmjs.com/package/workbox-webpack-plugin)

### 有多大的收益？
* 需要离线体验么？
  + 展示型的可以有，但是对于需要在线才有可用性的项目，可能真的没必要。
  + 离线功能可以一定程度上保证低速网络的可用性
* SW的缓存和普通的HTTP缓存比，有何优势？
  + 控制力更强、粒度更细，缓存的时间、更新全部由前端代码完成，而不是nginx等服务器上的配置。
  + 速度上应该没区别，都是缓存，而且应该都是存在硬盘中。
* 消息推送通知
  + 国内无法使用

### 上这样新技术，有怎样的风险点
* 会不会增加白屏的可能性？
  + 增加sw，就和以前不同了，前端控制了请求的返回。请求直接在sw中进行一些逻辑判断，然后要么从缓存中取，要么直接去cdn中获取，那sw就需要考虑到各种情况，做好兜底，避免由于sw的问题，导致请求出错。sw最好是用sw-precache或者workbox生成的脚本，或者参考它生成的脚本来编写。
* 浏览器兼容性
  + 目前IE和Safari都已经支持了SW，但是里面用到的Cache、Fetch等API及方法兼容性还不是很好，需要做好判断

## 参考文章
[service worker draft](https://w3c.github.io/ServiceWorker/)
[MDN Service Worker API](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API)  
[网站渐进式增强体验(PWA)改造：Service Worker 应用详解](http://lzw.me/a/pwa-service-worker.html)  
[饿了么PWA实践](https://huangxuan.me/2017/07/12/upgrading-eleme-to-pwa/)
[借助Service Worker和cacheStorage缓存及离线开发](http://www.zhangxinxu.com/wordpress/2017/07/service-worker-cachestorage-offline-develop/)
[sw-precache](https://www.npmjs.com/package/sw-precache)
[sw-toolbox](https://github.com/GoogleChromeLabs/sw-toolbox)
[workbox](https://developers.google.com/web/tools/workbox/)