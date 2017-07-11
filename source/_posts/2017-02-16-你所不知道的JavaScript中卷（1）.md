---
title: 你所不知道的JavaScript中卷（1）
tags: [JavaScript]
date: 2017.02.16
categories: 读书笔记
---
## 第一章 类型
* 变量没有类型，但他们持有的值有类型，类型定义了值的行为特征，typeof undefined和 undeclared虽然都返回Undefined。之所以typeof 未定义的变量不会报错，是因为[typeof操作符](https://tc39.github.io/ecma262/#sec-typeof-operator)会判断是否是未定义的变量，如果是，则直接返回"undefined"
* typeof null === 'object'
<!--more-->
## 第二章 值
* 数组，delete其中的值不会改变length
* 数组，添加字符串属性，不会改变length，除非是能转换成数字的字符串值
* 字符串的成员函数不会改变其原始值，而是创建并返回一个新的字符串。
* 数字中的‘.’运算符会被优先识别为数字常量的一部分，然后才是对象属性访问运算符，所以42.toFixed(3)会报语法错误。
* 如果想把代码中的值设为Undefined，可以使用void expression
* window.isNaN是检查是否不是NaN，也不是数字，参数是string，也会返回true
  ```
  if (!Number.isNaN) {
    Number.isNaN = function(n) {
      return n !== n;
    };
  }
  ```
* 基本类型值是通过值复制来赋值/传递，而复合值（对象等）是通过引用复制来赋值/传递的

## 第三章 原生函数
* 原生函数就是说String,Array(),Number()之类的，尽量不要使用这些原生函数
  ```
  var a = new String("a");typeof a // "object"
  var b = new Boolean(false);
  if(b) {
    console.log("会执行到这")
  }
  ```
* 创建Date对象必须使用new Date()，可以带参数，如果不用new，带的参数会被忽略，直接返回当前Unix时间的字符串
* Function.prototype是一个空函数，RegExp.prototype是一个正则表达式，Array.prototype是一个数组

## 第四章 强制类型转换
* undefined、function、symbol都是不安全的JSON值，JSON.string.ify时遇到这三个会自动忽略，如果在数组中，为了保证单元位置不变，会返回null。如果对象中定义了toJSON()方法，会先调用toJSON方法，然后再序列化
* JSON.stringify有一个可选参数replacer，可以是数组或者函数，用来指定对象序列化过程中哪些对象的属性要被处理。如果是函数，针对某个属性返回undefined，该属性就会被忽略，还有一个space可选参数，正整数就是缩进的字符数，字符串的话前十个会被用来每一级的缩进
* 除了假值列表中的值，其他的都为true，假值列表是undefined、null、false、+0、-0、NaN、‘’;
* 假值对象转换为布尔值为true，比如Boolean(false)为true
* ~运算符也会导致强制类型转换，~x === -(x+1),所以~可以用在indexOf函数的结果，因为~-1 === 0 为false
* ||和&&只是返回两个操作数中的其中一个，并不是返回布尔值,||如果第一个为false,返回第二个值，否则返回第一个。&&如果第一个是false,返回第一个，否则返回第二个。在if等条件表达式中，最终会执行布尔值的隐式强制类型转换
*  Symbol类型可以被强制转换为String，但是隐式转换为String会报错，强制转换或者隐式转换为布尔值都会是true，不能转换为Number，显示和隐式都会报错
*  ==操作符规则比较多，详细规则参见规范

## 第五章 语法
* 标签语句，下面语句是合法的，foo是语句bar()的标签
  ```
  {
      foo: bar()
  }
  
  ```
  利用标签语句可以实现goto的效果
  ```
  // 标签为foo的循环
    foo: for (var i=0; i<4; i++) {
            for (var j=0; j<4; j++) {
                if ((i * j) >= 3) {
                    console.log( "stopping!", i, j );
                    break foo;
                }
                console.log( i, j );
            }
        }
        // 0 0
        // 0 1
        // 0 2
        // 0 3
        // 1 0
        // 1 1
        // 1 2
        // 停止！ 1 3
  ```
  这样就能实现跳出外层循环
* {}即可以作为对象常量，也能作为代码块
  ```
  [] + {} // [object Object]
  {} + [] // 0
  ```
  因为第一句，{}被当做一个对象才操作，第二句{}被当作一个空的独立代码块，返回undefined，所以 + []结果是0
* JavaScript语法中其实是没有else if的，我们常用的else if其实是如下形式：
  ```
  if (a) {
    // ..
  }
  else {
    if (b) {
      // ..
    }
    else {
      // ..
    }
  }
  ```
* [运算符优先级](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)
* ？：和=是右关联
* 自动插入分号是一种纠错机制，规范中规定的几种自动插入分号的情况，大部分都是因为如果缺少分号会报错。
* 需要注意函数里有带有return的try...catch语句，要明确哪个return先执行.try里的return会先执行，但是会执行完finally后，再返回函数的返回值
  ```
  function foo() {
    var a = 1
    try {
        return a += 1;
    }
    finally {
        console.log("finally" + a );
    }
    console.log( "never runs" );
  }
  console.log( foo() );
  // finally2
  // 2
  ```
* 规范中定义了很多早期错误，这些都是在编译时的错误，没法被try...catch捕获，语法错误都是早期错误，有语法错误，程序是无法运行的。

## 附录
* 创建带有id属性的DOM元素时，也会创建同名的全局变量
* 内联代码的script标签没有charset属性