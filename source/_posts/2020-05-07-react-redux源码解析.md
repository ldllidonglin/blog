title: react-redux源码解析
date: 2020.05.07
tags: [react, react-redux]
categories: 前端
---
react-redux源码解析
<!--more-->
## react-redux常见用法
```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import { App } from './App'
import createStore from './createReduxStore'

const store = createStore()
function mapStateToProps(store) {
  return props
}
function mapDispatchToProps(dispatch) {
  return {
    a() {
      dispatch({...})
    }
  }
}
const Root = connect(mapStateToProps, mapDispatchToProps)(App)

ReactDOM.render(
  <Provider store={store}>
    <Root />
  </Provider>,
  document.getElementById('root')
)
```
## Provider
### 源码
* [Provider源码地址](https://github.com/reduxjs/react-redux/blob/master/src/components/Provider.js)
```javascript
function Provider({ store, context, children }) {
  const contextValue = useMemo(() => {
    const subscription = new Subscription(store)
    subscription.onStateChange = subscription.notifyNestedSubs
    return {
      store,
      subscription
    }
  }, [store])

  const previousState = useMemo(() => store.getState(), [store])

  useEffect(() => {
    const { subscription } = contextValue
    subscription.trySubscribe()

    if (previousState !== store.getState()) {
      subscription.notifyNestedSubs()
    }
    return () => {
      subscription.tryUnsubscribe()
      subscription.onStateChange = null
    }
  }, [contextValue, previousState])

  const Context = context || ReactReduxContext

  return <Context.Provider value={contextValue}>{children}</Context.Provider>
}
```
### 解释
* 把传入的store包装成Subscription对象，执行trySubscribe实现store的订阅，把store和subscription作为contextValue并且通过Context.Provider传给他的child，一般connect就会是Provider的子元素
* connect中会调用useContext获取store和subscription

## connect
### 解释
* [connect源码地址](https://github.com/reduxjs/react-redux/blob/master/src/connect/connect.js)
```JavaScript
// connect
function connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    {
      pure = true,
      areStatesEqual = strictEqual,
      areOwnPropsEqual = shallowEqual,
      areStatePropsEqual = shallowEqual,
      areMergedPropsEqual = shallowEqual,
      ...extraOptions
    } = {}
  ) {
  ...
  return connectHOC(selectorFactory, {...})
}
// connectHOC其实就是connectAdvanced
function connectAdvanced(selectorFactory，connectOptions) {
  return function wrapWithConnect(WrappedComponent) {
    ...
    function ConnectFunction(props) {
      // ...
      const ContextToUse = useMemo(() => {
        return propsContext &&
          propsContext.Consumer &&
          isContextConsumer(<propsContext.Consumer />)
          ? propsContext
          : Context
      }, [propsContext, Context])
      const contextValue = useContext(ContextToUse)
      // ...
      const [
        [previousStateUpdateResult],
        forceComponentUpdateDispatch
      ] = useReducer(storeStateUpdatesReducer, EMPTY_ARRAY, initStateUpdates)
      //...
      useIsomorphicLayoutEffectWithArgs(
        subscribeUpdates,
        [],
        []
      )
      // ...
      const store = didStoreComeFromProps ? props.store : contextValue.store
      const actualChildProps = usePureOnlyMemo(() => {
        if (
          childPropsFromStoreUpdate.current &&
          wrapperProps === lastWrapperProps.current
        ) {
          return childPropsFromStoreUpdate.current
        }

        return childPropsSelector(store.getState(), wrapperProps)
      }, [store, previousStateUpdateResult, wrapperProps])
      // ...
      const renderedWrappedComponent = useMemo(
        () => (
          <WrappedComponent
            {...actualChildProps}
            ref={reactReduxForwardedRef}
          />
        ),
        [reactReduxForwardedRef, WrappedComponent, actualChildProps]
      )

      const renderedChild = useMemo(() => {
        if (shouldHandleStateChanges) {

          return (
            <ContextToUse.Provider value={overriddenContextValue}>
              {renderedWrappedComponent}
            </ContextToUse.Provider>
          )
        }

        return renderedWrappedComponent
      }, [ContextToUse, renderedWrappedComponent, overriddenContextValue])

      return renderedChild
    }

    const contextValue = useContext(ContextToUse)
    const Connect = pure ? React.memo(ConnectFunction) : ConnectFunction
    return hoistStatics(Connect, WrappedComponent)
  }
}
//
function useIsomorphicLayoutEffectWithArgs(
  effectFunc,
  effectArgs,
  dependencies
) {
  useIsomorphicLayoutEffect(() => effectFunc(...effectArgs), dependencies)
}
function subscribeUpdates(
  shouldHandleStateChanges,
  store,
  subscription,
  childPropsSelector,
  lastWrapperProps,
  lastChildProps,
  renderIsScheduled,
  childPropsFromStoreUpdate,
  notifyNestedSubs,
  forceComponentUpdateDispatch
) {
  
  const checkForUpdates = () => {
    if (didUnsubscribe) {
      // Don't run stale listeners.
      // Redux doesn't guarantee unsubscriptions happen until next dispatch.
      return
    }

    const latestStoreState = store.getState()

    let newChildProps, error
    try {
      // Actually run the selector with the most recent store state and wrapper props
      // to determine what the child props should be
      newChildProps = childPropsSelector(
        latestStoreState,
        lastWrapperProps.current
      )
    } catch (e) {
      error = e
      lastThrownError = e
    }

    //...
    lastChildProps.current = newChildProps
    childPropsFromStoreUpdate.current = newChildProps
    renderIsScheduled.current = true

    // If the child props _did_ change (or we caught an error), this wrapper component needs to re-render
    forceComponentUpdateDispatch({
      type: 'STORE_UPDATED',
      payload: {
        error
      }
    })
    
  }

  // Actually subscribe to the nearest connected ancestor (or store)
  subscription.onStateChange = checkForUpdates
  subscription.trySubscribe()

  // Pull data from the store after first render in case the store has
  // changed since we began.
  checkForUpdates()

  const unsubscribeWrapper = () => {
    didUnsubscribe = true
    subscription.tryUnsubscribe()
    subscription.onStateChange = null

    if (lastThrownError) {
      // It's possible that we caught an error due to a bad mapState function, but the
      // parent re-rendered without this component and we're about to unmount.
      // This shouldn't happen as long as we do top-down subscriptions correctly, but
      // if we ever do those wrong, this throw will surface the error in our tests.
      // In that case, throw the error from here so it doesn't get lost.
      throw lastThrownError
    }
  }

  return unsubscribeWrapper
}


```
### 解释
* [hoistStatics](https://github.com/mridgway/hoist-non-react-statics)方法的效果和Object.assign类似，就是把WrappedComponent上的所有非react内置的静态方法拷贝到Connect上，并且返回Connect
* 所以connect最后返回的是一个函数`wrapWithConnect`，这个函数以WrappedComponent为参数，所以才有`connect(mapStateToProps, mapDispatchToProps)(App)`这样的用法
* 执行wrapWithConnect(App),最终返回的是React.memo(ConnectFunction)
* ConnectFunction最终返回的是renderedChild，renderedChild是一个ContextToUse.Provider，overriddenContextValue作为value传递下去,并且把WrappedComponent作为子元素，`actualChildProps`里的所有属性作为WrappedComponent的props。
* `actualChildProps`一般情况下就是`childPropsFromStoreUpdate.current`，而`childPropsFromStoreUpdate`是通过useRef来创建的，`childPropsFromStoreUpdate.current`会在c`heckForUpdates`里面更新
* 在ConnectFunction中，会执行useIsomorphicLayoutEffectWithArgs -> subscribeUpdates，subscribeUpdates里面会执行`subscription.onStateChange = checkForUpdates;subscription.trySubscribe()`，从而把实现`store.subscribe(checkForUpdates)`的效果,从而每次store更新，就会执行`checkForUpdates`，而`checkForUpdates`中，如果计算得到的props发生了更改，则会重新生成`newChildProp`，并且赋值给`childPropsFromStoreUpdate.current`。然后调`forceComponentUpdateDispatch`
  ```javascript
  newChildProps = childPropsSelector(
    latestStoreState,
    lastWrapperProps.current
  )
  if (newChildProps !== lastChildProps.current) {
    childPropsFromStoreUpdate.current = newChildProps
    forceComponentUpdateDispatch({
      type: 'STORE_UPDATED',
      payload: {
        error
      }
    })
  }
  ```
* forceComponentUpdateDispatch是通过以下代码创建的
  ```javascript
  const [
      [previousStateUpdateResult],
      forceComponentUpdateDispatch
    ] = useReducer(storeStateUpdatesReducer, EMPTY_ARRAY, initStateUpdates)
  ```
* 所以最终会导致ConnectFunction的re-render
* `actualChildProps == childPropsFromStoreUpdate.current`，最终把更新好的props传递到WrappedComponent

## redux的store更新是怎么传递过来的
* Provider会初始一个Subscription对象subscription_a，通过context传递到connect
* connect以subscription_a为父Subscription对象创建一个Subscription对象subscription_b
* 在connect中会执行subscription_b.trySubscribe时，此时会执行  `this.parentSub.addNestedSub(this.handleChangeWrapper)`,
* this.parentSub.addNestedSub又会执行this.trySubscribe()，从而把subscription_a的handleChangeWrapper方法执行到this.store.subscribe(this.handleChangeWrapper)
* 并且会初始化subscription_a.listeners数组，在执行subscription_a.addNestedSub时，会把this.listeners.subscribe(listener)，这个listener就是subscription_b.handleChangeWrapper
* 所以store更新是执行subscription_a.handleChangeWrapper,而subscription_a.handleChangeWrapper里面会执行onStateChange()，subscription_a.onStateChange这个方法在Provider初始化的时候被设置为notifyNestedSubs，notifyNestedSubs方法执行的是this.listeners.notify()，从而把listeners的回调都执行一遍。其中就包含subscription_b.handleChangeWrapper。
* subscription_b.handleChangeWrapper里面执行的onStateChange，在connect中会被设置为checkForUpdates，从而实现store更新，最终把更新传递到connect的checkForUpdates



## 参考链接
* https://react-redux.js.org/api/provider
* https://zhuanlan.zhihu.com/p/100662731
* https://www.jianshu.com/p/b039a062e021
