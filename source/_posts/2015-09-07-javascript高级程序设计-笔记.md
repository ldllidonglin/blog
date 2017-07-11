---
title: javascript高级程序设计-笔记
tags: javascript
date: 2015.9.7
categories: 读书笔记
---
# javascript高级程序设计第二版读书笔记
## 1.第二章 script元素
1. async 实现异步脚本，表示不妨碍其他脚本或资源的下载，两个async脚本的执行顺序是不确定的，所以要确保不会互相依赖。同时这段脚本最好不要修改dom，因为不确定是在DOMContentLoaded事件前发生还是后发生。
2. defer 表示脚本可以延迟到文档全部加载完成后再执行，延迟脚本
<!--more-->

## 2.第三章 基本概念
1. ECMAScript5引入了严格模式，IE10+支持;
1. javascript中共有5中基本数据类型:Null Undefined Number String Boolean和一种复杂类型Object。所有值都是上述类型之一。
2. typeof是一个操作符，并不是一个函数，返回的值就只有6种可能 

|值|说明|
|---|---|
|undefined|未定义或未赋值|
|number|数字|
|string|字符串|
|boolean|布尔型|
|object|null或者Object|
|function|函数|

所以可以用typeof来判断一个变量是否定义，也是唯一的一个方法，目前没法区分未定义和未赋值，因为对于js来说，这两种情况等效。

3. Object的每个实例都有一个constructor属性，保存着创建当前实例的函数
4. 递增和递减操作符，一元加减操作符，应用于不同的值的规则
1）字符串，使用Number转换后再执行递增或递减操作
2）false活true，转换成数字后再执行相应操作
3）对象，调用valueOf()方法后再执行相应操作
5. 未指定返回值的函数会返回一个undefined值。
6. 不给构造函数传递参数，可以省略后面那一对括号，比如 var a= new Object;
7. 8进制字面量在严格模式下是无效的，会抛出错误；
8. 浮点数如果小数点后面没有任何数字，或则本身就是一个整数，那会解析成整数。比如var floatNum1=1.;//1;var floatNum2=10.0//10;
9. Number.MIN_VALUE和Number.MAX_VALUE保存着最小值和最大值5e-324,1.797693e+308.如果超出了范围，返回的是Infinity或则-Infinity.可以使用isFinite来判断某个值值是不是在范围内，如果是会返回true。
10. 有三个函数可以把非数值转换为数值：Number(),parseInt(),parseFloat()，后两个只能作用于字符串。Number不够合理，经常使用的是parseInt，忽略字符串前面的空格，直到找到第一个非空格字符，如果第一个不是数字或者负号，会返回NaN，直到遇到非数字字符，只返回前面的数字字符，parseInt 认识十六进制和八进制，但不认识科学计数法。浮点数会转换成整数，parseFloat认识科学计数法，但不认识十六进制和八进制，可以得到浮点数，但是如果是整数，那得到的也是整数为了避免错误的解析，parseInt无论在什么情况下都要带上第二个参数即指定是二进制还是八、十、十六进制，如果第二个参数是省略或者是0，将以十进制来解析，如果小于2或者大于36返回NaN

    ```
    Number(true)==1 //1  false:0;
    Number(1)==1
    Number(null)==0;
    Number(undefined) //NaN
    Number("")==0
    Number("12n") //NaN
    Number("0xf")==15 有效的16进制会转成十进制整数
    parseInt("AF",16) //175
    parseInt("AF") //NaN
    parseFloat("10.0")//10
    parseFloat("090.5")//90.5
    其余全是NaN
    ```

## 3.第四章 变量、作用域、内存问题
1. 基本类型值在内存中占据固定大小空间，放在栈内存中，Object放在堆内存中。
2. 2012年后所有的现代浏览器都是使用标记-清除算法进行内存管理，每隔一段时间就会从根开始，遍历所有对象，获得能获取和不能获取的对象，不能获取的对象将会被回收。离开作用域的值会被标记为可以回收，下一次垃圾回收时将被回收。

## 4.第五章 引用类型
1. ECMAScript5新增Array.isArray()函数来检测数组.
2. 数组的valueOf()返回的还是数组，toString()返回的是逗号分隔的字符串。
3. new Array(3)得到的是[]，构造函数只是设置了length属性，但是真正的数组并没有生成。new Array("3")得到的是['3']，new Array(1,2,3)得到的是[1,2,3]。用Array构造函数可以省略new操作符。[1,2,]这样声明在现代浏览器中会生成length为2的数组，但是在IE8-会生成[1,2,undefined]
4. prototype是保存所有实例方法的真正所在，不可枚举。
5. 基本类型值不是对象，比如字符串和数字,但是它们有方法，可以通过基本包装类型.原理是这样的：
    ```
    var s="dddd";
    var s2=s.substring(2);

    //其实后台会自动完成以下处理
    var s=new String("dddd");  //String Number Boolean就是基本包装类型
    var s2.s.subtring(2);   //显示创建的话得到的实例为object，不建议这么使用。
    s=null;  
    ```
5. slice和substring 第二个参数是指定子字符串最后一个字符后面的位置,即这个位置的字符不会进入字符串。substr第二个参数指定的是返回的字符串个数。substring第一个参数比第二个参数大时，会自动交换两个参数的值。
6. slice会把传入的负值与字符串长度相加。substring会把所有负值参数都转换为0。substr会把第一个负的参数加上字符串长度，第二个负的参数为0，因为第二个参数是指定要返回的字符串个数，传入负值，所以应该为0;
7. Math.ceil()向上舍入 Math.floor()向下舍入 Math.round()四舍五入 
8. encodeURI主要用于对整个URI进行编码,不会对本身属于URI的特殊字符进行编码,比如冒号、正斜杠、问号、井号。encodeURIComponent()主要用于对URI的某一段进行编码.会对它发现的所有非标准字符进行编码。相应的有decodeURI和decodeURIComponent方法.
9. 利用apply可以把数组变成一个个参数传递给函数的特性，利用Math.max方法可以快速求得数组的最大值,最小值也是一样的方法。
```
var num=[1,23,4,5,6];
Math.max.apply(Math,num);  //第一个参数可以是null undefined
```

