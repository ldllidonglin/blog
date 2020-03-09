---
title: 【译】如何阅读ECMAScript规范(一)
date: 2020.03.10
tags: [ECMAScript规范, JavaScript]
categories: ECMAScript规范
---
这篇文章中，用规范中一个简单的方法来理解规范。[原文链接](https://v8.dev/blog/understanding-ecmascript-part-1)
<!--more-->
## 序言
即使你了解JavaScript，但是阅读它的语言规范[ECMAScript Language specification](https://tc39.es/ecma262/)也是让人望而生畏。至少这是我第一次阅读它的感受。

让我们以一个实际的例子来理解这个规范。接下来将以`Object.prototype.hasOwnProperty:`这个函数的用法作为代码示例
```javascript
const o = { foo: 1 };
o.hasOwnProperty('foo'); // true
o.hasOwnProperty('bar'); // false
```

在这个示例中，`o`并没有一个属性叫`hasOwnProperty`,所以我们顺着原型链往上找，最终在`o`的原型上找到了，也就是`Object.prototype`
在规范中，使用了伪代码的形式来描述`Object.prototype.hasOwnProperty`是如何工作的
> ### Object.prototype.hasOwnProperty(V)  
> When the hasOwnProperty method is called with argument V, the following steps are taken:
>> Let P be ? ToPropertyKey(V).  
>> Let O be ? ToObject(this value).  
>> Return ? HasOwnProperty(O, P).

和下面这些
> ### HasOwnProperty(O, P)  
> The abstract operation HasOwnProperty is used to determine whether an object has an own property with the specified property key. A Boolean value is returned. The operation is called with arguments O and P where O is the object and P is the property key. This abstract operation performs the following steps:

>> Assert: Type(O) is Object.  
>> Assert: IsPropertyKey(P) is true.  
>> Let desc be ? O.[[GetOwnProperty]](P).  
>> If desc is undefined, return false.  
>> Return true.

但是什么是“abstract operation”？伪代码中的`[[]]`又是啥？为什么在方法调用前面有一个`?`，一堆的`Assert`的又是啥意思？

请听我慢慢道来

## 语言类型和规范类型
我们先从看着眼熟的东西开始，规范中会使用一些例如undefined、 true、 false的值。我们在JavaScript中就已经知道这些了值是什么意思了。他们都是`语言值`，也就是[语言类型](https://tc39.es/ecma262/#sec-ecmascript-language-types)的值。在规范中我们也同样定了这些值

规范内部会使用一些`语言值`。比如一个内置数据类型可能包含一个字段，其字段的值可能是true或false。与之不同的是，JavaScript引擎内部是不会使用这些值的。比如如果JavaScript引擎是用C++写的，那它将会用C++的true或false（并且不是JavaScript的true或false在内部的代表）。

除了语言类型之外，规范还使用规范类型，这些类型只出现在规范中，而不是JavaScript语言中。JavaScript引擎不需要（但可以自由）实现它们。在本文中，我们将了解规范类型 `Record`（及其子类型`Completion Record`）。


## Abstract operations
[抽象操作](https://tc39.es/ecma262/#sec-abstract-operations)是在ECMAScript规范中定义的函数；它们的定义是为了简洁地编写规范。JavaScript引擎不必将它们作为单独的函数在引擎中实现。不能直接从JavaScript调用它们。

## 内部插槽和内部方法
在`[[]]`中的那些方法和属性就是内部插槽和内部方法了。

内部插槽是JavaScript对象或规范类型的数据成员。它们用于存储对象的状态。内部方法是JavaScript对象的成员函数。

例如，每个JavaScript对象都有一个内部插槽[[Prototype]]和一个内部方法[[GetOwnProperty]]。

无法从JavaScript中访问内部插槽和方法。例如，您不能访问`o.[[Prototype]]`或调用`o.[[GetOwnProperty]]（）`。JavaScript引擎可以实现它们供自己内部使用，但不必这样做。

有时内部方法委托给类似命名的抽象操作，例如在普通对象的`[[GetOwnProperty]]`内部方法：
>### [[GetOwnProperty]](P)
> When the [[GetOwnProperty]] internal method of O is called with property key P, the following steps are taken:
>> Return ! OrdinaryGetOwnProperty(O, P).

（我们将在下一章中了解感叹号的含义。）

`OrdinaryGetOwnProperty`不是内部方法，因为它与任何对象都没有关联；相反，它操作的对象作为参数传递。

OrdinaryGetOwnProperty被称为“Ordinary”，因为它对普通（Ordinary）对象进行操作。ECMAScript对象可以是Ordinary的，也可以是exotic的。普通对象必须具有一组称为基本内部方法的方法的默认行为。如果一个对象偏离了默认行为，那就是异国情调。

最著名的exotic对象是数组，因为它的length属性以非默认方式运行：设置length属性可以从数组中移除元素。

基本的内部方法是[这里](https://tc39.es/ecma262/#table-5)列出的方法。

## Completion records
问号和感叹号呢？要了解它们，我们需要查看[Completion records](https://tc39.es/ecma262/#sec-completion-record-specification-type)！

`Completion Record` 是规范类型（仅为规范目的定义）。JavaScript引擎不必有相应的内部数据类型。

`Completion Record`是一个`Record`-一种数据类型，它有一组固定的命名字段。完成记录有三个字段：
|名称|解释|
|---|---|
|[[Type]]|normal, break, continue, return, throw 其中之一，除了normal，其他的都是abrupt completions|
|[[Value]]|完成时生成的值，例如，函数的返回值或异常（如果抛出）|
|[[Target]]|用于标记控制目标(和本文无无关).|

每个抽象操作都隐式返回一个完成记录。即使它看起来像一个抽象操作会返回一个简单的类型，比如Boolean，它也被隐式地包装到一个类型为normal的完成记录中（参见[隐式完成值](https://tc39.es/ecma262/#sec-implicit-completion-values)）。

* 注1：规范在这方面并不完全一致；有些helper函数返回裸值，其返回值按原样使用，而没有从完成记录中提取值。通常从上下文中是能看懂的。

* 注2：规范的编辑们正在努力使完成记录处理更加明确。

如果一个算法抛出一个异常，它意味着返回一个带有`[[Type]] throw`的完成记录，该记录的`[[Value]]`是异常对象。现在我们先忽略break、continue和return类型。

[ReturnIfAbrupt(argument)](https://tc39.es/ecma262/#sec-returnifabrupt)意味着执行下面的步骤:
> 如果argument是异常，返回argument
> argument.[[Value]] 值为 arguemnt

也就是说，我们检查一个完成记录；如果是一个突然的完成，我们会立即返回。否则，我们从完成记录中提取值。

ReturnIfAbrupt可能看起来像函数调用，但它不是。它导致ReturnIfAbrupt（）发生的函数返回，而不是ReturnIfAbrupt函数本身。它的行为更像是C语言中的宏。

ReturnIfAbrupt可以这样使用：
```
1. Let obj be Foo(). (obj is a Completion Record.)
2. ReturnIfAbrupt(obj).
3. Bar(obj). (If we’re still here, obj is the value extracted from the Completion Record.)
```

现在问号开始起作用了：`？Foo（）`等同于`ReturnIfAbrupt（Foo（））`。使用简单写法：我们不需要每次都显式地编写错误处理代码。

类似的， `Let val be ! Foo() `和下面的意思一样:
```
1. Let val be Foo().
2. Assert: val is not an abrupt completion.
3. Set val to val.[[Value]].
```

利用这个，我们可以重写`Object.prototype.hasOwnProperty`为
```
Object.prototype.hasOwnProperty(P)

1.Let P be ToPropertyKey(V).
2.If P is an abrupt completion, return P
3.Set P to P.[[Value]]
4.Let O be ToObject(this value).
5.If O is an abrupt completion, return O
6.Set O to O.[[Value]]
7.Let temp be HasOwnProperty(O, P).
8.If temp is an abrupt completion, return temp
9.Let temp be temp.[[Value]]
10.Return NormalCompletion(temp)
```
并且，我们可以把`HasOwnProperty`重写为：
```
HasOwnProperty(O, P)

1. Assert: Type(O) is Object.
2.Assert: IsPropertyKey(P) is true.
3.Let desc be O.[[GetOwnProperty]](P).
4.If desc is an abrupt completion, return desc
5.Set desc to desc.[[Value]]
6.If desc is undefined, return NormalCompletion(false).
7.Return NormalCompletion(true).
```

我们也可以重写 [[GetOwnProperty]] 这个内部方法而不是用！
```
O.[[GetOwnProperty]]

1. Let temp be OrdinaryGetOwnProperty(O, P).
2 .Assert: temp is not an abrupt completion.
3 .Let temp be temp.[[Value]].
4 .Return NormalCompletion(temp).
```
这里我们假设temp是一个全新的临时变量，它不会与任何其他变量冲突。

我们还使用了这样的知识：当返回语句返回的不是完成记录时，它隐式地包装在NormalCompletion中。

### 提示: Return ? Foo()
规范使用了返回符号？Foo（）-为什么要打问号？

`return？Foo（）`可以扩展为：
```
1. Let temp be Foo().
2. If temp is an abrupt completion, return temp.
3. Set temp to temp.[[Value]].
4. Return NormalCompletion(temp).
```

这与`Return Foo（）`相同；对于突然完成和正常完成，它的行为都是相同的。

`Return Foo（）`仅仅是因为编辑需要，以使`Foo`返回`Completion Record`更加明确。
## Asserts
在规范中断言算法的不变条件。添加它们是为了更加清楚的描述算法，但不向实现中添加任何要求—实现不需要检查它们。
## 后续
我们已经建立了阅读规范中的简单方法（如Object.prototype.hasOwnProperty）和抽象操作（如hasOwnProperty）所需的方法。这个抽象操作仍然委托给其他抽象操作，但基于这篇博客文章，我们应该能够弄清楚它们做了什么。我们将遇到属性描述符，这只是另一种规范类型。
## 有用的链接
[How to Read the ECMAScript Specification](https://timothygu.me/es-howto/): 从一个稍微不同的角度介绍本篇文章中所涉及的大部分内容的教程
