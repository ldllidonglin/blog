title: ECMAScript规范的最新动向
date: 2019.07.03
tags: [ECMAScript规范, JavaScript]
categories: ECMAScript规范
---
这篇文章主要是关注ECMAScript规范最新有什么变化，关注下哪些Proposal进入stage3、4。还有就是一些重点Proposal, 所以这篇文章会持续更新。第一次写是在2018.01.17
<!--more-->
## 2020.06.26 更新
2020.06.01 - 2020.06.04的会议结果
### 新增一个提案到stage4
* [String.prototype.replaceAll](https://github.com/tc39/proposal-string-replaceall),ECMAScript2021的第一个feature

## 2020.04.25更新
2020.03.31 - 2020.04.02的会议结果，ECMAScript2020定稿
### 新增1个提案到stage4
* import.meta 之前已经介绍过了，但是目前貌似只有一个import.meta.url属性，import.meta是可变，未来估计会有更多信息。默认为空，只有在第一次获取这个属性的时候，才会获得

### 新增1个提案到stage3
* [proposal-logical-assignment](https://github.com/tc39/proposal-logical-assignment)
  + 逻辑运算和赋值运算合并的一个操作符
  + 使用示例
  ```
    a ||= b;
    a || (a = b);

    // "And And Equals"
    a &&= b;
    a && (a = b);

    // "QQ Equals"
    a ??= b;
    a ?? (a = b);
  ```


## 2019.12.08更新
### 新增3个提案到stage4
* for-in mechanics
* Optional Chaining
* Nullish coalescing Operator
`以上三个提案都是在2019.07进入stage3的，非常快的就进入stage4`

### 新增一个提案到stage3
* [Atomics.waitAsync](https://github.com/tc39/proposal-atomics-wait-async)

## 2019.10.28 更新
### 新增了1个提案到stage4
* globalThis
  + 统一多环境下this的命名，在之前的提案中，叫global，最终改名叫globalThis。以后想使用this，又想让代码在多个环境兼容，就使用globalThis。

### 新增2个提案到state3

* [String.prototype.replaceAll](https://github.com/tc39/proposal-string-replaceall)
  + 替换所有字符，解决replace方法使用如：queryString.replace(/\+/g, ' ');需要转义特定字符
* [Promise.any](https://github.com/tc39/proposal-promise-any)
  + Any of the promises was fulfilled
  + 示例
  ```
  Promise.any([
    fetch('https://v8.dev/').then(() => 'home'),
    fetch('https://v8.dev/blog').then(() => 'blog'),
    fetch('https://v8.dev/docs').then(() => 'docs')
  ]).then((first) => {
    // Any of the promises was fulfilled.
    console.log(first);
    // → 'home'
  }).catch((error) => {
    // All of the promises were rejected.
    console.log(error);
  });
  ```

## 2019.07.23-2019.07.25会议
### 新增1个提案到stage4
* Promise.allSettled
  + 前文已介绍，至此，js中已经有三个promise方法来来处理promise组合,另外两个是: Promise.all,Promise.race

### 新增4个提案到stage3
* [for-in mechanics](https://github.com/tc39/proposal-for-in-exploration)
规范for-in的迭代顺序

* [Optional Chaining](https://github.com/tc39/proposal-optional-chaining)
判断属性是否存在再也不用这么麻烦了
```
var street = user.address && user.address.street;
// 变成
var street = user.address?.street
const animationDuration = response.settings?.animationDuration ?? 300;
```

* [Nullish coalescing Operator](https://github.com/tc39/proposal-nullish-coalescing)
这个和Optional Chaining是配合使用的，当使用了Optional Chaining后，有时只想判断当时null或者undefined时用默认值时，用下面这个代码就会有问题
  ```
  const response = {
    settings: {
      nullValue: null,
      height: 400,
      animationDuration: 0,
      headerText: '',
      showSplashScreen: false
    }
  };
  const headerText = response.settings?.headerText || 'Hello, world!'; //'Hello, world!'
  ```
  所以可以用??来解决这个问题，只有为null或者undefined时，才会是false
  ```
  const response = {
    settings: {
      nullValue: null,
      height: 400,
      animationDuration: 0,
      headerText: '',
      showSplashScreen: false
    }
  };

  const undefinedValue = response.settings?.undefinedValue ?? 'some other default'; // result: 'some other default'
  ```
* [RegExp Match array offsets](https://github.com/tc39/proposal-regexp-match-indices)
  + exec方法返回值中增加一个indices属性，标识各个捕获组的start和end
  + 示例
  ```
  const re1 = /a+(?<Z>z)?/;

  // indices are relative to start of the input string:
  const s1 = "xaaaz";
  const m1 = re1.exec(s1);
  m1.indices[0][0] === 1;
  m1.indices[0][1] === 5;
  s1.slice(...m1.indices[0]) === "aaaz";

  m1.indices[1][0] === 4;
  m1.indices[1][1] === 5;
  s1.slice(...m1.indices[1]) === "z";

  m1.indices.groups["Z"][0] === 4;
  m1.indices.groups["Z"][1] === 5;
  s1.slice(...m1.indices.groups["Z"]) === "z";

  // capture groups that are not matched return `undefined`:
  const m2 = re1.exec("xaaay");
  m2.indices[1] === undefined;
  m2.indices.groups["Z"] === undefined;
  ```

## 2019.07.03 更新(会议时间：2019.06.04-2019.06.06)
### 新增2个提案到stage4，将会出现在ECMAScript2020中
* import() 
  + 终于写进规范了,之前在stage3的时候有详细介绍，其实这个我们已经借助webpack使用上这个功能了，chrome从63开始就已经支持了
  + [提案信息介绍](https://github.com/tc39/proposal-dynamic-import)
* BIGINT
  + 2017年已经进入了stage3，下文已经详细介绍了这个特性

### 新增2个提案到stage3
* [Top-level await](https://github.com/tc39/proposal-top-level-await)
  + 在es模块系统中，可以直接不用async也能直接使用await了
* [WeakReferences](https://github.com/tc39/proposal-weakrefs)
  + WeakRef FinalizationGroup。优化垃圾收集，避免内存泄漏

## 2019.04.04 更新
### 新增一个提案到stage4，也就是ECMAScript2020中
* String.prototype.matchAll，这个提案在2018年1月就进入stage3中了

### 新增两个提案到stage3
* Promise.allSettled
因为Promise.all会在有一个reject的时候，就直接reject，并且其他resolve的结果都会丢弃，对于想知道所有结果（无论resolve还是reject）的情况下，就必须重新包装一下，如下代码：
  ```
  function reflect(promise) {
    return promise.then(
      (v) => {
        return { status: 'fulfilled', value: v };
      },
      (error) => {
        return { status: 'rejected', reason: error };
      }
    );
  }

  const promises = [ fetch('index.html'), fetch('https://does-not-exist/') ];
  const results = await Promise.all(promises.map(reflect));
  const successfulPromises = results.filter(p => p.status === 'fulfilled');
  ```
  而有了allSettled方法后，就不需要这样了，如下：
  ```
  const promises = [ fetch('index.html'), fetch('https://does-not-exist/') ];
  const results = await Promise.allSettled(promises);
  const successfulPromises = results.filter(p => p.status === 'fulfilled');
  ```
* Numeric separators
用下划线(_)做数字分隔符,让数字的可读性更强
```
1_000_000_000           // Ah, so a billion
101_475_938.38          // And this is hundreds of millions

let fee = 123_00;       // $123 (12300 cents, apparently)
let fee = 12_300;       // $12,300 (woah, that fee!)
let amount = 12345_00;  // 12,345 (1234500 cents, apparently)
let amount = 123_4500;  // 123.45 (4-fixed financial)
let amount = 1_234_500; // 1,234,500
```
## 2019.02.19 更新
### 新增4个提案到stage4，即ECMAScript2019中
有三个是新增的内置对象的方法，规范没制定之前已经被大量使用，还有一个是对旧方法的描述进行订正升级。分别是：
* Object.fromEntries
* Well-formed JSON.stringify
* String.prototype.{trimStart,trimEnd}
* Array.prototype.{flat,flatMap}

以上都在具体提案升级到stage3时已做介绍，这次1月份的会议没有新提案进入stage3
## 2018.12.10 更新
### 新增两个提案到stage4，即ECMAScript2019中
这俩提案在进入stage3的时候已经在下文中介绍过了
* Symbol.prototype.description
* Function.prototype.toString revision

### 新增一个提案到stage3
* [Hashbang Grammar](https://github.com/tc39/proposal-hashbang)
就是把已经成为事实标准的在cli工具中会使用到的#!符号写入标准
* 
```
#!/usr/bin/env node
// in the Script Goal
'use strict';
console.log(1);
```
* 
```
#!/usr/bin/env node
// in the Module Goal
export {};
console.log(1);
```
## 2018.10.31 更新
### 新增一个提案到stage3
* Well-formed JSON.stringify
```
// Without the proposal:
JSON.stringify('\uD800');
// → '"<U+D800>"'


// With the proposal:
JSON.stringify('\uD800');
// → '"\\ud800"

```
* [slide](https://docs.google.com/presentation/d/1oTkthPjlRg8FOsyvD9XdA-rPkfLcMrTDCIiHNltIxpw/edit#slide=id.g3b22f3749a_0_51)
## 2018.08.24 更新
### 新增一个提案到stage3
* Object.fromEntries
  ```
  var a = {b:1, c:2}
  Object.entries(a)                 // [['b', 1], ['c', 2]]
  var e = [['a', 1], ['c', 2]]
  var obj = Object.fromEntries(e)   // {b:1, c:2}
  ```

## 2018.05.30更新
### ECMAScript2018定稿
从进展来看，ECMAScript2018在1月份的会议上已经定稿了，所以最终ECMAScript2018新增了8个特性分别是：
* Lifting template literal restriction
* s (dotAll) flag for regular expressions
* RegExp named capture groups
* Rest/Spread Properties
* RegExp Lookbehind Assertions
* Unicode property escapes in regular expressions
* Promise.prototype.finally
* async-iteration

### ECMAScript2019
#### 有两个进入stage4，也就是ECMAScript2019
* Optional catch binding
* JSON superset

#### 新增 1 个到stage3
* [Symbol.prototype.description	](https://github.com/tc39/proposal-Symbol-description)
  + 通过 description 这个访问器属性，返回Symbol的描述，代替之前通过Symbol.prototype.toString来实现




## 2018.01.27更新

### 新增了6个proposal到stage4：
* RegExp named capture groups
* Rest/Spread Properties
* RegExp Lookbehind Assertions
* Unicode property escapes in regular expressions
* Promise.prototype.finally
* async-iteration

### 新增了3个proposal到stage3
* [JSON superset](https://github.com/tc39/proposal-json-superset)
  + 修正ECMA-262的JSON语法，从而满足是JSON的语法的超集。就是让ECMA-262字符串语法兼容JSON的字符串语法
* [String.prototype.{trimStart,trimEnd}](https://github.com/tc39/proposal-string-left-right-trim)
  + 之前规范已经有了padStart/padEnd，这次就加上去除空格的方法
* [String.prototype.matchAll](https://github.com/tc39/String.prototype.matchAll)
  + 把字符串中匹配正则的捕获组全部返回，而不是靠循环去取

## stage4
截止到TC39最近的一次例行会议（2017.11.30），目前在stage4的一共有两个Proposal：
### Lifting template literal restriction
对应的[文档](https://github.com/tc39/proposal-template-literal-revision)

* 现在规范中，对于模板字符串有限制，对\x，\u开头的字符串进行转义
  ```
  function latex(strings) {...}
  let document = latex`
    \newcommand{\unicode}{\textbf{Unicode!}} // 报错
    \newcommand{\xerxes}{\textbf{King!}} // 报错
  `
  ```
* 放松对标签模板里面的字符串转义的限制。遇到不合法的字符串转义，就返回undefined，而不是报错，并且从raw属性上面可以得到原始字符串。
  ```
  function tag(strs) {
      strs[0] === undefined
      strs.raw[0] === "\\unicode and \\u{55}";
  }
  tag`\unicode and \u{55}`
  ```
### s (dotAll) flag for regular expressions
对应的[文档](https://github.com/tc39/proposal-regexp-dotall-flag)
* 以前正则里的`.`不能匹配`\n \r`等换行符，新增`s`flag，支持单行模式，从而让`.`能匹配换行符
```
/./s.test('\n') // true
```

## stage3
目前在stage3中有17个
### 1 Function.prototype.toString 
* 以前规范规定的很模糊，导致各引擎实现的不一致。比如对换行空格的处理、内置函数和自定义函数的返回
* 明确、具体的规定这个方法的针对不同的函数的返回。
  + 内置函数、宿主函数、绑定函数一律返回"function () { [native code] }"
  + 通过ECMAScript定义的，一字不落的返回和源代码一样的文本
  + 通过Function等构造函数动态创建的，合成一个源代码返回，针对不同的情况，规定返回格式
  + 其余情况返回TypeError


### 2 Promise.prototype.finally
* Promise原生提供finally方法
  ```
  Promise.resolve(2)
  .then(() => {}, () => {})
  .finally(function () {

  })
  ```

### 3 Optional catch binding
* try{}catch(e){}的e参数变为可选
  ```
  try{

  }catch(){
    // 可不写参数了
  }
  ```
* chrome66已经实现

### 4 global
* 增加一个名为global的，在浏览器、nodejs、Web Workers中通用的全局对象，用来访问全局变量
```
'use strict';
(function (global) {
	if (!global.global) {
		if (Object.defineProperty) {
			Object.defineProperty(global, 'global', {
				configurable: true,
				enumerable: false,
				value: global,
				writable: true
			});
		} else {
			global.global = global;
		}
	}
})(typeof this === 'object' ? this : Function('return this')())
```


### 5 import(specifier)
* ES2015就写入规范的import，原生提供了静态的、同步的加载模块的方式
* import()用来支持动态加载模块，返回一个Promise  
```
import('a.js')
.then(myModule => {
    console.log(myModule.default);
});
```


### 6 import.meta
* 给模块内部提供一种获取上下文信息的途径
```
<script type="module" src="path/to/hamster-displayer.mjs" data-size="500"></script>
(async () => {
  const response = await fetch(new URL("../hamsters.jpg", import.meta.url));
  const blob = await response.blob();

  const size = import.meta.scriptElement.dataset.size || 300;

  const image = new Image();
  image.src = URL.createObjectURL(blob);
  image.width = image.height = size;

  document.body.appendChild(image);
})();
```

### 7 Rest/Spread Properties
* 对象支持展开运算符和函数形参的剩余参数语法
```
const obj = {foo: 1, bar: 2, baz: 3};
const {foo, ...rest} = obj;
```
```
const obj = {foo: 1, bar: 2, baz: 3};
console.log({...obj, qux: 4})
//{foo: 1, bar: 2, baz: 3, qux: 4 }
```


### 8 class-fields
* class语法新增声明公共字段和私有字段的方式
  ```
  class Counter extends HTMLElement {
    #x = 0; // 私有字段
    y = 1; // 公共字段
    a () {

    }
  }
  ```

### 9 Private methods and accessors
* class语法新增申明私有方法和访问器
  ```
  class Counter extends HTMLElement {
    #x = 0; // 私有字段
    y = 1; // 公共字段
    #a () {
      this.#x++
    }
    get #x() {}
    set #x(value) {}
  }

  ```

### 10 async-iteration
* 新增异步迭代器，针对异步数据迭代
  ```
  const { value, done } = syncIterator.next();

  asyncIterator.next().then(({ value, done }) => /* ... */);

  for await (const line of readLines(filePath)) {
    console.log(line);
  }
  ```

### 11 RegExp Lookbehind Assertions
* 正则表达式以前只有先行断言，现在新增正向后行断言(?<=...)和负向后行断言(?<!...)
  ```
  /(?<=\$)\d+(\.\d*)?/.test('$10.53') // true
  /(?<=\$)\d+(\.\d*)?/.test('&10.53') // false

  /(?<!\$)\d+(\.\d*)?/.test('$10.53') // false
  /(?<!\$)\d+(\.\d*)?/.test('&10.53') // true
  ```

### 12 Unicode property escapes in regular expressions
* 正则表达式新增一种方式
```\p{UnicodePropertyName=UnicodePropertyValue},\P{UnicodePropertyValue}```，可以实现对某一类Unicode字符的识别，而不是写一串的\u1232...
  ```
  const regex = /^\p{Decimal_Number}+$/u;
  regex.test('𝟏𝟐𝟑𝟜𝟝𝟞𝟩𝟪𝟫𝟬𝟭𝟮𝟯𝟺𝟻𝟼');
  // → true

  const regex = /\p{Emoji_Modifier_Base}$/u;
  regex.test('⌚');
  // → true
  ```

### 13 RegExp named capture groups
* 正则表达式新增命名捕获分组语法```(?<name>...) ```
  ```
  let {groups: {one, two}} = /^(?<one>.*):(?<two>.*)$/u.exec('foo:bar');
  console.log(`one: ${one}, two: ${two}`);  // prints one: foo, two: bar
  ```

### 14 Numeric separators
[见文档](https://github.com/tc39/proposal-numeric-separator),就是利用underscore的_符号，对数字进行分割，从而更直观的知道数字的大小，比如
```
1_000_000_000           // Ah, so a billion
101_475_938.38          // And this is hundreds of millions

let fee = 123_00;       // $123 (12300 cents, apparently)
let fee = 12_300;       // $12,300 (woah, that fee!)
let amount = 12345_00;  // 12,345 (1234500 cents, apparently)
let amount = 123_4500;  // 123.45 (4-fixed financial)
let amount = 1_234_500; // 1,234,500
```
### 15 regexp-legacy-features
* 将很多浏览器已经实现了的，但是没有写入规范的RegExp构造函数上的属性，比如RegExp.$1-9、RegExp.input等写入规范，并且规定这些属性的特性。[具体改动](https://github.com/tc39/proposal-regexp-legacy-features/blob/master/changes.md)

### 16 BigInt
* 新增一个数值类型：BigInt，用来表示大于2^53和小于-2^53的整数。
  ```
  typeof 123n === 'bigint'
  ```
* Number和BigInt不能互转
* 重载了+ / 等运算符

### 17 Array.prototype.{flatMap,flat}
* Array增加了两个原型方法，拍平数组（flatten），以及可以传入处理函数处理后再拍平（flatMap）
* flatten 由于很多第第三方库已经实现了这个方法，所以为了避免冲突，这个方法在规范中已经改名为flat，并且chrome69已经实现了

## ASI和class fields
由于增加了class field语法，这就导致和原本的ASI会有一些冲突迷惑的地方，会让ASI很难处理。具体的问题可以看这个[slide](https://docs.google.com/presentation/d/1bPzE6i_Bpm6FXgzfx9XFJNHGkVcM42lux-6bUNhxpl4/edit#slide=id.g29382c0eba_0_157)。经过讨论，TC39决定在class内还是要ASI，并且在规范内增加个声明，描述ASI可能遇到风险，但是有一句话是，explicit semicolon use is recommended。激起了社区广泛的讨论，质疑TC39是不是从官方的角度建议加上分好，不推荐semicolon-less风格。具体讨论见[PR](https://github.com/tc39/ecma262/pull/1062)


## 参考资料
* [各个提案浏览器的实现情况](http://kangax.github.io/compat-table/esnext/)
* [所有proposal](https://github.com/tc39/proposals/blob/master/README.md)
* [tc39的会议纪要](https://github.com/rwaldron/tc39-notes)
* [tc39的会议日程](https://github.com/tc39/agendas)