## 5.第六章 面向对象的程序设计
### 1. 创建对象的方法
1) 工厂模式
```
function createPerson(name,age){
    var o=new Object();
    o.name=name;
    o.age=age;
    return o;
}
var person1=createPerson("lidonglin",23);
```
*缺点*：没法解决对象识别，即没法知道一个对象的类型
2) 构造函数模式
```
function Person(name,age){
    this.name=name;
    this.age=age;
    this.sayname=function(){
        alert(this.name);
    };
}
var person=new Person("lidonglin",23);
alert(person instanceof Person); //true
```
*缺点*：sayname方法在每次创建一个Person对象实例会都重新创建一个，没法共享,浪费内存。  
3) 原型模式
```
function Person(){

}
Person.prototype.name="lidonglin";
Person.prototype.age=23;
Person.prototype.sayName=function(){
    alert(this.name);
};
var person1=new Person();
person1.sayName(); //lidonglin
```
*说明1:* 只要创建了一个新函数，默认会给该函数创建一个prototype属性，这个属性指向函数的原型对象。同时，默认所有的原型对象都自动有一个constructor属性，这个属性包含一个指向prototype属性所在的函数的指针。即Person.prototype.constructor指向Person。调用构造函数得到的实例，在chrome ff safari中内部包含一个指针,这个指针指向构造函数的原型,即person.__proto__指向Person.prototype 所以实例和构造函数没有直接的联系。实例会继承原型的constructor属性，所以实例的constructor指向构造函数.
```
function aa (argument) {
        // body...
};
var b=new aa();
console.log(b.__proto__===aa.prototype); //true
console.log(b.constructor===aa);         //true b的constructor是继承来的
console.log(b.prototype);                //undefined
console.log(aa.__proto__);               //
console.log(aa.prototype);
```
*说明2:* 可以简单的用一个包含所有属性和方法的对象字面量来重写整个原型对象。
```
Person.prototype={
    name:"lidonglin",
    age:29,
    sayName:function(){
        alert(this.name);
    }
};
```
这样做的结果就是constructor属性不再指向Person了，这样就隔断了实例和最初原型对象之间的关系。
*缺点*：如果原型中有引用类型值的属性的话，那一个实例改变这个属性值，会改变所有实例中的这个值。  
4）组合使用构造函数模式和原型模式
实例属性放在构造函数中，共享属性和方法放在原型模式中

    ```
    function Person(name,age){
        this.name=name;
        this.age=age;
    }
    Person.prototype={
        constructor:Person,
        sayName:function(){
            alert(this.name);
        }
    }
    ```

### 2. 继承的各种实现方法：
1)原型链：
```
function SuperType(){
    this.color=["red","blue"];
}
SubType.prototype=new SuperType();
var instance1=new SubType();
instance1.color.push("yellow");
alert(instance1.color);        //red,blue,yellow
var instance2=new SubType();
alert(instance2.color)         //red,blue,yellow
    
```

这种方法的问题就是，如果超类有引用型属性，那这个属性会被所有的SubType实例共享，一个实例修改这个属性，其他实例也会有同样的效果。所有很少单独使用。

2)借用构造函数：
就是在子类型构造函数内部调用超类型构造函数，这样子类型就会拥有超类型的所有属性了，各个实例是各自拥有属性的副本，不会相互影响，和原型链相比还有有一个优势就是可以传入参数，存在的一个问题就是方法都在构造函数中，就没有函数复用了，因此也很少单独使用。
```
    function SuperType(name){
        this.name=name;
    }
    function SubType(age){
         Super.call(this，“lidonglin”);
         this.age=age;
    }
```
**tips:**为了确保SuperType的构造函数不会重写子类型的属性，在调用超类型的构造函数之后，再定义子类型自由的属性。
3)原型链+借用构造函数法：
使用原型链实现对原型属性和方法的继承，通过构造函数实现对实例属性的继承。解决了前两个方法的不足之处，其实就是优势互补。是最常用的继承模式。
4)原型式继承
    ```
    var Person={
        name:'li',
        friends:['li']
    }
    var otherPerson=Object.create(Person);  //得到一个原型指定super的空对象，所以他可以共享父对象的所有属性
    /* Object.create原生支持
    其内部原理就是
    function crate(o){
        function F(){};
        F.prototype=o;
        return new F();
    }
    */

    ```
    在不需要创建构造函数时，只是想让两个对象之间保持相识的时候，可以使用原型式继承，此时friends这个数组(引用类型)是被所有实例共享的。

