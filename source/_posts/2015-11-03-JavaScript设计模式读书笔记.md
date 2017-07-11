---
title: JavaScript设计模式读书笔记
tags: javascript
date: 2015.11.03
categories: 读书笔记
---

# 第一章 富有表现力的JavaScript
JavaScript是弱类型的语言，所有对象和类都是易变的，可以在运行时修改。JavaScript使用设计模式，主要是因为可以提高可维护性、沟通更简单、有一些设计模式能提升性能。
<!--more-->
# 第二章 接口
接口提供了一种用以说明一个对象应该具有哪些方法的手段，但并不规定这些方法应该如何实现。在JavaScript中没有提供对接口的内置支持，但是有三种方法可以模仿接口
1. 用注释描述接口
    ```
    /*
    interface Composite{
        function add();
        function remove();
        function getChild();
    }
    */
    function ComInstance(){
        ...
    }
    ComInstance.prototype.add=function(){
        ...
    }
    ```
    这种做法对接口约定的遵守完全依靠自觉，因为没有为确保ComInstance真正实现了正确的方法集而进行检查。

2. 属性检查
    ```
    function ComInstance(){
        this.implementsInterfaces=['Composite'];   //这个属性声明这个类实现了哪些接口
    }
    ```
    所有类都用一个属性明确声明自己实现了哪些接口，接口自身还是使用注释，但是可以通过检测这个属性来得知这个类自称实现了什么接口后续的调用就可以通过检测这个属性来判断这个类是否实现了某些接口

3. 鸭式辨型

如果对象具有与接口定义的方法同名的所有方法，那就可以认为它实现了这个接口。可以用一个辅助函数来确保对象具有所有必须的方法。

# 第三章 封装和信息隐藏
1. 信息隐藏原则
封装就是对对象内部数据的表现形式和实现细节进行隐藏
2. 创建对象的基本方法
1)门户大开型(其实就是构造函数+原型链)
    ```
    var book=function(a,b){
        this.a=a;
        this.b=b;
    }
    book.prototype.funa=function(){

    };
    ```
    为了保护内部数据，让取值和赋值可以得到完整性验证，可以添加对应的setAttributeA()、getAttributeA()函数，但是这并不能真正意义上避免直接修改内部属性，这只是一种约定，而且也增加了额外的代码，可以衡量下再决定是否要这么做。
2)用命名规范区别私有成员(在一些私有属性和方法前加下划线)这也只是一种约定
3)闭包
    ```
    var book=function(a,b){
        var a,b;

        //内部方法
        var pa=function(){
            a=a*2;
        }
        //对外的设置内部属性的方法
        this.setA=function(va){
            a=va;
        };
        this.getA=function(){
            return a;
        };
    }
    //对外的不需要直接访问内部属性的方法
    book.prototype.funa=function(){

        var a=this.getA();
        ...
    };

    ```
    这种方式,外部就没法直接修改内部属性了,必须通过提供的set方法来设置,在set方法内可以对要设置的值进行检验,可以控制每个属性值都是有效的.但是弊端就是,内部定义的这些变量和方法会在每实例化一个实例时都copy一份,浪费内存（虽然现在内存很廉价）。

3. 更多高级的创建对象模式
1)静态方法和属性
    ```
    var Book=(function(){
        //静态私有方法
        var count=0;
        var fb=function(){
            ...
        };
        return function(a,b){
            var va,vb;
            this.setA=function(){
                va=a;
            };
            this.setA(a);
            this.setB(b);
            count++;
        }
    })();  //自执行
    //静态公有方法
    Book.fc=function(){

    };
    var book=Book('dd','cc');
    ```
    对于不需要访问任何实例属性的方法可以这样设置为静态方法，因为静态方法是和Book类关联在一起的，只会在内存中保存一份，count属性是静态属性，每构造一个实例，就会自动加1，fc也是静态方法，任何实例都可以调用，但是要注意静态方法里不能和实例的属性有关联，否则，任何一个实例修改这个值，会影响到所有实例。

4. 封装的利弊
弊端：不能很好的在外部进行单元测试

# 第四章 继承
1. 类式继承(其实就是构造函数+原型链)
    ```
    functon extend(subClass,superClass){
        var f=function (){};
        f.prototype=superClass.prototype;
        subClass.prototype=new f();
        subClass.prototype.constructor=subClass();
        subClass.superclass=superClass.prototype;
        if(superClass.prototype.constructor==Object.prototype.constructor){
            superClass.prototype.constructor=superClass;
        }
    }
    /*Class Person*/
    funtion Person(name){
        this.name=name;
    }
    ..
    function Author(name,book){
        Person.call(this,name);
    }
    extand(Author,Person);
    ```

