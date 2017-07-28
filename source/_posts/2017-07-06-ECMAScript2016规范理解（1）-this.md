---
title: ECMAScript2016规范理解（1）-this
tags: [JavaScript, ECMAScript规范, this]
date: 2017.07.06
categories: ECMAScript规范
---
对于this的解读已经非常多了，是一个已经讲烂了的话题，也是面试中一定会问的题目。you don‘t know js中对于this的总结也是非常全面，我看很多博客的内容其实都是这本书上的。但是我想从规范的角度去理解this，而不是从别人总结好的几条规律来理解。（我指的规范是[ECMAScript2016](http://www.ecma-international.org/ecma-262/7.0/index.html)），写这篇文章也是我对内的一次[分享](https://ldllidonglin.github.io/learn-output/slides/ECMAScript.html)其中关于this的总结。
<!--more-->
## this 是什么？
规范中，有标明this是什么的地方一共有三处:
* 关键字（11.6.2.1）
* 主值表达式（12.2.2）
* 词法环境中的环境记录项的属性（8.1.1）

this是主值表达式，从这个定义出发，我们可以知道如何确定this的值，而他是词法环境中环境记录的一个属性就决定了其值是如何赋值的，以及从哪里去获取它的值。

## this表达式的执行过程
规范12.2.2.1
```
PrimaryExpression:this
    Return ? ResolveThisBinding( ).
```
规范的8.3.4 定义了ResolveThisBinding函数
```
Let envRec be GetThisEnvironment( ).
Return ? envRec.GetThisBinding().
```
这里又涉及到两个函数，GetThisEnvironment和envRec.GetThisBinding()。
规范的8.3.3 定义了GetThisEnvironment
```
Let lex be the running execution context's LexicalEnvironment.
Repeat:
    Let envRec be lex's EnvironmentRecord.
    Let exists be envRec.HasThisBinding().
    If exists is true, return envRec.
    Let outer be the value of lex's outer environment reference.
    Let lex be outer.
```
上面的意思就是，从当前执行上下文的词法环境开始，不断往上寻找含有this值的词法环境，直到找到为止，这个和原型链上属性的查找模式一样。一定会找到含有this的词法环境，因为规范规定，最外层的词法环境就是全局词法环境，而全局词法环境是一定有this值的。

找到了含有this的词法环境后，就是执行envRec.GetThisBinding()。规范规定一共有5中词法环境，其中声明式词法环境、对象式词法环境是没有this的，模块式词法环境的this值是undefined，全局词法环境的this值就是[[GlobalThisValue]]这个内部值，这个内部值有宿主环境提供，众所周知，在浏览器环境下this绑定的就是window对象。所以只剩下函数式词法环境的值了

8.1.1.3.4 定义了这个函数的执行过程
```
Let envRec be the function Environment Record for which the method was invoked.
Assert: envRec.[[ThisBindingStatus]] is not "lexical".
If envRec.[[ThisBindingStatus]] is "uninitialized", throw a ReferenceError exception.
Return envRec.[[ThisValue]].
```

## this的使用场景
前面讲了这么多，就是说this是如何取值的。同时规范也定义了this是词法环境中环境记录的一个属性，在初始化一个词法环境的时候，都会对this值进行初始化，也就是所谓的this绑定。所以就需要先明白this一共有多少种使用场景，根据使用场景来确定this值是如何进行绑定的。

### 全局环境
当JavaScript代码开始执行时，就会初始化一个全局词法环境，而全局词法环境中的this是由宿主环境定义的，浏览器环境下就是window，nodejs环境下就是global

### 函数调用
上面也提到了，this只在全局环境和函数词法环境有定义。函数环境下this的绑定会更复杂一些，因为函数可以当作构造函数，也能直接调用，并且还有call\apply，es6的箭头函数、es6的class等情况。

#### 普通函数调用
首先需要先明确一点，所有的函数最终执行，都是调用的函数对象的[[Call]]方法，调用方式为[[Call]\] ( thisArgument, argumentsList)。规范的9.2.1中定义了[[Call]]方法的执行过程：
* 创建一个新的执行上下文，并且执行上下文的词法环境是函数词法环境
* 给当前的执行上下文绑定this
  + 如果函数的[[thisMode]]为lexical，返回
  + 如果是严格模式，this值为thisArgument，返回
  + 如果thisArgument是null或者undefined，this为全局环境的this值
  + 否则设置this值为thisArgument
* 执行函数体
* 遇到this时，是执行this表达式

从上面的过程中可以得到三条非常有用的信息：
* 函数执行的时候，已经确定this值了，并且会传给[[Call]]函数，只是在执行的时候进行绑定，从而使得this表达式执行的时候能取到this值。
* 箭头函数的[[thisMode]]为lexical，所以箭头函数执行时，是不绑定this值的。
* 严格模式下，任何值都会被绑定为this，非严格模式，绑定undefined和null，会被绑定为全局环境的this值。

##### 函数执行前如何确定this
普通函数的调用方式，属于Left-Hand-Side Expressions中的Call Expression：MemberExpression Arguments，在12.3.4中规定了其执行过程，关键就是确定MemberExpression的执行结果，从而确定this值。
```
Let ref be the result of evaluating MemberExpression.
Let func be ? GetValue(ref).
If Type(ref) is Reference and IsPropertyReference(ref) is false and GetReferencedName(ref) is "eval", then
  If SameValue(func, %eval%) is true, then
    Let argList be ? ArgumentListEvaluation(Arguments).
    If argList has no elements, return undefined.
    Let evalText be the first element of argList.
    If the source code matching this CallExpression is strict code, let strictCaller be true. Otherwise let strictCaller be false.
    Let evalRealm be the current Realm Record.
    Return ? PerformEval(evalText, evalRealm, strictCaller, true).
If Type(ref) is Reference, then
  If IsPropertyReference(ref) is true, then
    Let thisValue be GetThisValue(ref).
  Else, the base of ref is an Environment Record
    Let refEnv be GetBase(ref).
    Let thisValue be refEnv.WithBaseObject().
Else Type(ref) is not Reference,
  Let thisValue be undefined.
Let thisCall be this CallExpression.
Let tailCall be IsInTailPosition(thisCall).
Return ? EvaluateDirectCall(func, thisValue, Arguments, tailCall)
```
##### b()方式
* 语法规则为：MemberExpression Arguments，其中b为MemberExpression
* MemberExpression中包含PrimaryExpression，PrimaryExpression包含IdentifierReference，所以最终是执行IdentifierReference，在12.1中有定义
* 最终是ResolveBinding -> GetIdentifierReference，最终返回一个引用类型，baseValue是环境记录项
* 所以thisValue be refEnv.WithBaseObject()
* ResolveBinding -> GetIdentifierReference这个过程最终会确定refEnv为具有b的绑定的词法环境，如果是全局词法环境的话，WithBaseObject()的结果为undefined

##### a.b()方式
* 语法规则为：MemberExpression Arguments，其中a.b为MemberExpression
* MemberExpression中包含MemberExpression.IdentifierName是Property Accessors，在12.3.2.1中定义其执行过程
* 执行结果ref是返回一个Reference类型，baseValue为a,是一个对象，所以IsPropertyReference(ref) 为 true，然后thisValue 为 GetThisValue(ref)
* GetThisValue返回的是ref的base，就是a对象，所以this就是a

##### 其他方式
还有很多函数调用的方式，但是分析方法都是一样的，先确定调用的表达式类型，然后去看返回的ref值是什么，从而确定this值，可以参考
* [参考1](http://www.baizhiedu.com/1587.html)
* [参考2](http://www.smartcitychina.cn/QianYanJiShu/2016-09/7824.html)

#### call\apply
在19.2.3中定义了Function.prototype的属性，其中就定义了call和apply是如何执行的。如Function.prototype.apply ( thisArg, argArray ):
```
If IsCallable(func) is false, throw a TypeError exception.
If argArray is null or undefined, then
    Perform PrepareForTailCall().
    Return ? Call(func, thisArg).
Let argList be ? CreateListFromArrayLike(argArray).
Perform PrepareForTailCall().
Return ? Call(func, thisArg, argList).
```
可见最终代码的执行其实还是回到F.[[Call]]，只是this值是有明确指定的thisArg参数。

#### bind
19.2.3.2中定义了bind函数的执行过程
```
Let Target be the this value.
If IsCallable(Target) is false, throw a TypeError exception.
Let args be a new (possibly empty) List consisting of all of the argument values provided after thisArg in order.
Let F be ? BoundFunctionCreate(Target, thisArg, args).
Let targetHasLength be ? HasOwnProperty(Target, "length").
If targetHasLength is true, then
    Let targetLen be ? Get(Target, "length").
    If Type(targetLen) is not Number, let L be 0.
    Else,
    Let targetLen be ToInteger(targetLen).
    Let L be the larger of 0 and the result of targetLen minus the number of elements of args.
Else let L be 0.
Perform ! DefinePropertyOrThrow(F, "length", PropertyDescriptor {[[Value]]: L, [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]: true}).
Let targetName be ? Get(Target, "name").
If Type(targetName) is not String, let targetName be the empty string.
Perform SetFunctionName(F, targetName, "bound").
Return F.
```
也就是说bind的返回结果是一个BoundFunction，这是一个Exotic Objects。
##### BoundFunctionCreate (targetFunction, boundThis, boundArgs)
在9.4.1.3中有定义BoundFunctionCreate的执行过程。会把boundThis值设为[[BoundThis]]这个内部属性。
```
Assert: Type(targetFunction) is Object.
Let proto be ? targetFunction.[[GetPrototypeOf]]().
Let obj be a newly created object.
Set obj's essential internal methods to the default ordinary object definitions specified in 9.1.
Set the [[Call]] internal method of obj as described in 9.4.1.1.
If targetFunction has a [[Construct]] internal method, then
Set the [[Construct]] internal method of obj as described in 9.4.1.2.
Set the [[Prototype]] internal slot of obj to proto.
Set the [[Extensible]] internal slot of obj to true.
Set the [[BoundTargetFunction]] internal slot of obj to targetFunction.
Set the [[BoundThis]] internal slot of obj to the value of boundThis.
Set the [[BoundArguments]] internal slot of obj to boundArgs.
Return obj.
```
之前已经说明，任何函数执行都是执行自身的[[Call]]方法，而BoundFunction重定义了其[[Call]]属性，其执行过程如下：
```
Let target be the value of F's [[BoundTargetFunction]] internal slot.
Let boundThis be the value of F's [[BoundThis]] internal slot.
Let boundArgs be the value of F's [[BoundArguments]] internal slot.
Let args be a new list containing the same values as the list boundArgs in the same order followed by the same values as the list argumentsList in the same order.
Return ? Call(target, boundThis, args).
```
也就是说会把BoundFunction的[[BoundThis]]值作为this值传入Call(target, boundThis, args)，而Call其实就是执行F.[[Call]](V, argumentsList).最终执行的函数代码还是之前被包裹的那个函数，从这个过程就会发现，一个函数bind得到的函数，再bind传入的this值不会传到最终执行的过程，举例说明：
```
function a(){
    console.log(this.info);
};
var b = a.bind({info: 1});
var c = b.bind({info: 2});
b();
c();
```
最终结果是输出两个1。
* b就是一个BoundFunction，所以b() -> b.[[Call]] -> Call(a, {info: 1}, args) -> a.[[Call]] ({info: 1});
* c() -> c.[[Call]] -> Call(b, {info: 2}) -> b.[[Call]] -> Call(a, {info: 1}, args) -> a.[[Call\]\] ({info: 1});
所以最终c()输出的还是1，因为BoundFunction的[[Call]]方法只会取其自身绑定的[[BoundThis]]作为this值。

#### 构造函数调用
所谓的构造函数调用，其实就是 new 表达式的执行过程，[12.3.3](http://www.ecma-international.org/ecma-262/7.0/index.html#sec-new-operator)定义了new表达式的执行过程。
+ 先获取函数的[[ConstructorKind]]属性，如果是base则用(fn.prototype||Object.prototype)为原型去创建对象o。
+ 如果[[ConstructorKind]]是base，则把o对象绑定为当前执行上下文的this。
+ 执行函数，获取返回值result
+ 如果result的类型是return
* 如果其值的类型是Object，则返回result（任何函数，只要返回Object，就直接返回）
* 如果[[ConstructorKind]]是base，则返回对象o，（普通函数，如果返回值不是Object，则返回创建的o）
* 如果返回值不是undefined，抛出TypeError异常（是返回非object和undefined的值）
* 返回执行上下文中的this值（函数体中没有return语句）

*9.2 中规定[[ConstructorKind]]只有两种值，base和derived，derived就是指声明了继承的使用class语法得到的函数，剩下的就是base*

从这个执行过程可以得到以下信息：
* es6+增加了class继承的语法糖，所以在new的过程中要判断继承和非继承两种情况。
* 声明了继承的class，不会去绑定this。
* 非继承的情况下，以fn.prototype为原型创建新对象o，把this值绑定为对象o。

##### 子类构造函数调用super
super在规范也是关键字，super()构成superCall表达式，12.3.5中定义了其执行过程：
```
Let newTarget be GetNewTarget().
If newTarget is undefined, throw a ReferenceError exception.
Let func be ? GetSuperConstructor().
Let argList be ArgumentListEvaluation of Arguments.
ReturnIfAbrupt(argList).
Let result be ? Construct(func, argList, newTarget).
Let thisER be GetThisEnvironment( ).
Return ? thisER.BindThisValue(result).
```
也就是，先获取父类的构造函数func，result为Construct(func, argList, newTarget)的结果，然后把当前词法环境绑定this为result。

## 代码实战
* 第一题
    ```
    var a = {
        b: function () {
            console.log(this.c);
        },
        c: 3
    }
    a.b();
    new a.b();
    ```
    第一个输出是3，属于普通函数调用，好理解，第二个是undefined。因为new表达式的执行过程中，this是会被绑定为新创建的那个对象。

* 第二题
    ```
    var c = 3;
    var b = {
        d: () => {
            console.log(this.c);
        },
        c: 1
    }
    b.d();
    b.d.call({c:4});
    ```
    两个输出都是3，因为箭头函数执行的时候，不会绑定this，所以b.d()执行的时候不会把b绑定为this，所以this执行的时候会往上查找，最终查找到全局环境。
    同样的，执行call，因为是箭头函数，同样的不会进行绑定。

* 第三题
    ```
    var a = {this: 1, b: 2};
    with(a) {
        console.log(b);
        console.log(this);
    }
    ```
    这个会先输出2，然后输出window。因为with语句会创建一个新的词法环境，而其词法环境为对象词法环境，对象词法环境是没有this值的，所以在执行this表达式的时候，找打的词法环境是外层词法环境，所以如果上述代码在全局环境下的话，结果是window