### 3.函数内的this指针问题：
this对象是在运行时基于函数的执行环境绑定的，在全局函数中，this指向window，当函数作为某个对象的方法调用时，this执行调用这个方法的对象，匿名函数的执行环境具有全局性。通常指向window。如果是普通的调用函数，那函数内部的this指针指向的是全局变量，即window对象。如果是构造函数的话，那this指针指向的就是构造出来的对象实例。
```
var name="donglin";
function sayName(name){
    alert(this.name);      
}
sayName("ab");
//运行结果是：donglin
 var name="donglin_g"
 function sayName(name){
         this.name=name;
         alert(this.name);
}
var oo=new sayName("ab");
//运行结果：ab
```
***匿名函数中的this指针：***
下面代码中匿名函数中的this就是指向window对象，并不会指向外部作用域对象。因为函数调用的时候，活动对象会自动获得this，arguments这两个对象，而此时调用匿名函数，this首先搜索自身作用域，此时this就是window，所以不会再向上搜索。
```
var name="the window";
var object={
            name:"the object",
            getName:function(){
                 return function(){
                    return this.name;
                }
            }
        }
alert(object.getName()());
//运行结果是 "the window"
```
为了实现能访问外部作用域的this，把外部作用域中的this对象保存在一个闭包能够访问到的变量里，就可以让闭包访问该对象了。
```
var name="the window";
var object={
            name:"the object",
            getName:function(){
                var that=this;
                 return function(){
                    return that.name;
                }
            }
        }
alert(object.getName()());
//运行结果是 "the object"
```
***tips:***构造函数和普通函数的唯一区别，就在于调用它们的方式不对，任何函数，只要通过new操作符来调用，那他就可以成为构造函数，不通过new操作符，那就是普通函数。
时间绑定函数中的this指向时间处理程序对应的dom对象.
Object.create函数不会调用构造函数
当把函数A作为值传递给一个函数时，函数A里的this会变为window,但是可以通过bind将实例和方法一切传递给函数
```
function Thing() { } 
Thing.prototype.foo = "bar"; 
Thing.prototype.logFoo = function () {      
    console.log(this.foo);
}
 
function doIt(method) {
      method();
}
var thing = new Thing();
doIt(thing.logFoo.bind(thing)); //logs bar
```
bind可以代替任何一个函数或者方法的this,即便它没有赋值给实例的初始prototype
```
function Thing() {
}
Thing.prototype.foo = "bar";
function logFoo(aStr) {
     console.log(aStr, this.foo);
}
var thing = new Thing();
logFoo.bind(thing)("using bind"); //logs "using bind bar"
logFoo.apply(thing, ["using apply"]); //logs "using apply bar"
logFoo.call(thing, "using call"); //logs "using call bar"
logFoo("using nothing"); //logs "using nothing undefined"
```
## 6.第七章 函数表达式
1. 递归函数应该始终使用arguments.callee来递归地调用自身，不要使用函数名--函数名可能会发生变化，argument.callee是一个指向正在执行的函数的指针
2. 每个函数在被调用时，会创建一个执行环境及相应的作用域链。然后使用arguments和其他命名参数来初始化函数的活动对象。函数调用时都会自动取得两个特殊变量：this和arguments,内部函数在搜索这两个变量时,只会搜索到其活动对象为止,因此永远不可能直接访问外部函数中的这两个变量.因此下面这个实例的匿名函数在执行时,活动对象中this是就是全局变量window，所以返回的是the window
    ```
    var name="the window";
    var obj={
        name:"my object",
        getNameFunc:function(){
            return function(){
                return this.name
            } 
        }
    }
    alert(obj.getNameFunc()());   //the window
    ```
    可以把外部函数的this保存在一个匿名函数可以访问的变量中,即使在返回后，that也引用这外部函数中的this,所以这是就会返回"my object"
    ```
    getNameFunc:function(){
        var that=this;
        return function(){
            return that.name;
        }
    }
    alert(obj.getNameFunc()());   //my object
    ```

## 7.第八章 BOM对象
1. 修改window.location、location.href会调用location.assign()方法，所以这三个操作效果是一样的，并会在历史记录中生成一条记录，用replace（）方法就不会生成新纪录。location.reload()重新加载,但是给true参数后,则会从服务器重新加载,否则可能从缓存中加载.
2. localtion中所有属性有：

|属性名|例子|说明|
|---|---|---|
|hash|#main|返回url中的hash,没有就返回空|
|host|www.ldllidonglin.github.io:80|带端口号|
|hostname|www.ldllidonglin.github.io|不带端口号|
|href|http://www.ldllidonglin.github.io|完整url。localtion.toString()也返回这个值|
|port|80|端口号|
|protool|http|协议|
|search|?q=javascript|返回查询字符串|

3. navigator中appCodeName通常都是Mozilla
4. history无法获取用户访问过的url，但是可以go(n) forward() back()实现后退前进，有一个length属性保存这该窗口所有历史记录，第一次打开页面时为0，go函数参数可以是字符串，会跳转到最近的那个包含这段字符串的连接，可以向前或者向后.

