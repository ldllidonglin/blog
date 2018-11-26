title: ECMAScript2016规范理解（5）-Object
date: 2018.11.24
tags: [ECMAScript规范, JavaScript]
categories: ECMAScript规范
---
Object() 和 new Object()的区别
<!--more-->
## 问题的来源
事情的起源是我在看react组件被babel编译后的代码长什么样，发现对于一个组件，编译后的代码如下：
```
var App =
/*#__PURE__*/
function (_Component) {
  Object(_Users_dongtu_Documents_ldl_react_demo_react_demo_node_modules_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_4__["default"])(App, _Component);

  function App() {
    Object(_Users_dongtu_Documents_ldl_react_demo_react_demo_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, App);

    return Object(_Users_dongtu_Documents_ldl_react_demo_react_demo_node_modules_babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__["default"])(this, Object(_Users_dongtu_Documents_ldl_react_demo_react_demo_node_modules_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(App).apply(this, arguments));
  }

  Object(_Users_dongtu_Documents_ldl_react_demo_react_demo_node_modules_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(App, [{
    key: "render",
    value: function render() {
      return react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
        className: "App",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 8
        },
        __self: this
      }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("header", {
        className: "App-header",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 9
        },
        __self: this
      }));
    }
  }]);

  return App;
}(react__WEBPACK_IMPORTED_MODULE_5__["Component"]);
```
我发现竟然有很多直接调用Object(v)方法，而不是new Object(v), 或者直接使用v。然后我就在想为何要这么用，这俩有啥区别,网上搜了一遍也没搜到答案，还是看规范吧，规范在[19章](https://tc39.github.io/ecma262/#sec-object-objects)
![object](object.png)
意思就是：
* 如果NewTarget既不是undefined，也不是当前执行环境的active function时，就会执行OrdinaryCreateFromConstructor，就是从构造函数创建对象
* 如果value是null或者undefined或者没有提供，返回一个用ObjectPrototype为原型创建的对象
* 以上都不是，那就返回ToObject(value)

## 名词解释

### NewTarget
规范在[12.3](https://tc39.github.io/ecma262/#prod-NewTarget),它是一个左值表达式分类下的MetaProperty，它返回的是当前Environment Records的[[NewTarget]]属性，`new.target`看[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new.target)的解释,这个时候new并不是一个对象，`new.`被认为是一个虚拟的上下文，从而让`target`能返回值。

### active function
规范在[8.3 执行上下文](https://tc39.github.io/ecma262/#active-function-object),原文是`The value of the Function component of the running execution context is also called the active function object.` 其实就是当前执行环境的function component

### ToObject
![toobject](toobject.png)

## 示例
```javascript
function a(){
  console.log(new.target);
}
a(); // undefined
new a(); // ƒ a(){
        //    console.log(new.target);
        //  }
```
## 结论
也就是说，当使用new Object(...)时，NewTarget就是function object(new 表达式执行时决定的)，所以最终是到了ToObject()，当直接使用Object()时，NewTarget是undefined，所以最终还是到了ToObject，也就是说这俩在使用的时候没有区别。。。。那规范中Object函数的执行为何要加上对NewTarget既不是undefined也不是当前执行函数的情况的处理逻辑，什么情况下NewTarget才会满足这个情况呢？我是想不出来...