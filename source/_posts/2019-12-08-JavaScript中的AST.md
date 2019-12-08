title: JavaScript中的AST
date: 2019.12.08
tags: [AST, JavaScript]
categories: 前端
---
介绍在JavaScript中，涉及到操作AST时的一些工具
<!--more-->

## esprima
### 简介
  + [esprima](https://esprima.org/)是比较早的一个parser,高性能，符合标准，支持es7
  + 只支持解析JavaScript代码，不支持ts，flow
  + parseModule支持parse一个es的module
  + parseScript('var el= <title>${product}</title>', { jsx: true }); 可以支持解析jsx，但是没办法parse一个含有jsx的module
  + [ast format](https://esprima.readthedocs.io/en/4.0/syntax-tree-format.html),从[Mozilla Parser API,](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API)继承而来，并且最终扩展为[ESTree format](https://github.com/estree/estree)

### 用法
```javascript
const esprima = require('esprima');
const program = 'const answer = 42';
esprima.tokenize(program);
// [ { type: 'Keyword', value: 'const' },
//   { type: 'Identifier', value: 'answer' },
//   { type: 'Punctuator', value: '=' },
//   { type: 'Numeric', value: '42' } ]
esprima.parse(program);
// { type: 'Program',
//   body:
//    [ { type: 'VariableDeclaration',
//        declarations: [Object],
//        kind: 'const' } ],
//   sourceType: 'script' }
```

## acorn
### 简介
* [acorn](https://github.com/acornjs/acorn): A tiny, fast JavaScript parser, written completely in JavaScript
* 支持插件扩展，所以可以基于acorn，扩展出解析各种JavaScript代码
* [acorn-walk](https://github.com/acornjs/acorn/tree/master/acorn-walk)用来遍历ast的node
* AST格式是 ESTree format

## 用例
```javascript
const {Parser} = require("acorn")

const MyParser = Parser.extend(
  require("acorn-jsx")(),
  require("acorn-bigint")
)
console.log(MyParser.parse("// Some bigint + JSX code"))
```

## babel
### parser
* [babel/parser](https://babeljs.io/docs/en/babel-parser),以前叫Babylon，底层依赖acorn,jsx的支持是也是用的[acorn的插件acorn-jsx](https://github.com/acornjs/acorn-jsx)
* 使用插件的方式，支持最新的es语法以及jsx,flow,ts，[所有插件](https://babeljs.io/docs/en/babel-parser#plugins)
* [ast format](https://github.com/babel/babylon/blob/master/ast/spec.md)是基于ESTree改的。如果要使用estree格式，plugins中传入`estree`即可，差异有以下一些
  ![estree](./estree-babel.jpg)
* [jsx format](https://github.com/facebook/jsx/blob/master/AST.md)是另一种格式

* 示例代码
  ```javascript
  require("@babel/parser").parse("code", {
    // parse in strict mode and allow module declarations
    sourceType: "module",

    plugins: [
      // enable jsx and flow syntax
      "jsx",
      "flow"
    ]
  });
  ```
### traverse
* 配合parser生成的ast，遍历,对ast进行增删改操作
* 示例代码
  ```javascript
  import * as parser from "@babel/parser";
  import traverse from "@babel/traverse";

  const code = `function square(n) {
    return n * n;
  }`;

  const ast = parser.parse(code);

  traverse(ast, {
    enter(path) {
      if (path.isIdentifier({ name: "n" })) {
        path.node.name = "x";
      }
    }
  });
  ```
### generator
* 按照一定的规则输出代码，所以重新输出的代码和源代码相比，格式会变化比较大。
* 示例
  ```javascript
  import {parse} from '@babel/parser';
  import generate from '@babel/generator';

  const a = `function handler() {
    var a = "1";
    var b = {
      a: '1'
    }
  }`;
  const ast = parse(a);
  const { code, map } = generate(ast);
  // function handler() {
  //  var a = "1";
  //  var b = {
  //    a: '1' };
  //
  // }
  ```


## recast
### 简介
  + 一大特色就是在print的时候会尽量的保持源代码的格式，输出时只会重新输出有修改的ast，未更改过的ast，会直接按原样输出。所以非常适合那些需要修改源码，并且要把修改后的结果覆写到源码的情况。但是前提是需要使用recast的parser，不要在print的时候使用一个用别的工具parse出来的ast。就算不是默认的parser，也可以这么用
    ```
    const acornAst = recast.parse(source, {
      parser: require("acorn")
    });
    ```
  + [recast](https://github.com/benjamn/recast) 默认使用esprima作为parser,支持传入自定义parser，比如babel/parser，recast也提供了便捷的方式来使用其他parser，[所有parser地址](https://github.com/benjamn/recast/tree/master/parsers)。要使用其他parser，需自己安装对应的parser包，安装recast时只会自动安装默认的exprima
    ```
    const tsAst = recast.parse(source, {
      parser: require("recast/parsers/typescript")
    });
    ```
  + print支持[格式化参数](https://github.com/benjamn/recast/blob/master/lib/options.ts#L167)，比如单双引号，换行符之类的。
  + 使用[ast-types](https://github.com/benjamn/ast-types)作为ast的格式，这个是继承自Mozilla Parser API，但是兼容esprima的
  + 因为默认的esprima不支持jsx，所以在react项目中，就需要使用babel的parser
    ```
    const ast = recast.parse(code, {
      parser: require("recast/parsers/babel")
    })
    ```

### 示例
```javascript
import * as recast from "recast";

// Let's turn this function declaration into a variable declaration.
const code = [
  "function add(a, b) {",
  "  return a +",
  "    // Weird formatting, huh?",
  "    b;",
  "}"
].join("\n");

// Parse the code using an interface similar to require("esprima").parse.
const ast = recast.parse(code);
const output = recast.print(ast).code;
```

## jscodeshift
### 简介
  + [jscodeshift](https://github.com/facebook/jscodeshift)是facebook开源的一个JavaScript codemod toolkit。提供了大量的便捷方法去操作ast
    ```javascript
    // inside a module transform
    var j = jscodeshift;
    // foo(bar);
    var ast = j.callExpression(
      j.identifier('foo'),
      [j.identifier('bar')]
    );
    ```
  + 底层依赖recast，并且默认使用babel/parser传递给recast，并且使用了jsx的plugin，所以支持react的jsx代码,[源代码实现](https://github.com/facebook/jscodeshift/blob/master/parser/babel5Compat.js#L11)
    ```javascript
    const babylon = require('@babel/parser');
    const options = {
      sourceType: 'module',
      allowHashBang: true,
      ecmaVersion: Infinity,
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      startLine: 1,
      tokens: true,
      plugins: [
        'estree',
        'jsx',
        'asyncGenerators',
        'classProperties',
        'doExpressions',
        'exportExtensions',
        'functionBind',
        'functionSent',
        'objectRestSpread',
        'dynamicImport',
        'nullishCoalescingOperator',
        'optionalChaining',
      ],
    };
    ```
  + toSource方法使用的是recast的print
  + 把recast.types.namedTypes，recast.types.builders下的所有属性都挂在实例上了，便于取用。

### 示例
```javascript
const j = require('jscodeshift');

const result = j(code).findJSXElements().forEach(path => {
  //...
}).toSource()
```
## 参考
[astexplorer--在线源码和ast对比](https://astexplorer.net/)