## 8 第九章 客户端检测
1. 能力检测，必须检测实际用到的特性
2. 至今基于webkit的浏览器，都在ua中表示为Mozilla/5.0 和基于GecKo引擎的浏览器一致.
3. ua检测浏览器和引擎的代码
    ```
    var client=function(){
        var engine={
            ie:0,
            gecko:0,
            webkit:0,
            khtml:0,
            opera:0,

            //具体的版本
            ver:null
        };
        //浏览器
        var browser={
            ie:0,
            firefox:0,
            konq:0,
            opera:0,
            chrome:0,

            ver:null
        };
        //平台、设备和操作系统
        var system={
            win:false,
            mac:false,
            x11:false,

            //移动设备
            iphone:false,
            ipod:false,
            ipad:false,
            ios:false,
            android:false,
            nokiaN:false,
            winMobile:false,

            //游戏系统
            wii:false,
            ps:false
        };

        var ua = navigator.userAgent;
        //首先检测opera,因为在ua中没法检测出opera
        if(window.opera){
            engine.ver=browser.ver=window.opera.version();
            engine.opera=browser.opera=parseFloat(engine.ver);
        }else if(/AppleWebKit\/(\S+)/.test(ua)){     //判断是否是webit内核
            engine.ver=RegExp["$1"];
            engine.webkit=parseFloat(engine.ver);

            //再确定是Chrome还是Safari
            if(/Chrome\/(\S+)/.test(ua)){
                browser.ver=RegExp["$1"];
                browser.chrome=parseFloat(browser.ver);
            }else if (/Version\/(\S+)/.test(ua)){
                browser.ver = RegExp["$1"];
                browser.safari = parseFloat(browser.ver);
            }else{
                //近似地确定版本号
                var safariVersion = 1;
                if (engine.webkit < 100){
                    safariVersion = 1;
                } else if (engine.webkit < 312){
                    safariVersion = 1.2;
                } else if (engine.webkit < 412){
                    safariVersion = 1.3;
                } else {
                    safariVersion = 2;
                }
                browser.safari = browser.ver = safariVersion;
            }
        }else if(/KHTML\/(\S+)/.test(ua)||/Konqueror\/([^;]+)/.test(ua)){
            engine.ver=browser.ver=RegExp["$1"];
            engine.khtml=browser.konq=parseFloat(engine.ver);
        }else if(/rv:([^\)]+)\) Gecko\/\d{8}/.test(ua)){
            engine.ver=RegExp["$1"];
            engine.gecko=parseFloat(engine.ver);
            //确定是不是Firefox
            if(/Firefox\/(\S+)/.test(ua)){
                browser.ver=RegExp["$1"];
                browser.firefox=parseFloat(browser.ver);
            }
        }else if(/MSIE ([^;]+)/.test(ua)){
            engine.ver=browser.ver=RegExp["$1"];
            engine.ie=browser.ie=parseFloat(engine.ver);
        }
        //检测平台
        var p=navigator.platform;
        system.win=p.indexOf("Win")==0;
        system.mac=p.indexOf("Mac")==0;
        system.x11=p.indexOf("X11")||(p.indexOf("Linux")==0);

        //检测 Windows 操作系统
        if (system.win){
            if (/Win(?:dows )?([^do]{2})\s?(\d+\.\d+)?/.test(ua)){
                if (RegExp["$1"] == "NT"){
                    switch(RegExp["$2"]){
                        case "5.0":
                            system.win = "2000";
                            break;
                        case "5.1":
                            system.win = "XP";
                            break;
                        case "6.0":
                            system.win = "Vista";
                            break;
                        case "6.1":
                            system.win = "7";
                            break;
                        default:
                            system.win = "NT";
                            break;
                    }
                } else if (RegExp["$1"] == "9x"){
                    system.win = "ME";
                } else {
                    system.win = RegExp["$1"];
                }
            }
        }

        //移动设备
        system.iphone = ua.indexOf("iPhone") > -1;
        system.ipod = ua.indexOf("iPod") > -1;
        system.ipad = ua.indexOf("iPad") > -1;
        system.nokiaN = ua.indexOf("NokiaN") > -1;
        //windows mobile
        if (system.win == "CE"){
            system.winMobile = system.win;
        } else if (system.win == "Ph"){
            if(/Windows Phone OS (\d+.\d+)/.test(ua)){;
                system.win = "Phone";
                system.winMobile = parseFloat(RegExp["$1"]);
            }
        }

        //检测 iOS 版本
        if (system.mac && ua.indexOf("Mobile") > -1){
            if (/CPU (?:iPhone )?OS (\d+_\d+)/.test(ua)){
                system.ios = parseFloat(RegExp.$1.replace("_", "."));
            } else {
                system.ios = 2; //不能真正检测出来，所以只能猜测
            }
        }
        //检测 Android 版本
        if (/Android (\d+\.\d+)/.test(ua)){
            system.android = parseFloat(RegExp.$1);
        }

        //游戏系统
        system.wii = ua.indexOf("Wii") > -1;
        system.ps = /playstation/i.test(ua);

        return {
            engine:engine,
            browser:browser,
            system:system
        };

    }();
    ```
4. 优先使用能力检测，在需要知道平台和确切浏览器的时候才用ua检测

## 9 第10章 DOM
1. 文档对象模型(DOM)是HTML和XML文档的编程接口
2. cloneNode在IE8-会复制绑定在元素上的事件，其他浏览器都不会。
3. document对象是HTMLDocument(继承自Document类型)的一个实例,Document节点nodeType是9,nodeName是“#docuemnt”,nodeValue是null。文档只有一个子节点，就是<html>元素，document.documentElement可以访问到。document.body指向body元素
4. document.domain设置为"wrox.com"后，就不能再设置为"p2p.wrox.com"。
5. getElementsByTagName得到的是HTMLCollection支持按名称访问，及可以向方括号中传入字符串，比如images["myImage"],或者使用namedItem("myImage");
6. 取得所有元素可以使用getElementsByTagName("*");
7. document对象上有几个特殊集合 

|name|意义|
|---|---|
|document.forms|所有表单|
|document.images|所有的img元素|
|document.links|带href属性的a元素|
|document.anchors|带name属性的a元素|   

8. div.getAttribute("class")==div.className。getAttribute可以取得自定义特性，自定义特性应该加上data-前缀。直接以点号获取是没法获取到自定义属性的。
9. 有两类特色的属性，一是style，getAttribute得到的是css文本，但是直接用点号获取的是一个对象。二是onclick,getAttribute得到的是js代码的字符串,直接用点号访问获取的是一个js函数。
10. 一般情况下不使用getAttribute这个函数，只有在获取自定义特性值时才使用这个函数.
11. element.childNodes在IE8-是不会包括元素之间的空白符的，IE9+和其他浏览器会.
12. Text节点nodeName是#text,nodeValue==data是其包含文本;text.length==text.nodeValue.length==text.data.length属性包含字符数目(换行符的长度==3);text.appendData(text)可以将text文本添加到末尾;设置nodeValue时,html为被转义,所以直接nodeValue="\<strong\>other\</strong\>";不会出现dom节点;createTextNode("\<strong\>hello\</strong\>")可以创建文本节点;node.normalize()方法可以将多个文本节点合并成一个节点。
13. DocumentFragment可以在需要多次修改dom是使用，createDocumentFragment()创建文档碎片，然后把需要插入的节点插入到文档碎片中，然后再向DOM中一次性插入文档碎片.

