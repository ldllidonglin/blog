title: react-hooks原理
date: 2020.05.10
tags: [react, react hooks]
categories: 前端
---
react hooks 原理解析
<!--more-->

## useState
### 基本用法
```javascript
import React, { useState } from 'react';

function Example() {
  // Declare a new state variable, which we'll call "count"
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```
### 存储state
* React.useState
```javascript
export function useState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}
function resolveDispatcher() {
    var dispatcher = ReactCurrentDispatcher.current;
    return dispatcher;
  }
```
* dispatcher.useState(initialState)最终调用mountState
* mountState
```javascript
function mountState(initialState) {
  var hook = mountWorkInProgressHook();

  if (typeof initialState === 'function') {
    // $FlowFixMe: Flow doesn't like mixed types
    initialState = initialState();
  }

  hook.memoizedState = hook.baseState = initialState;
  var queue = hook.queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState
  };
  var dispatch = queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber$1, queue);
  return [hook.memoizedState, dispatch];
}
```
* mountWorkInProgressHook
```javascript
function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,

    baseState: null,
    baseQueue: null,
    queue: null,

    next: null,
  };

  if (workInProgressHook === null) {
    // This is the first hook in the list
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    // Append to the end of the list
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}
```
* state是链式存储在fiber节点上的memoizedState属性的
* `workInProgressHook = workInProgressHook.next = hook` 这句代码实现了将state链式存储
* 在实际调用的时候也是这样，每次执行useState会返回当前的state，然后把current指向next，从而实现每个useState都能拿到之前定义的state值
* 所以才规定，useState必须在顶层调用，不能在if语句中和循环中使用，因为他的获取值的顺序完全依赖执行顺序。

### 更新state
```JavaScript
// 返回的dispath是这么定义的
var dispatch = queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber$1, queue);
// 保存了定义是state对应的queue
function dispatchAction(fiber, queue, action) {
  var update = {
    expirationTime: expirationTime,
    suspenseConfig: suspenseConfig,
    action: action,
    eagerReducer: null,
    eagerState: null,
    next: null
  };
  var pending = queue.pending;
  // 把要更新的action保存到queue的pending上，为以后的updateReducer使用
  if (pending === null) {
    // This is the first update. Create a circular list.
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  queue.pending = update;
}
```
* useState(re-render)
```javascript
HooksDispatcherOnUpdate.useState() -> return updateState(initialState)
return updateReducer(basicStateReducer);
```
* updateReducer
```javascript
function updateReducer(reducer, initialArg, init) {
  var hook = updateWorkInProgressHook();
  var queue = hook.queue;
  var pendingQueue = queue.pending;
  current.baseQueue = baseQueue = pendingQueue
  action = currentHook.baseQueue.next.action
  newState = reducer(newState, action)
  hook.memoizedState = newState;
  return [hook.memoizedState, dispatch]
}
```
* basicStateReducer
```javascript
function basicStateReducer(state, action) {
  // $FlowFixMe: Flow doesn't like mixed types
  return typeof action === 'function' ? action(state) : action;
}
```
* `updateReducer`最终是使用了currentHook的queue的pending.next的action，这个值是在setState时更新的
* 更新stage时只是把要更新的状态存储在队列中，最终re-render时会去执行reducer，然后拿到最新的state
* useState内部其实是使用了useReducer
* 每次执行useState，会执行resolveDispatcher从而获得当前的dispatcher，返回的是ReactCurrentDispatcher.current，这个值会根据运行情况进行变化，从而实现mount和update时，最终调用不同的方法，初始化时，是mountState，更新时是调用udateState

## useEffect
### 基本用法
```javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    // Update the document title using the browser API
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```
### 源码
```javascript
function useEffect(create, deps) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useEffect(create, deps) -> mountEffect(create, deps); // 一开始时是执行mountEffect，具体执行的方法会在运行的不同阶段调用不同的方法
}
function mountEffect(create, deps) {
  return mountEffectImpl(Update | Passive, Passive$1, create, deps);
}
function mountEffectImpl(fiberEffectTag, hookEffectTag, create, deps) {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  currentlyRenderingFiber.effectTag |= fiberEffectTag;
  hook.memoizedState = pushEffect(
    HookHasEffect | hookEffectTag,
    create,
    undefined,
    nextDeps,
  );
}
function pushEffect(tag, create, destroy, deps) {
  const effect: Effect = {
    tag,
    create,
    destroy,
    deps,
    // Circular
    next: (null: any),
  };
  let componentUpdateQueue: null | FunctionComponentUpdateQueue = (currentlyRenderingFiber.updateQueue: any);
  if (componentUpdateQueue === null) {
    componentUpdateQueue = createFunctionComponentUpdateQueue();
    currentlyRenderingFiber.updateQueue = (componentUpdateQueue: any);
    componentUpdateQueue.lastEffect = effect.next = effect;
  } else {
    const lastEffect = componentUpdateQueue.lastEffect;
    if (lastEffect === null) {
      componentUpdateQueue.lastEffect = effect.next = effect;
    } else {
      const firstEffect = lastEffect.next;
      lastEffect.next = effect;
      effect.next = firstEffect;
      componentUpdateQueue.lastEffect = effect;
    }
  }
  return effect;
}
```
* 最终是把create方法（useEffect时的第一个参数）放到effect对象中，effect对象又被推入currentlyRenderingFiber的updateQueue中

### 什么时候执行
```javascript
function commitHookEffectListMount(tag, finishedWork) {
  const updateQueue: FunctionComponentUpdateQueue | null = (finishedWork.updateQueue: any);
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    do {
      if ((effect.tag & tag) === tag) {
        // Mount
        const create = effect.create;
        effect.destroy = create();
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}
```
* 把执行create的结果赋值给effect的destroy属性，

### deps是怎么起作用的
* 更新时执行以下代码
```javascript
function updateEffectImpl(fiberEffectTag, hookEffectTag, create, deps): void {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  let destroy = undefined;

  if (currentHook !== null) {
    const prevEffect = currentHook.memoizedState;
    destroy = prevEffect.destroy;
    if (nextDeps !== null) {
      const prevDeps = prevEffect.deps;
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        pushEffect(hookEffectTag, create, destroy, nextDeps);
        return;
      }
    }
  }

  currentlyRenderingFiber.effectTag |= fiberEffectTag;

  hook.memoizedState = pushEffect(
    HookHasEffect | hookEffectTag,
    create,
    destroy,
    nextDeps,
  );
}
```
* `areHookInputsEqual`会比较上一次的deps和最新的deps是否相同，如果不想同，则执行`pushEffect`

### useEffect返回的函数何时执行
```javascript
function commitHookEffectListUnmount(tag: number, finishedWork: Fiber) {
  const updateQueue: FunctionComponentUpdateQueue | null = (finishedWork.updateQueue: any);
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    do {
      if ((effect.tag & tag) === tag) {
        // Unmount
        const destroy = effect.destroy;
        effect.destroy = undefined;
        if (destroy !== undefined) {
          destroy();
        }
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}
```
* 在执行unMount时，会把effect上的destroy取出来执行，而destroy又是执行effect时的结果