2. 原型式继承
    ```
    var Person={
        name:'li',
        friends:['li']
    }
    var otherPerson=Object.create(Person);  
    //得到一个原型指定super的空对象，所以他可以共享父对象的所有属性
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

3. 掺元法（不是严格意义上的继承）
在只是想让两个迥然不同的对象之间共用一部分代码的时候，可以使用这个方法
    ```
    var Mixin={};
    //定义各种通用函数
    Minin.prototype={
        fun1:{

        },
        fun2:{

        }
    }
    //ReciveClass 是想要共用代码的对象；
    for(methodname in Minxin.prototype){
        if(!ReciveClass.prototype[methodname]){
            ReciveClass.prototype[methodname]=Minxin.prototype[methodname];
        }
    }
    ```

# 第五章 单体模式 
1. 单体是一个用来划分命名空间并将一批相关的属性和方法组织在一起的对象，要是可以实例化只能实例化一次。在JavaScript中为了避免全局对象被无意修改，单体模式非常重要，也是非常常用的一种模式。
2. 用自执行函数闭包的形式声明私有变量

    ```
    Book.en=(function(){
        var pri='dd';  //私有变量
        return {
            a:'ddd',
            funa:function(){

            }
        }
        })();

    ```
3. 惰性加载，就是在单体中添加getInstance()函数，这个函数判断是否已经实例化，没有实例化的话就实例化，否则返回已经实例化的对象，在需要使用单体对象的时候都需要调用getInstance函数，实现按需实例化，节约内存。
4. 分支技术就是比如在针对浏览器兼容的时候，单体内部嗅探浏览器，然后给出兼容的方法，就不需要每次调用某个功能的时候都去检测浏览器。

# 第六章 方法的链式调用
1. 让类的方法都返回this，是实现链式调用的基本思路，对于需要返回值的取值类函数，可以用传入回调函数的形式避免链路被打断。

# 第七章 工厂模式
1. 工厂模式就是对对象的创建进行包装，使创建对象的具体过程隔离开来，解耦
2. 简单工厂模式
    ```
    BicycleFactory={
        createBicycle:function(type){
            switch(type){
                case:'a'
                    return new a();
                ...
            }

        }
    }
    ```
    优势就在只需要传入一个参数就能得到想要的想要的对象，实现了责任分割，缺点就是在需要添加新产品，扩展就需要修改整个逻辑，一旦整个逻辑一个地方出现了问题，就可能造成整个工厂没法工作。
3. 工厂方法模式
    ```
    BicycleShop=function(){};
    BicycleShop.prototype={
        sellBicycle=function(model){ //静态方法，所有实例可以共享的方法
            var bicycle=this.createBicycle(model)
            ....
        }
        createBicycle=function(model){
            throw new Error('unsupported operation on an abstract class');
        }
    }
    var BicycleShopA=function(){}
    extend(BicycleShopA,BicycleShop)  //继承
    BicycleShopA.prototype.createBicycle=function(model){  //具体实例化生产方法
           switch(model){
                case:'a':
                    new a();
                ...
           }    
    }
    ```
    定义一个用于创建对象的接口，让子类决定实例化哪一个类。工厂方法使一个类的实例化延迟到其子类。抽象类不能用来生产对象，只能派生子类，但是可以有一些静态方法给所有工厂。优势在于扩展性强，要比如要添加一加店，只需再派生一个子类，并实现createBicycle方法就好了，而不是像简单工厂模式那样需要修改整个逻辑。
4. 抽象工厂方法
    为创建一组相关或相互依赖的对象提供一个接口，而且无需指定他们的具体类，就是在工厂方法模式上再抽象一层，抽象工厂里有多个抽象的工厂方法，比如一个工厂里面有生产小米、华为两个品牌的产品，每种品牌又都会生产手机、平板。这个时候就需要抽象一个工厂，里面有两条生产线，一条生产手机、一条生产平板。
    ```
    var Factory=function(){};
    Factory.prototype.createFactory=function(type){  //抽象工厂
        switch(type){
            case 'phone':
                return new Factory_Phone();
            case 'pad':
                return new Factory_Pad();
        }
    };
    Product=function(){};
    Product.prototype={                        //抽象产品
        createProductApple=function(){
            throw new Error('unsupported operation on an abstract class');
        }，
        createProductHuawei=function(){
            throw new Error('unsupported operation on an abstract class');
        }
    };
    extend(Factory_Pad,Product)                            //继承
    Factory_Pad.prototype.createProductApple=fucntion(){      //具体实现
            return new PadApple();
    };
    Factory_Pad.prototype.createProductHuawei=function(){
            return new PadHuawei();
    };
    extend(Factory_Phone,Product);
    Factory_Phone.prototype.createProductApple=fucntion(){
            return new PhoneApple();
    ;
    Factory_Phone.prototype.createProductHuawei=function(){
            return new PhoneHuawei();
    };
    
    //调用
    Factory factory = new Factory_Pad();
    Apple apple = factory.createProductApple();
    Huawei pad=factory.createProductHuawei();
    ```

# 第八章 桥接模式
1. 桥接模式就是将抽象和实现隔离开来，使得二则可以灵活的独立变化，js中用的比较多的地方就是回调
    ```
    var each = function (arr, fn) {
        for (var i = 0; i < arr.length; i++) {
            var val = arr[i];
            if (fn.call(val, i, val, arr)) {
                return false;
            }
        }
    }
    var arr = [1, 2, 3, 4];
    each(arr, function (i, v) {
        arr[i] = v * 2;
    })
    ```
    each是抽象的部分，fn就是实现部分，对于数组，遍历后怎么处理每个元素，具体就交由fn来处理，fn是可以替换的。

# 第九章 组合模式
1. 一种专为创建web上的动态用户界面而量身定制的模式，对组合对象的操作可以传递到每一个子对象，使得代码简化了不少。提高了代码的模块化程度，也便于以后的重构，而且子对象和组合对象经常会用做HTML元素的包装工具，使得我们是对对象进行操作，而不是具体到dom上操作。这种模式适用于存在一批组织成某种层次体系的对象，并且希望对这批对象或其中的一部分对象实施一个操作。比如表单保存、验证，组合模式下，可以执行form.save()，就能实现save所有控件。
2. 代码实例(图片库)
    ```
    var DynamicGallery=function(id){
        this.children=[];
        ....
    }
    //定义组合对象和其叶子对象应该实现的接口
    DynamicGallery.prototype={
        add:function(child){
            this.children.push(child);
            this.element.appendChild(child.getElement());
        },
        remove:...
        hide:function(){
            for(var node,i=0;node=this.getChild(i);i++){
                node.hide();
            }
            this.element.style.display='none';
        }
        show:..

    }
    //叶子对象
    var GalleryImage=function(src){
        this.element=document.createElement('img');
        this.element.src=src;
        ...
    }
    GalleryImage.prototype={
        add:function(){},
        ...
        hide:function(){
            this.element.style.display='none';
        },
        show:function(){
            this.element.sytle.display='';
        },
        getElement:function(){
            return this.element;
        }
    }

    ```
    *DynamicGalery可以互相嵌套*
    有一个问题需要注意就是，对组合某个方法的调用会引起对整个组合内的子对象遍历及其方法调用，可能会比较耗性能，在某些情况下需要注意，特别是子对象特别多的情况下。

# 第十章 门面模式
1. 门面模式有两个作用：一是简化类的接口；二是消除类与使用它的客户代码之间的耦合。可以为执行各种复杂任务提供一个简单的接口，代码更加容易维护和理解。
2. 在各种类库中门面模式非常常见。比如事件处理中的各种浏览器兼容处理，非常像适配器模式，但并不是。
    ```
    var DED=window.DED||{};
    DED.util={
        stopPropagation:function(e){
            if(e.stopPropagation){
                e.shopPropagation();
            }else{
                e.cancelBubble=true;
            }
        },
        preventDefault:function(e){
            if(e.preventDefault){
                e.preventDefault();
            }else{
                e.returnValue=false;
            }
        },
        stopEvent:function(e){
            DED.util.stopPropagation();
            DED.util.preventDefault();
        }
    };
    ```
3. 当有一些反复成组出现的代码的时候，就可以考虑使用门面模式了，有助于节省时间和精力，但是不能滥用，不要小题大做，有时更细粒度的函数反而更好，不见得非得组成一个庞杂的门面函数，三思而行。

# 第十一章 适配器模式
1. 适配器模式用来在现有接口和不兼容的类之间进行适配，比较常用的情况是用来协调两个不同的接口。比如有一个新接口更加高效，但是又不想改动原有接口，就可以在原有接口和新接口之间加一层适配器，使得按旧接口的方式使用新接口的功能，可以避免大规模改写现有代码。
2. 但很多时候其实是需要彻底重写代码的，或者新接口还未定型，那么适配器可能就会面临也需要改动的情况，这样就会增加很多不必要的开销，所以适配器在新旧接口都已经固定了，并且比重写代码更高效就能解决问题的时候适用。

# 第十二章 装饰者模式
1. 动态而又透明的为对象添加功能方法。不修改现有对象或从其派生子类。和组合模式不同，装饰者就是来修改方法的而不是组织子对象的，因为子对象只有一个。
2. 其实就是继承父类但是修改父类的方法，只需要调用父类的构造函数并改写某些方法即可。
    ```
    var TailightDecorator=function(bicyle){
        TailightDecorator.superclass.constructor.call(this,bicycle);
    }
    extend(TailightDecorator,BicycleDecorator);
    TailightDecorator.prototype.getPrice=function(){
        return this.bicycle.getPrice()+9.00;
    }
    var myBicycle=new AcmeComfortCruiser();
    myBicycle=new TailightDecorator(myBicycle);
    ```

# 第十三章 享元模式
1. 这是一种优化模式，适合于解决因创建大量类似对象而累及性能的问题，把大量的独立对象转化为少量的共享对象，就可以降低内存的使用。
2. 比如网页中常见的Tooltip，使用享元模式就可以只创建一个对象，然后把外在数据，比如每个Tooltip的位置、显示的文字等这些因实例而异的属性剥离，变成各个方法的参数，然后只需要创建一个对象，但是可以通过调用函数，传入不同的参数实现各种形式的Tooltip。
3. 享元模式一般有三个步骤：
    1. 将所有外在数据从目标类剥离，变成函数的参数传入，目标类应该依然具有与之前一样的功能，唯一的区别是数据的来源发生了变化。
    2. 创建一个用来控制该类的实例化的工厂，这个工厂应该掌握该类所有已创建出来的独一无二的实例，比较常见的做法是用对象字面量是保持对其的引用。
    3. 创建一个用来保存外在数据的管理器，该管理器对象负责处理外在数据的种种事宜。一般是一个包含一堆方法的对象，外在数据的输入输出就靠调用其中的方法。
4. 享元模式的目的是优化，而且是优化那种在网页中大量使用的资源密集型对象、并且可以剥离外在数据，剥离后独一无二的对象数目是相对减少了的，不然就没有必要使用享元模式。
5. 享元模式让一个对象分开存储，造成对数据问题的追踪会很困难，维护起来也增加了难度，所以使用的时候要在运行效率和可维护性之间进行权衡。

# 第十四章 代理模式
1. 代理模式也是一种优化模式，JavaScript中的代理模式用于控制对创建或保有开销较大的类会对象的访问。比如有些对象不需要在网页加载时就实例化，可以把它推迟到使用它之前再实例化，而且在使用本地的所有功能而不必操心其实例化的事，它掩盖了推迟本地实例化的逻辑。但是这种模式不能勉强使用，代理任何时候都可以被替换为本地，它会增加项目的复杂性，除非它可以降低代码的冗余程度、提高其模块化程度或运行效率，否则不要使用它。

# 第十五章 观察者模式
1. 观察者模式的使用场合就是当一个对象的改变需要同时改变其它对象，并且它不知道具体有多少对象需要改变的时候。总的来说观察者模式所做的工作就是在解耦，让耦合的双方都依赖于抽象，而不是依赖于具体。从而使得各自的变化都不会影响到另一边的变化。
2. js中大量使用的事件监听就是观察者模式

# 第十六章 命令模式
1. 本质是封装请求，是一种封装方法调用的方式，用来消除调用操作的对象和实现操作的对象之间的耦合，最简单的命令对象是一个操作和用以调用这个操作的对象的结合体，所有命令对象都有一个执行操作，用来调用命令对象所绑定的操作
2. 代码示例（界面中广告的关闭打开操作）
    ```
    // StopAd command class
    var StopAd = function (adObject) {
        this.ad = adObject;
    };
    StopAd.prototype.execute = function () {
        this.ad.stop();
    };

    // StartAd command class
    var StartAd = function (adObject) {
        this.ad = adObject;
    };
    StartAd.prototype.execute = function () {
        this.ad.start();
    };

    //使用命令对象

    var ads = getAds();
    for (var i = 0, len = ads.length; i < len; i++) {
        // Create command objects for starting and stopping the ad
        var startCommand = new StartAd(ads[i]);
        var stopCommand = new StopAd(ads[i]);
 
        // Create the UI elements that will execute the command on click
        new UIButton('Start ' + ads[i].name, startCommand);
        new UIButton('stop ' + ads[i].name, stopCommand);
    }
    ```
    这样做的结果就是，我只需要实例化一个命令对象，然后调用命令对象的execute方法，而不用考虑adObject的具体实现，解耦调用操作的对象和实现操作的对象。就是在调用者和实际执行者中间封装一层，封装的这一层可以很灵活的实现各种操作。

# 第十七章 职责链模式
1. 通过实现一个隐式地对请求进行处理的对象组成的链，这其中每个对象都有机会处理请求，并且会传递请求，从而消除请求的发送者和接收者之间的耦合。
2. 借助职责链模式，可以动态的选择由那个对象处理请求，可以比在开发期就动态的指定处理请求的对象高效的多。但是因为接收者是隐式的，所以无法得知具体将有哪个对象处理它，而且不能保证请求一定会被处理，代码调试也会变的更复杂一些。

# 总结
1. 这本书从2015.11.03开始看，到2016.01.06看完，花了64天，基本上是每天看一章，然后就开始敲代码。总体感觉这本书还可以，算是对设计模式有了一个基本的入门吧。