## 10 第11章 DOM扩展 
1. 对DOM的两个主要扩展就是SelectorsAPI和HTML5,前者是增加了querySelector()、querySelectorAll()、matchesSelector()三个方法。后者就是增加了getElementsByClassName()、innerHTML属性;outerHTML是包含自身的。
2. insertAdjacentHTML(),第一个参数有4个值:beforebegin、afterbegin、beforeend、afterend.分别是元素前、元素内第一个位置、元素内最后一个位置、元素后;
3. 在需要遍历元素的时候，因为childNode在很多浏览器是会包括文本节点的，所以可以使用children属性，他只包括元素节点，但是IE8-会包括注释节点。
4. innerText和outerText在读取文本值的时候效果是一样的。都是对象起始和结束标签内的所有文本，包括子节点的。但是在设置文本的时候，outerText会连带把标签本身都替换了。fireFox不支持innerText,也没有outerText,innerText的作用可以用textContent代替。

## 11 第12章 DOM2和DOM3 
1. 对于使用短划线的css属性名，必须转成驼峰大小写形式，才能通过JavaScript来访问.float是例外，IE8-下是styleFloat,现代浏览器已经支持直接使用style.float来访问了.
2. document.defaultView.getComputedStyle(myDiv,null)可以获得计算后的样式,第二个参数支持伪元素字符串，比如":after";IE8-没有这个方法，但是可以用myDiv.currentStyle来获得计算后的样式，没有border属性。因为css属性的默认值在不同浏览器有可能不同，所以如果需要某个特定属性的默认值，应该手工指定.
3. document.styleSheets获得link和style设置的样式表。也可以通过获取link和style标签来获得样式表对象，IE8-使用element.styleSheet，其他支持element.sheet。假设要获得页面中第一个样式表中的第一个样式规则，代码可以如下
    ```
    var sheet = document.styleSheets[0];
    var rules = sheet.cssRules || sheet.rules; //取得规则列表
    var rule = rules[0]; //取得第一条规则
    alert(rule.selectorText); //"div.box"
    alert(rule.style.cssText); //完整的 CSS 代码
    alert(rule.style.backgroundColor); //"blue"
    alert(rule.style.width); //"100px"
    alert(rule.style.height); //"200px"
    sheet.insertRule("body { background-color: silver }", 0); //DOM 方法
    ```
4. dom的offsetWidth和offsetHeight属性包括边框和内边距。offsetLeft和offsetTop表示和已经定位的父容器(relative、absolute)的距离。clientWidth和clientHeight是内容+内边距，不包括边框。clientLeft和clientTop就是边框的宽度
5. 元素自带getBoundingClientRect(),这个方法返回一个矩形对象,自带left、top、right、bottom属性,chrome高级版本还会给出width和height属性,给出了元素在页面中相对视口的位置.width=right-left,height=bottom-top;IE8-文档左上角坐标是(2,2),需要处理兼容性。
6. DOM2提供了遍历和范围的接口，NodeIterator和TreeWalker可以对DOM执行深度优先的遍历。范围是选择DOM结构中特定部分，然后再实行相应的操作。IE8-只支持文本范围.

## 12 第13章 事件
1. DOM事件流中，IE首先提出冒泡，Netscape提出捕获。在IE9+ 及其他浏览器中，都支持冒泡和捕获。规范规定在捕获阶段，目标是不会触发事件的，但是IE9+和其他浏览器都会在捕获阶段触发事件对象上的事件。所以就有两个机会在目标对象上操作事件。
2. element.onclick是DOM0级事件，同时被认为是元素方法，所以事件处理函数是在element的作用域中运行的。而且是冒泡的。同时event对象是window下的一个属性
3. DOM2级事件用addEventListener()和removeEventListener()来制定和删除事件处理程序。也是在元素作用域内运行的，第三个参数默认是false，为冒泡阶段执行。可添加多个事件处理函数，按顺序执行。添加匿名函数无法移除，因为移除必须和添加时使用的参数相同才行。
4. IE8-只支持冒泡，而且它是使用attachEvent()和detachEvent()来指定和移除的。而且事件处理程序作用域是window。添加多个处理函数时，触发顺序和堆栈一样。会传递一个参数event到事件处理函数中
5. 以下是夸浏览器的事件处理程序：
    ```
    var EventUtil={
        addHandler:function(element,type,handler){
            if(element.addEventListener){            //chrome ...之类的浏览器方式
                element.addEventListener(type,handler,false);//默认是false
            }else if(element.attachEvent){           //IE
                element.attachEvent("on"+type,handler);  //IE不支持捕获
            }else{
                element["on"+type]=handler;
            }
        },
        removeHandler:function(element,type,handler){
            if(element.removeEventListener){
                element.removeEventListener(type,handler,false);
            }else if(element.detachEvent){
                element.detachEvent("on"+type,handler){
            }else{
                element["on"+type]=null;
            }
        },
        getEvent:function(event){
            return event?event:window.event;
        },
        getTarget:function(event){
            return event.target||event.srcElement;
        },
        getRelatedTarget:function(event){
            if(event.relatedTarget){
                return event.relatedTarget;
            }else if(event.toElement){
                return event.toElement;
            }else if(event.fromElement){
                return event.fromElement;
            }else{
                return null;
            }
        },
        preventDefault:function(event){
            if(event.preventDefault){
                event.preventDefault();
            }else{
                event.returnValue=false;   直接return false;也是可以的
            }
        },
        stopPropagation:function(event){
            if(event.stopPropagation){
                event.stopPropagation();
            }else{
                event.cancelBubble=true;
            }
        },
        getRelatedTarget: function(event){
            if (event.relatedTarget){
                return event.relatedTarget;
            } else if (event.toElement){
                return event.toElement;
            } else if (event.fromElement){
                return event.fromElement;
            } else {
                return null;
            }
        },
        getWheelDelta: function(event){
            if (event.wheelDelta){
                return (client.engine.opera && client.engine.opera < 9.5 ?
                    -event.wheelDelta : event.wheelDelta);
            } else {
                return -event.detail * 40;
            }
        },
        getCharCode: function(event){
            if (typeof event.charCode == "number"){
                return event.charCode;
            } else {
                return event.keyCode;
            }
        },
    };
    ```
