title: DOMContentLoaded触发时机
date: 2020.05.26
tags: [html,DOMContentLoaded]
categories: 前端
---
探究DOMContentLoaded事件的触发时机
<!--more-->
[MDN](https://developer.mozilla.org/zh-CN/docs/Web/Events/DOMContentLoaded)上的解释是：`当初始的 HTML 文档被完全加载和解析完成之后，DOMContentLoaded 事件被触发，而无需等待样式表、图像和子框架的完全加载。注意：DOMContentLoaded 事件必须等待其所属script之前的样式表加载解析完成才会触发`。这两句话看似有点矛盾，我们看下[HTML5规范](https://html.spec.whatwg.org/multipage/parsing.html#the-end)是怎么解释这个事情的。
## html5规范
![the_end](the_end.jpg)
* 规范上写的是，一旦客户端(也就是浏览器)停止解析文档时，如果`has no style sheet that is blocking scripts`(没有阻塞脚本的style sheet)，就会在执行完`list of scripts that will execute when the document has finished parsing`里的所有脚本后，触发DOMContentLoaded 事件。

### style sheet that is blocking scripts
在[html规范](https://html.spec.whatwg.org/multipage/semantics.html#has-no-style-sheet-that-is-blocking-scripts)中有解释这个是什么
![style](style.jpg)
* `has no style sheet that is blocking scripts` 其实就是说`Document` 的 `script-blocking style sheet counter` 为 0。而`script-blocking style sheet counter`在解析一个link标签是+1，load完一个就-1
* 也就是说一个正常的link标签都会是一个block scripts的style sheet。是我理解错了？因为实际情况是css文件不会阻塞DOMContentLoaded事件的触发。
* 看这个[demo](https://xiaoxuehua.xyz/demo/domcontentloaded/css.html)，注意把网速调低，可以看到控制台内的DOMContentLoaded的输出不会等待css加载完。
* css在什么情况才会阻塞DOMContentLoaded事件的触发呢？css后面有同步脚本的时候，因为css会阻塞后面js的执行（不会阻塞加载），而同步脚本的执行会阻塞DOMContentLoaded事件的触发，可以看这个[demo](https://xiaoxuehua.xyz/demo/domcontentloaded/css-js.html)
* 因为上面的原因，在绑定DOMContentLoaded事件的js代码前的css会阻塞事件的触发

### list of scripts that will execute when the document has finished parsing
在[html规范](https://html.spec.whatwg.org/multipage/scripting.html#list-of-scripts-that-will-execute-when-the-document-has-finished-parsing)中有解释这个
![scripting](scripting.jpg)
也就是说只要满足以下任意一个条件，就会被加入到需要再完成dom解析后执行的脚本队列
  + 普通脚本（type="text/javascript"），有src属性，并且有defer属性，没有async属性
  + module脚本（type="module"）,并且没有async属性

也就是说以上形式的脚本会阻塞DOMContentLoaded事件的触发

## 结论
* DOMContentLoaded 事件会在dom解析完、同步js执行完后、所有带有defer属性的脚本、type="module"的脚本执行后再触发。
* 正常情况下css不会阻塞DOMContentLoaded 事件的触发，但是有可能会因为css阻塞js的执行，从而阻塞DOMContentLoaded 事件。

## 参考文章
* [css加载会造成阻塞吗？](https://www.cnblogs.com/chenjg/p/7126822.html)
* [HTML Standard系列：浏览器是如何解析页面和脚本的](https://juejin.im/post/5dc8ca0a6fb9a04a7e1a44ff)
* [Define parser behavior for in-body external stylesheets](https://github.com/whatwg/html/issues/1349)

