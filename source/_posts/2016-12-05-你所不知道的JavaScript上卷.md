---
title: 你所不知道的JavaScript上卷
tags: [JavaScript]
date: 2016.12.05
categories: 读书笔记
---
# 第一部分 作用域和闭包
## 作用域
* 源代码在执行前一般会有三个步骤：词法分析(分词0)、解析（构造AST）、代码生成（AST转成可执行代码）
* 作用域是一套规则，用于确定在何处以及如何查找变量，赋值就用LHS查询，取值就是RHS查询。不成功的RHS会抛ReferenceError
<!--more-->
## 词法作用域
* 词法作用域就是定义在词法阶段的作用域，是由写代码时将变量和块作用域写在哪里决定的。
* eval和with会在运行时修改词法作用域，导致无法再词法分析阶段明确知道当前作用域会发生怎样的修改，所以引擎也就没法优化，导致性能下降。

## 函数作用域和块作用域
* 函数是JavaScript中最常见的作用域单元；try/catch结构在catch分句中具有块作用域;ES6中引入了let关键字，可以在任意代码块中声明变量

## 提升
* var a=2;这包括声明和赋值两部分;
* 只有声明本身会被提升，而赋值或其他运行逻辑会留在原地
* 普通块内部的函数声明通常会被提升到所在作用域的顶部
  ```
  foo(); //'b'
  var a = true;
  if(a){
    function foo(){console.log('a');}
  }else{
    function foo(){console.log('b');}
  }
  ```
* 函数表达式是赋值操作，不会提升。

## 作用域闭包
* 无论通过何种手段将内部函数传递到所在的词法作用域以外，他都会持有对原始作用域的引用，无论在何处执行这个函数都会使用闭包。

# 第二部分 this和对象
## 关于this
* this不指向函数本身也不指向函数的词法作用域，this是在函数被调用的时候绑定的，其指向取决于函数在哪调用。

## this全面解析
* Array.forEach(callback, thisArg)也是一种显示绑定，它也使用了call或者apply
* new绑定、显示绑定、隐式绑定、默认绑定优先级由高到低
 ```
 //下面代码说明new比显示绑定要高
 function foo(s){
    this.a=s;
  }
  var obj={};
  var bar=foo.bind(obj);
  bar(2);
  console.log(obj.a);
  var baz=new bar(3);
  console.log(obj.a);
  console.log(baz.a);
 ```
* 当把null、undefined作为this的绑定对象传入call或者apply中时，这些值在调用时会被忽略，实际应用的是默认绑定。
* 赋值时容易发生间接引用
 ```
 function foo(){
    console.log(this.a);
 }
 var a = 2;
 var o = { a:3, foo:foo };
 var p = { a:4 };
 o.foo(); // 3
 (p.foo() = o.foo())(); //2
 ```
 * 对于默认绑定，决定this绑定对象的并不是调用位置是否处于严格模式，而是函数体是否处于严格模式，是的话会被绑定到undefined。
 * 硬绑定后，无论函数在哪调用都会带上绑定的this，除了new也无法改变了
   ```
   function aa(){
     console.log(this.a)
   }
   b={a:2};
   c={a:4}
   aa.call(b) //2
   aa() //2
   aa.call(c) //4
   aa(); //2
   ```
 * 箭头函数的绑定无法被修改，new也不行。它是根据当前词法环境来决定this，会继承外层函数调用的this绑定。

## 对象
* 字面量表示的字符串或者数据还有布尔值，并不是对象，当使用比如str.length时，是js引擎自动把字面量转换成String对象
* Object、Array、Function、RegExp无论是字面量还是构造形式，都是对象。
* 在对象中，属性名永远是字符串。
* 判断一个对象是否可枚举，可以用for in 或者propertyIsEnumerable('a')
* Object.keys(..) 会返回一个数组,包含所有可枚举属性, Object.getOwnPropertyNames (..)
会返回一个数组, 包含所有属性, 无论它们是否可枚举
* 访问属性时，引擎实际上会调用内部的默认[[Get]]操作,设置时是调用[[Put]].[[Get]]会检查对象本身是否包含这个属性，如果没有的话会查找原型链
* 属性的特性可以通过属性描述符来控制， 比如 writable、 configurable、enumerable
    ```
    Object.defineProperty(myObject, "a", {
        value: 2,
        writable: true,
        configurable: true,
        enumerable: true
    });
    ```
* 属性不一定包含值——它们可能是具备 getter/setter 的“ 访问描述符”。 此外， 属性可以是
可枚举或者不可枚举的， 这决定了它们是否会出现在 for..in 循环中
    ```
    var myObject = {
        // 给 a 定义一个 getter
        get a() {
            return 2;
        }
    };
    Object.defineProperty(
        myObject, // 目标对象
        "b", // 属性名118 ｜ 第 3 章
        { // 描述符
            // 给 b 设置一个 getter
            get: function(){ return this.a * 2 },
            // 确保 b 会出现在对象的属性列表中
            enumerable: true
        }
    );
    ```
* 可以使用 ES6 的 for..of 语法来遍历数据结构（ 数组、 对象， 等等） 中的值， for..of
会寻找内置或者自定义的 @@iterator 对象并调用它的 next() 方法来遍历数据值

## 混合对象“类”
面向对象编程中，JavaScript中的类，以及继承，多态

## 原型
* 给对象赋值，如果key在prototype中存在并且被设置为writable:false，那赋值将失败，没法重写该属性
* var a = new Foo() 就是把a的[[Prototype]]关联到Foo.prototype指向的那个对象，所以a可以访问Foo.prototype上的属性
* JavaScript 机制和传统面向类语言中的“ 类初始化” 和“ 类继承” 很相似， 但是JavaScript 中的机制有一个核心区别， 那就是不会进行复制， 对象之间是通过内部的[[Prototype]] 链关联的
* Bar.prototype = Object.create(Foo.prototype)是一种没有副作用的原型链继承方式

# 行为委托
* 类是一种可选的设计模式，而且在JavaScript这样的语言中实现类其实很别扭，还不如直接使用它的原型链
* 继承直接用Child.prototype = Object.create(Parent.prototype)