6. img对象在设置了src后就会开始下载，但是script对象只有在设置了src并添加到文档中后才会开始下载。这两个都有load事件，但是IE8-不支持script上的load事件
7. event.clientX和event.clientY是视口坐标，pageX和pageY是页面坐标。IE8-支持pageX但是可以通过视口坐标和scroll坐标计算得到。screenX是屏幕坐标。offetX和offetY是相对于目标元素边界的坐标
8. 针对mouseover和mouseout有event.relatedTarget这个属性来获得相关元素，IE8-可以用fromElement和toElement来获得。
9. mousewheel时间有一个wheelData，向前是120的倍数，向后是-120的倍数。Firefox是在event.detail中，向前是-3的倍数，向后是3的倍数。
10. 键盘事件中，keydown是按下任意键，keypress是字符键，随后触发文本事件textInput事件，再触发文keyup事件。event.keyCode对应着键盘的上字符的ASCII码,用String.fromCharCode可以获得字符，但是对于特殊字符和小键盘上的需要特殊处理。小键盘对应着小写字母，比如小键盘上的1，对应着a。textInput事件的event属性上有data属性对应着输入的字符，inputMethod属性对应着输入方式，只有按下能够输入实际字符的键时才会触发
11. 减少内存占用和有优化性能有两个方式：事件委托和在不需要的时候移除事件处理程序。移除事件处理程序时需要注意当移除DOM时，如果这个DOM绑定了事件处理程序，在移除前需先移除其绑定的事件处理程序。

## 13 第14章 表单脚本
1. 通过document.forms可以获得页面中所有表单，表单元素有length属性表示表单中控件的数量。elements属性是表单中所有控件的集合。reset()重置所有控件为默认值;submit()为提交表单。
2. submit按钮或者图片按钮就可以提交表单，此时会触发表单的submit事件，就可以在相应的事件处理函数中进行相应处理，阻止默认事件就可以阻止表单提交。在这里可以处理重复提交的问题。
3. 表单中的控件都有focus和blur方法，可以在页面的load事件中，调用第一个表单字段的focus()方法，使焦点转移到第一个字段。
4. 文本框有select方法和select事件，value属性既是文本框中的输入文本。要取得选中的文本，HTML5有text.selectionStart和selectionEnd两个属性，所以text.value.substring(text.selectionStart,text.selectionEnd)可以获得选中的文本，但是IE8-不支持这两个属性，可以使用document.selection.createRange().text来获得。
5. 选择部分文本的跨浏览器方法：
    ```
    function selectText(textbox, startIndex, stopIndex){
        if (textbox.setSelectionRange){
            textbox.setSelectionRange(startIndex, stopIndex);
        } else if (textbox.createTextRange){                 //IE8-
            var range = textbox.createTextRange();
            range.collapse(true);
            range.moveStart("character", startIndex);
            range.moveEnd("character", stopIndex - startIndex);
            range.select();
        }
        textbox.focus();
    }
    ```
6. 操作剪贴板有copy paste等事件，event.clipboardData.setData()、getData()可以对剪贴板进行操作。复制选中的文本到剪贴板中代码如下
    ```
    if (this.target.nodeName === 'INPUT' || this.target.nodeName === 'TEXTAREA') {
        this.target.select();
        this.selectedText = this.target.value;
    } else {
        var range = document.createRange();
        var selection = window.getSelection();

        range.selectNodeContents(this.target);
        selection.addRange(range);
        this.selectedText = selection.toString();
    }
    document.execCommand("copy");
    ```
7. 选择框有options属性保存着所有option，selectedIndex是选中项的索引，多选只保存第一项的值，没有选中的话是-1，size属性可以设置选择框中可见的行数，默认是0；其type属性不是select-one就是select-multiple。value属性由当前选中项决定，首先是选中项的value属性，既是是设定的空值或者空字符串，但是如果没有设定value属性，那就是该选中项的文本（IE8除外），多选只会取第一项。change事件只要选中了选项就会触发和其他表单不一样。
8. option有一个index属性保存着这个选项在option中的索引。selected是一个是否被选中的布尔值。
9. selectbox2.appendChild(selectbox1.options[0])；这段代码将会把原来的元素从其父节点中移除，然后添加到指定的位置
10. 富文本编辑器有两种方式，1是在页面中嵌入一个包含空HTML页面的iframe，必须在页面加载完后，通过设置designMode=‘on’，那这个页面就可以被编辑。2是给任何元素设置contenteditable=true，然后这个元素包含的任何文本内容就都可以编辑了，利用document.exeCommand()可以对该区域执行很多操作。queryCommandState()可以返回是否对选中文本执行了某个操作。
11. 富文本编辑很多时候是使用iframe而非表单控件实现，所以要提交富文本编辑器中的html就需要添加一个隐藏的表单字段，然后从iframe中提出出innerHTML赋给这个表单字段的value。

## 14 第15章 使用canvas绘图
1. 使用canvas要先给它这是height和width，canvas上是有两套width和height值的，在css上只能设置这个dom的大小，而不能改变绘图区域的大小，默认是300*150，直接在canvas标签上设置是既可以更改dom大小，又可以更改绘图区域大小。如果不直接在canvas上设置width和height，而只在css上设置，则会拉伸绘图的内容，比如
    ```
    canvas{
        width:600px;
        height: 300px;
    }
    <canvas></canvas>
    js..
    context.fillRect(0,0,300,150);
    ```
    实际出来的效果是把这个绘制的300*150大小的矩形拉伸到600*300了。布满整个DOM,DOM大小是600*300。
