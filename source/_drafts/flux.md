# flux
facebook推出的构建用户界面的应用架构
![flux结构](flux.png)
* 单向数据流，在view层不能直接修改数据，要修改数据只能通过提交action，然后dispatcher到stroe，使得整体数据的变化是可控的。
* dispatcher作为连接action和store的通道，一个dispatcher必须注册各个action type的回调函数，从而实现，在回调函数中调用stroe的各种函数，让store实现变化。
* 在view层监听store的变化，从而更改view内部的state
* 官方实现版本
## 个人理解
* dispatcher是否可以去掉，从flux/util提供的reduceStore来看，也是可以丢掉的。
* 太繁琐了，需要自己在view层监听store的变化，从而去改变state，应该设计一种根store传递到view，提交action时，修改store，从而直接导致view的变化。

# flux/utils
* flux应该也知道其官方实现的flux太繁琐了，所以进化出flux/utils，其中有几个重要的概念
  + container
    * 控制view，收集信息
      ```
      import AppView from '../views/AppView';
      import {Container} from 'flux/utils';
      import TodoActions from '../data/TodoActions';
      import TodoDraftStore from '../data/TodoDraftStore';
      import TodoEditStore from '../data/TodoEditStore';
      import TodoStore from '../data/TodoStore';

      function getStores() {
        return [
          TodoEditStore,
          TodoDraftStore,
          TodoStore,
        ];
      }

      function getState() {
        return {
          draft: TodoDraftStore.getState(),
          editing: TodoEditStore.getState(),
          todos: TodoStore.getState(),

          onAdd: TodoActions.addTodo,
          onDeleteCompletedTodos: TodoActions.deleteCompletedTodos,
          onDeleteTodo: TodoActions.deleteTodo,
          onEditTodo: TodoActions.editTodo,
          onStartEditingTodo: TodoActions.startEditingTodo,
          onStopEditingTodo: TodoActions.stopEditingTodo,
          onToggleAllTodos: TodoActions.toggleAllTodos,
          onToggleTodo: TodoActions.toggleTodo,
          onUpdateDraft: TodoActions.updateDraft,
        };
      }

      export default Container.createFunctional(AppView, getStores, getState);
      ```
  + reduceStore
    * 为了解决之前的store太繁琐。在container执行的时候，会传入action的所有handler，view层手动执行handler，从而触发dispatch。在store的reduce方法中，会针对各种action type返回全新的store
    ```
      //view
      <input
        checked={areAllComplete ? 'checked' : ''}
        id="toggle-all"
        type="checkbox"
        onChange={props.onToggleAllTodos}
      />
      // action
      toggleAllTodos() {
        TodoDispatcher.dispatch({
          type: TodoActionTypes.TOGGLE_ALL_TODOS,
        });
      }
      // store
      case TodoActionTypes.TOGGLE_ALL_TODOS:
        const areAllComplete = state.every(todo => todo.complete);
        return state.map(todo => todo.set('complete', !areAllComplete));
    ```
  + 解决了最初版本中，需要在view层监听数据变化，从而触发view更新。

# redux
  * 和flux加上flux/util很相似。就三个概念，action描述数据变化，reducer根据action来产生新的state。store就是联系action和reducer的。他会负责dispatch action。dispatch内部会执行reducer方法，从而更新state
  * store有一个subscribe函数，用来注册数据变化的监听函数，dispatch时，会在执行完reducer后，执行subscribe注册的函数。
  * 总的来讲就是比flux简洁许多，整个结构清晰明了。
  * 示例：
    ```
    const reducer = (state = {count: 0}, action) => {
      switch (action.type){
        case 'INCREASE': return {count: state.count + 1};
        case 'DECREASE': return {count: state.count - 1};
        default: return state;
      }
    }

    const actions = {
      increase: () => ({type: 'INCREASE'}),
      decrease: () => ({type: 'DECREASE'})
    }

    const store = createStore(reducer);

    store.subscribe(() =>
      console.log(store.getState())
    );

    store.dispatch(actions.increase()) // {count: 1}
    store.dispatch(actions.increase()) // {count: 2}
    store.dispatch(actions.increase()) // {count: 3}
    ```

# react-redux
  * store是如何注入各个子组件的

# vuex

# 参考资料
* [flux](https://github.com/facebook/flux/)
* [redux](https://github.com/reactjs/redux/)
* [redux源码解析](https://segmentfault.com/a/1190000009626788)
* [redux中文文档](http://cn.redux.js.org/docs/api/createStore.html)
* [淘宝FED：React 实践心得：react-redux 之 connect 方法详解](http://taobaofed.org/blog/2016/08/18/react-redux-connect/)