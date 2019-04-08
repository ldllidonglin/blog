title: ECMAScript2016规范理解（6）-super
date: 2019.04.09
tags: [ECMAScript规范, JavaScript]
categories: ECMAScript规范
---
super关键字的理解
<!--more-->
super关键字最常出现的地方就是在继承时会使用到。class A 继承 class B 的时候，在A的construction中的必须有super函数的调用。那super关键字在规范中是怎么定义的呢
### 关键字
在[11.6.2.1 Keywords](https://tc39.github.io/ecma262/#sec-reserved-words)中，规定了super是一个关键字
### 左值表达式
在[12.3](https://tc39.github.io/ecma262/#prod-SuperProperty)中规定了使用super可以组成一种左值表达式，形式一种有两种：
* super property
![super-property](super-property.png)
* super call
![super-call](super-call.png)
用代码来表示就是
```
// 1
super['a']
super.a
// 2
super(arguments)
```
在[12.3.5.1](https://tc39.github.io/ecma262/#sec-super-keyword)中具体规定了这两种表达式的执行过程。
![super-eva](super-eva.png)
### 注意的点
* super property
这种表达式最终会执行GetSuperBase来获取super的值，就是当前函数的[[prototype]]内部属性。这个函数执行过程是取当前执行环境的Environment Record 的 [[HomeObject]]属性，然后再取它的[[prototype]]内部属性值。
* 在GetSuperBase执行过程中，如果发现当前环境不是method的话，那么会报错，如下代码
  ```
  var a = {
    b: function () {
      console.log(super.d)
    },
    d: 1
  }
  // Uncaught SyntaxError: 'super' keyword unexpected here
  var a = {
    b() {
      console.log(super.d)
    },
    d: 1
  }
  // 正确
  ```
  因为第一个定义b时，在规范中属于PropertyDefinition，而在第二个定义的时候，是MethodDefinition。PropertyDefinition中是不允许使用super关键字的。
* super.x = 1 和 super.x 这时super指向的值是不一样的
  ```
  class A {
    constructor() {
      this.x = 10;
    }
  }

  class B extends A {
    constructor() {
      super();
      this.x = 20;
      super.x = 30;// 此时的 super 就是 b，也就是
      console.log(super.x); // undefined 等用于是 A.prototype.x,所以是undefined
      console.log(this.x); // 30
    }
  }

  let b = new B();
  ```
  上面的代码从规范的角度来讲，区别就是super.x = 30 是一个赋值表达式，执行赋值表达式时对super.x这种是会特殊处理的，最终是把x写到this对象上了，而在constructor中的this就是最终的实例对象b
* super可以在子类的静态方法中调用父类的静态方法，可以在子类的普通方法中调用父类的普通方法。两者不能混着调用。因为静态方法是定义在父类函数上的，而普通方法是定义在父类函数的prototype上的。super property执行的时候，super === [[HomeObject]][prototype], 而[[HomeObject]] === 调用当前方法的那个对象
* super call 的执行过程简单来说就是两件事，获取当前函数对象的[[prototype]]，也就是父类的构造函数。然后以构造函数的形式执行这个函数，执行这个函数的结果为result，然后把当前执行堆栈中有this的执行环境的词法记录项中的this值设置为result,所以，super在子类的构造函数中必须在使用this之前执行。