2. context可以调用save方法，把所有的设置比如颜色，线宽等保存进入一个栈结构，要想回到之前保存的设置，就可以调用restore()方法。
3. webgl视口坐标原点在canvas元素的左下角，x轴和y轴的正方向分别是向右和向上。
改变视口大小可以使用gl.viewport(0,0,drawing.widht,drawing.height)；视口内部的坐标原点在视口的中心点。
4. webgl一般不会抛出错误，为了知道是否有错误发生，必须在调用某个可能出错的方法后，手动调用gl.getError()方法，获得错误。

## 15 第16章 HTML5脚本编程
1. postMessage方法，可以向当前页面中的iframe或者当前页弹出的窗口发送消息。 然后接收方window对象上有message事件，可以监听这个事件作接收消息的处理。
2. 拖动先触发dragstart事件，然后不断触发drag事件，当某个元素被拖动到一个有效的放置目标上时，会依次发生dragenter、dragover、dragleave事件，如果放置在目标元素中，会触发drop中。
3. dragstart事件中可以调用event.dataTransfer.setData("text","some text")；在drop中也可以调用getData来获取数据。
4. HTML5为所有HTML元素规定了一个draggable属性，表示元素是否可以拖动，图像和链接的draggable属性自动被设置成了true，其他的都是false。IE10+支持

## 16 第17章 错误处理与调试
1. ECMA3引入了try-catch语句，catch语句返回一个error对象，它有message、name属性。同时可以在后面添加finally子句，这个子句是一定会执行的，甚至在try或者catch里又return语句，也不能阻止finally子句的执行。
2. 将错误上报可以使用img的src属性来发送请求，把错误信息当参数发送get请求。


## 17 第18章 JavaScript和XML
## 18 第19章 E4X
## 19 第20章 JSON
1. JSON可以表示简单值、对象、数组三种类型的值，不支持undefined
2. JSON属性值必须加双引号，对象可以不用。
3. JSON.stringify()第二个参数可以实现过滤功能，可以是一个数组也可以是一个函数。如果是一个数组，那数组内的元素就是要过滤得到的属性名，如果是一个函数，那会传给函数两个参数，属性名和属性值。返回属性值，如果返回的是undefined，那这个属性会被删除掉。第三个参数用于控制缩进和空白符，传入一个数字表示空白符的长度，最长为10，如果传入的是一个字符串，则这个字符串被用作缩进字符。
4. JSON.parse()也可以接收第二个参数，是一个函数，传给这个函数的两个参数是属性名和属性值。返回属性值。

## 20 第21章 Ajax与Comet
1. 默认情况下，在发送XHR请求的同时，还会发送以下头部信息

|name|意义|
|---|---|
|Accept|浏览器能够处理的内容类型。|
|Accept-Charset|浏览器能够显示的字符集。|
|Accept-Encoding|浏览器能够处理的压缩编码。|
|Accept-Language|浏览器当前设置的语言。|
|Connection|浏览器与服务器之间连接的类型。|
|Cookie|当前页面设置的任何 Cookie。|
|Host|发出请求的页面所在的域 。|
|Referer|发出请求的页面的URI。注意，HTTP规范将这个头部字段拼写错了，而为保证与规范一致，也只能将错就错了。（这个英文单词的正确拼法应该是 referrer。）|
|User-Agent|浏览器的用户代理字符串。|

2. 可以在open之后，send之前调用setRequestHeader方法，设置自定义的请求头信息。getRequestHeader()可以获得相应的相应头部信息。getAllResponseHeader()则可以取得一个包含所有头部信息的长字符串。
3. xhr2增加了FormData，new FormData()可以直接append值对，然后把FormData传给send方法，发送到服务端。方便之处在于不必明确的在xhr对象上设置请求头部。
4. xhr2还增加了timeout属性，在给timeout属性设置一个值后，如果在规定的时间没有接收到相应，就会触发timeout事件。
5. xhr2还增加了overrideMimeType方法，用于重写xhr相应的MIME类型。
6. 进度事件，progress事件的event.target属性是xhr对象，但是增加了lengthComputable表示进度信息是否可用的布尔值、position表示已经接收的字节数、totalSize表示总字节数三个属性。onpress需在open之前添加
7. xhr对象使用CORS来实现跨域，但是不能使用setRequestHeader设置自定义头部，不能发送和接收cookie，调用getAllResponseHeader方法会放回空字符串
8. Comet是对Ajax的进一步扩展，让服务器几乎能够实时地向客户端推送数据，实现手段主要有长轮询和HTTP流。
9. Web Sockets是一种与服务器进行全双工、双向通信的信道，不使用HTTP协议，而使用自定义的协议。也必须使用不同的Web服务器。可以只经过一次http请求，就可以做到源源不断的消息传送。

## 21 第22章 高级技巧
1. 可以创建作用域安全的构造函数，确保在缺少new操作符时调用构造函数不会改变错误的环境对象，因为直接调用函数时，this对象是window，而使用new操作符时，this指向新创建的对象实例。
    ```
    function Person(name,age,job){
        if（this instanceof Person){
            this.name=name;
            this.age=age;
            this.job=job;
        }else{
            return new Person(name,age,job);
        }
    }
    ```
2. 大量if语句时，可以采用惰性载入，即在第一次调用的过程中，该函数会被覆盖为另外一个按合适方式执行的函数，这样，第二次调用这个函数时，就不会再经过多次的if了
    ```
    function createXHR(){
        if(typeof XMLHttpRequest!="undefined"){
            createXHR=function(){
                return new XMLHttpRequest();
            };
        }...
        ...
        return createXHR();
    }
    ```
3. 定时器代码是放在一个等待区域，直到时间间隔到了以后，此时将代码添加到JavaScript的处理队列中，等待下一次JavaScript进程空闲时被执行，setTimeout() setInterval()里的this指向window；
4. 函数绑定，一个bind函数接收一个函数和一个环境，返回一个在给定环境中调用给定函数的函数。并且将所有参数原封不动的传递过去。现在ECMA5已经原生给所有函数都增加了bind函数，IE9+支持。可以直接fn.bind(context);
    ```
    function bind(fn,context){
        return function(){
            return fn.apply(context,arguments);
        };
    }
    ```
