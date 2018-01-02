# flux
facebook推出的构建用户界面的应用架构
![flux机构](flux.png)
* 单向数据流，在view层不能直接修改数据，要修改数据只能通过提交action，然后dispatcher到stroe，使得整体数据的变化是可控的。
* dispatcher作为连接action和store的通道，一个dispatcher必须注册各个action type的回调函数，从而实现，在回调函数中调用stroe的各种函数，让store实现变化。
* 在view层监听store的变化，从而更改view内部的state

## 理解
* dispatcher是否可以扔掉，从flux/util提供的reduceStore来看，也是可以丢掉的。
* 太繁琐了，需要自己在view层监听store的变化，从而去改变state，应该设计一种根store传递到view，提交action时，修改store，从而直接导致view的变化。

# flux/utils
* flux应该也知道其太繁琐了，所以进化出flux/utils，其中有几个重要的概念
  + container
    