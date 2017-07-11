---
title: javascript语言精粹笔记
tags: jquery 
date: 2015.9.3
categories: 读书笔记
---
# 第一章 精华
JavaScript中非常糟糕的一点就是依赖全局变量来连接，所有单元的顶级变量都最终挂载global这个全局变量中。
# 第二章 语法
空白符通常没有意义，标识符必须以字母开头，同时不能使用保留字，对象字面量中的属性名也不能出现保留字
<!--more-->
# 第三章 对象
1. 属性名如果是合法的标识符不需要用引号括住，不合法的“first-name"就需要。
2. 从undefined的成员属性中取值会导致TypeError异常，避免出现这样的情况，可以用&&符号来避免。比如a.b&&a.b.name，如果a.b是undefined，那自然会返回undefined
3. 用delete删除对象的属性，可能会让来自原型链中的属性透现出来。

# 第四章 函数
1. 函数对象的原型是Function.prototype。该原型对象本身的原型是Object.prototype
2. 如果函数调用时在前面加了new，但是返回值不是一个对象，则会返回this，即改函数对象。 

# 第五章 继承
1. new 运算符执行过程大概是：
    ```
    var that=Object.create(this.prototype);
    var other=this.apply(that,arguments);
    return (typeof other==='object'&&other)||that;
    ```

# 第六章 数组
1. 数组可以包含任意混合类型的值。
2. length属性值是这个数组最大整数属性名加上1，并不等于数组里的元素的个数。设置更大的length不会给数组分配更多的空间，但把length设小，将会把所有大于等于新length的属性删除。
3. []后置下标运算符把它所含的表达式转换成一个字符串。如果该表达式有toString方法，就使用该方法，字符串将被用作属性名，不会改变length，如果字符串是一个大于等于当前length，小于2^32-1的正整数，那length会被设置为新的下标加1。

# 第七章 正则表达式
1. 匹配一个url的正则表达式
    ```
    /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/
    ```
2. \1是指向分组1所捕获到的文本的一个引用，它可以在正则表达式中引用，用来匹配后续的文本。
3. 正则表达式分组有四种，捕获型()、非捕获型(?:)、向前正向匹配(?=)、向前负向匹配(?!)。

# 第八章 方法
1. regexp.exec是最强大的也是最慢的方法，如果是全局查找的话，regexp.lastIndex将被设置为该匹配后的第一个字符的位置，不成功会重置为0，如果是用循环调用exec去查询一个字符串，如果提前退出了这个循环，再次进入的时候必须把regexp.lastIndex重置为0，因为^因子仅匹配lastIndex为0的情况。
2. regexp.test不要使用g标示
3. string.match(regexp)如果regexp带有g标识，那么它生成一个包含所有匹配的数组。
4. string.replace(searchValue,replaceValue)如果第一个参数是一个字符串，那只会在第一次出现的地方被替换。第一个参数是regexp，并且带有g标识，就将会替换所有匹配。如果replaceValue如果是一个函数，那每遇到一次匹配，函数就会被调用一次，函数返回的字符串会被用作替换文本。
5. string.search方法和indexOf方法类似，接受一个正则表达式对象作为参数，返回第一个匹配首字符位置，没有则返回-1，且忽略g标示。
6. parseInt()总是要带上进制的参数，因为parseInt("08")===0,因为这里它识别“08”按照八进制进行转换。正确的是parseInt("08",10)。在遇到非数字时会停止解析，所以parseInt("16")==parseInt("16yd");
7.
    ``` 
    typeof NaN==="number"  //true   
    NaN===NaN  //false
    ```
8. js中为false的值有0 NaN "" false null undefined，undefined和NaN的值是可以被改变的。
    ```
    ''=='0' //false
    0==''   //true
    0=='0'  //true
    false=='false' //false
    false=='0'     //true
    false==undefined  //false
    false=null        //false
    null==undefined   //true
    ' \t\r\n '==0     //true
    ```