5. 函数柯里化和函数绑定一样提供了动态创建函数功能，返回一个函数，下面是一个复杂的bind函数
    ```
    function bind(fn, context){
        var args = Array.prototype.slice.call(arguments, 2);  //剩余参数
        return function(){
            var innerArgs = Array.prototype.slice.call(arguments);  //返回函数接收的参数
            var finalArgs = args.concat(innerArgs);
            return fn.apply(context, finalArgs);
        };
    }
    ```

## 22 第23章 离线应用于客户端存储
1. 开发离线应用第一步是要知道设备是在线还是离线，navigator.onLine属性为true就是表示设备可以上网。同时window上还可以绑定online和offline两个事件。
2. html标签中的manifest属性指定缓存描述文件的地址。
3. CookieUtil代码
    ```
    var CookieUtil = {
        get: function (name){
            var cookieName = encodeURIComponent(name) + "=",
            cookieStart = document.cookie.indexOf(cookieName),
            cookieValue = null;
            if (cookieStart > -1){
                var cookieEnd = document.cookie.indexOf(";", cookieStart);
                if (cookieEnd == -1){
                    cookieEnd = document.cookie.length;
                }
                cookieValue = decodeURIComponent(document.cookie.substring(cookieStart+ cookieName.length, cookieEnd));
            }
            return cookieValue;
        },
        set: function (name, value, expires, path, domain, secure) {
            var cookieText = encodeURIComponent(name) + "=" +encodeURIComponent(value);
            if (expires instanceof Date) {
                cookieText += "; expires=" + expires.toGMTString();
            }
            if (path) {
                cookieText += "; path=" + path;
            }
            if (domain) {
                cookieText += "; domain=" + domain;
            }
            if (secure) {
                cookieText += "; secure";
            }
            document.cookie = cookieText;
        },
        unset: function (name, path, domain, secure){
            this.set(name, "", new Date(0), path, domain, secure);
        }
    };
    ```
3. 使用sessionStorage和localStorage会触发storage事件。localStorage一般限制是5MB
4. IndexDB是一种类似SQL数据库的结构化数据存储机制。但是它的数据不是保存在表中，而是保存在对象存储空间中，可以存储大量数据

## 23 第24章 最佳实践
1. 编写可维护的js代码
1）首先代码约定，函数尽量使用动词开头，因为js中变量松散，所以变量命名时可以在名字前加一个或多个字符表示数据类型。
2）js和html尽量分离，css和js也要尽量分离，js控制css尽量使用更改样式类的形式来实现，而不是直接修改特定样式。应用逻辑和事件处理程序相分离。
3）不要为实例或者原型添加属性和方法，永远不修改不由你拥有的对象。
4）需要多处使用的值都可以抽取为常量，比如URLs，最好使用一个公共地方来存放所有URL，用户界面字符串应该被抽取出来，以方便国际化。
2. JavaScript性能优化
1）避免全局查找，将在一个函数中多次用到的全局变量存储为局部变量
2）避免使用with语句，因为会增加作用域的长度，增加查找作用域的时间，解决办法也是用局部变量
3）减少属性查找，因为属性查找要遍历会对原型链中拥有改名称的属性进行一次搜索，多次用到的属性，可以存储在局部变量中。
4）优化循环，使用减值迭代，简化终止条件，简化循环体
5）当循环次数是确定的，消除循环，使用多次函数调用可能更快。
6）使用eval()或者setTimeout传一个字符串参数时，都会重新启动一个解释器来解析新的代码，尽量避免使用。
7）尽量使用数组和对象的字面量表达方式来消除不必要的语句。
8）优化DOM操作，使用documentFragment来优化插入操作。使用innerHTML来创建DOM节点要比原生createElement再appendChild更快。最小化访问HTMLCollection的次数，因为它是一个动态，每一次访问，它都会查询一次。尽量使用事件代理。

## 24 第25章 新兴的API
1. requestAnimationFrame实现平滑的动画循环
    ```
    function updateProgress(){
        var div = document.getElementById("status");
        div.style.width = (parseInt(div.style.width, 10) + 5) + "%";
        if (div.style.left != "100%"){
            mozRequestAnimationFrame(updateProgress);
        }
    }
    mozRequestAnimationFrame(updateProgress);
    ```
2. pageVisibility API可以让开发人员指导页面是否可见，并且有visibilitychange事件，当文档可见性变化时，触发该事件。
3. geolocation实现了地理定位
4. File API在IE10+上实现了访问计算机中的文件，file控件的event.target.files保存着用户选中的文件列表，每个对象有name，size，type，lastModifiedDate字符串。FileReader实现的异步文件读取机制。所以有progress、error、load等事件。error.code是错误码，对应错误信息。可以读取部分内容。
5. 结合拖放API和File API可以实现读取、上传拖放的文件。
6. window.performance.navigator包含着好几个属性，比如redirectCount页面加载前的重定向次数。type，表示刚刚发生的导航类型。window.timing也是一个对象，这个对象的属性都是时间戳，navigatorStart表示开始导航到当前页面的时间，fetchStart开始通过GET取得页面的时间，connectStart和connetEnd浏览器连接到服务器的时间等等，通过这些时间值，就可以全面了解页面在被加载到浏览器的过程中都经历了哪些阶段，哪些阶段是影响性能的瓶颈。目前IE10+和chrome支持。
7. Web Workers可以运行异步JavaScript代码，避免阻塞用户界面。new一个worker，然后通过postMessage方法传数据给worker，worker通过onmessage来监听，同时也用postMessage来向页面发送消息，worker内不能操作DOM，一般用来处理比较耗时的操作比如复杂计算等。




