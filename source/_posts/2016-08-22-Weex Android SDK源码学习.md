---
title: Weex Android SDK源码学习
tags: [Weex,android,笔记]
date: 2016.09.07
categories: 自学
---
## 1 Weex Android的集成
具体过程可以查看[官方文档](http://alibaba.github.io/weex/doc/advanced/integrate-to-android.html)
### 1.1 在app运行的初始阶段对Weex Engine进行初始化：
<!--more-->
```
//MyApplication.java
public class WeexApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        InitConfig.Builder builder = new InitConfig.Builder();
        builder.setImgAdapter(new ImageAdapter());
        //builder.setHttpAdapter(new DefaultWXHttpAdapter());
        InitConfig config = builder.build();
        WXSDKEngine.initialize(this,config);
    }
}
```

#### 1.1.1 WXSDKEngine.java中的源码初始化部分
```
/**
  *
  * @param application
  * @param config initial configurations or null
*/
public static void initialize(Application application,InitConfig config){
  synchronized (mLock) {
    if (init) {
      return;
    }
    long start = System.currentTimeMillis();
    doInitInternal(application,config);
    WXEnvironment.sSDKInitInvokeTime = System.currentTimeMillis()-start;
    init = true;
  }
}

private static void doInitInternal(final Application application,final InitConfig config){
  WXEnvironment.sApplication = application;
  WXEnvironment.JsFrameworkInit = false;
  WXBridgeManager.getInstance().getJSHandler().post(new Runnable() {
    @Override
    public void run() {
      long start = System.currentTimeMillis();
      WXSDKManager sm = WXSDKManager.getInstance();
      if(config != null ) {
        sm.setIWXHttpAdapter(config.getHttpAdapter());
        sm.setIWXImgLoaderAdapter(config.getImgAdapter());
        sm.setIWXUserTrackAdapter(config.getUtAdapter());
        sm.setIWXDebugAdapter(config.getDebugAdapter());
        sm.setIWXStorageAdapter(config.getStorageAdapter());
        if(config.getDebugAdapter()!=null){
          config.getDebugAdapter().initDebug(application);
        }
      }
      WXSoInstallMgrSdk.init(application);
      boolean isSoInitSuccess = WXSoInstallMgrSdk.initSo(V8_SO_NAME, 1, config!=null?config.getUtAdapter():null);
      if (!isSoInitSuccess) {
        return;
      }
      sm.initScriptsFramework(null);

      WXEnvironment.sSDKInitExecuteTime = System.currentTimeMillis() - start;
      WXLogUtils.renderPerformanceLog("SDKInitInvokeTime", WXEnvironment.sSDKInitInvokeTime);
      WXLogUtils.renderPerformanceLog("SDKInitExecuteTime", WXEnvironment.sSDKInitExecuteTime);
    }
  });
  register();
}
```
#### 主要操作
* 初始化so库文件，渲染逻辑、脚本业务框架等都封装在了这里；
* 初始化initScriptsFramework，也就是初始化脚本框架；
* register() 注册component、module
## 1.2 生成SDK实例，开始渲染bundle.js，并且监听渲染完事件，添加到container中
```
//MainActivity.java
public class MainActivity extends AppCompatActivity implements IWXRenderListener {
    public static final String TAG = "MainActivity";
    WXSDKInstance mInstance;
    ViewGroup mContainer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        mContainer = (ViewGroup) findViewById(R.id.container);
        mInstance = new WXSDKInstance(this); //create weex instance
        mInstance.registerRenderListener(this); 
        //mInstance.registerRenderListener(new SimpleRenderListener()) //SimpleRenderListener需要开发者来实现
        instance.renderByUrl(TAG, WEEX_INDEX_URL, options, null, ScreenUtil.getDisplayWidth(this),  
                             ScreenUtil.getDisplayHeight(this), WXRenderStrategy.APPEND_ASYNC);  
    ...
    ...
    //监听创建完命令，然后添加到container中
    @Override
    public void onViewCreated(WXSDKInstance wxsdkInstance, View view) {
        if (mContainer != null) {
            mContainer.addView(view);
        }
    }
```
# 2 具体渲染源码
## 2.1 源码中的renderByUrl函数
```
//WXSDKInstance.java
public void renderByUrl(String pageName, final String url, Map<String, Object> options, final String jsonInitData, final int width, final int height, final WXRenderStrategy flag) {

    pageName = wrapPageName(pageName, url);

    if (options == null) {
      options = new HashMap<String, Object>();
    }
    if (!options.containsKey(BUNDLE_URL)) {
      options.put(BUNDLE_URL, url);
    }

    Uri uri=Uri.parse(url);
    if(uri!=null && TextUtils.equals(uri.getScheme(),"file")){
      render(pageName, WXFileUtils.loadAsset(assembleFilePath(uri), mContext),options,jsonInitData,width,height,flag);
      return;
    }

    IWXHttpAdapter adapter=WXSDKManager.getInstance().getIWXHttpAdapter();

    WXRequest wxRequest = new WXRequest();
    wxRequest.url = url;
    if (wxRequest.paramMap == null) {
      wxRequest.paramMap = new HashMap<String, String>();
    }
    wxRequest.paramMap.put("user-agent", WXHttpUtil.assembleUserAgent(mContext,WXEnvironment.getConfig()));
    adapter.sendRequest(wxRequest, new WXHttpListener(pageName, options, jsonInitData, width, height, flag, System.currentTimeMillis()));
    mWXHttpAdapter = adapter;
  }
```
如果是file那就直接调用render函数渲染，如果是远程地址，用http请求,在请求结束的回调中去渲染，WXHttpListener继承自IWXHttpAdapter.OnHttpListener，其有onHttpFinish回调
```
public void onHttpFinish(WXResponse response) {
  mWXPerformance.networkTime = System.currentTimeMillis() - startRequestTime;
  if(response.extendParams!=null){
    Object actualNetworkTime=response.extendParams.get("actualNetworkTime");
    mWXPerformance.actualNetworkTime=actualNetworkTime instanceof Long?(long)actualNetworkTime:0;
    WXLogUtils.renderPerformanceLog("actualNetworkTime", mWXPerformance.actualNetworkTime);

    Object pureNetworkTime=response.extendParams.get("pureNetworkTime");
    mWXPerformance.pureNetworkTime=pureNetworkTime instanceof Long?(long)pureNetworkTime:0;
    WXLogUtils.renderPerformanceLog("pureNetworkTime", mWXPerformance.pureNetworkTime);

    Object connectionType=response.extendParams.get("connectionType");
    mWXPerformance.connectionType=connectionType instanceof String?(String)connectionType:"";

    Object packageSpendTime=response.extendParams.get("packageSpendTime");
    mWXPerformance.packageSpendTime=packageSpendTime instanceof Long ?(long)packageSpendTime:0;

    Object syncTaskTime=response.extendParams.get("syncTaskTime");
    mWXPerformance.syncTaskTime=syncTaskTime instanceof Long ?(long)syncTaskTime:0;

    Object requestType=response.extendParams.get("requestType");
    mWXPerformance.requestType=requestType instanceof String?(String)requestType:"";
  }
  WXLogUtils.renderPerformanceLog("networkTime", mWXPerformance.networkTime);
  if (response!=null && response.originalData!=null && TextUtils.equals("200", response.statusCode)) {
    String template = new String(response.originalData);
    render(pageName, template, options, jsonInitData, width, height, flag);
  } else if (TextUtils.equals(WXRenderErrorCode.WX_USER_INTERCEPT_ERROR, response.statusCode)) {
    WXLogUtils.d("user intercept");
    onRenderError(WXRenderErrorCode.WX_USER_INTERCEPT_ERROR,response.errorMsg);
  } else {
    onRenderError(WXRenderErrorCode.WX_NETWORK_ERROR, response.errorMsg);
  }

}
```
最终还是调用render函数进行渲染
```
public void render(String pageName, String template, Map<String, Object> options, String jsonInitData, int width, int height, WXRenderStrategy flag) {
    if (mRendered || TextUtils.isEmpty(template)) {
      return;
    }

    if(options==null){
      options=new HashMap<>();
    }

    if(WXEnvironment.sDynamicMode && !TextUtils.isEmpty(WXEnvironment.sDynamicUrl) && options!=null && options.get("dynamicMode")==null){
      options.put("dynamicMode","true");
      renderByUrl(pageName, WXEnvironment.sDynamicUrl, options, jsonInitData, width, height, flag);
      return;
    }

    mWXPerformance.pageName = pageName;
    mWXPerformance.JSTemplateSize = template.length() / 1024;

    mRenderStartTime = System.currentTimeMillis();
    mRenderStrategy = flag;
    mGodViewWidth = width;
    mGodViewHeight = height;
    mInstanceId = WXSDKManager.getInstance().generateInstanceId();
    WXSDKManager.getInstance().createInstance(this, template, options, jsonInitData);
    mRendered = true;
  }
```
render函数中关键的一步
其实是create了一个WXSDKManager的实例，并且把template传了过去
```
WXSDKManager.getInstance().createInstance(this, template, options, jsonInitData);
```
## 2.2 WXSDKManager
创建WXSDKManager实例函数主要是创建了WXRenderManger和WXBridgeManger的实例，template是传递到了WXBridgeManger的实例
```
//WXSDKManager.java
void createInstance(WXSDKInstance instance, String code, Map<String, Object> options, String jsonInitData) {
    mWXRenderManager.createInstance(instance);
    mBridgeManager.createInstance(instance.getInstanceId(), code, options, jsonInitData);
  }
```
WXRenderManger创建实例只是把实例id和状态管理实例push到它的ConcurrentHashMap<String, WXRenderStatement> mRegistries中，为了便于管理多实例的情况
```
//mWXRenderManager.java
public void createInstance(WXSDKInstance instance) {
    mRegistries.put(instance.getInstanceId(), new WXRenderStatement(instance));
  }
```
WXBridgeManager的实例化，执行了一个post函数，启动一个线程执行
```
//WXBridgeManager.java
/**
 * Create instance.
*/
public void createInstance(final String instanceId, final String template,
                             final Map<String, Object> options, final String data) {
    if ( TextUtils.isEmpty(instanceId)
        || TextUtils.isEmpty(template) || mJSHandler == null) {
      WXSDKInstance instance = WXSDKManager.getInstance().getSDKInstance(instanceId);
      if (instance != null) {
        instance.onRenderError(WXRenderErrorCode.WX_CREATE_INSTANCE_ERROR, "createInstance fail!");
      }
      return;
    }

    post(new Runnable() {
      @Override
      public void run() {
        long start = System.currentTimeMillis();
        invokeCreateInstance(instanceId, template, options, data);
        final long totalTime = System.currentTimeMillis() - start;
        WXSDKManager.getInstance().postOnUiThread(new Runnable() {

          @Override
          public void run() {
            WXSDKInstance instance = WXSDKManager.getInstance().getSDKInstance(instanceId);
            if (instance != null) {
              instance.createInstanceFinished(totalTime);
            }
          }
        }, 0);
      }
    }, instanceId);
  }
```
run函数内先是执行了invokeCreateInstance
```
private void invokeCreateInstance(String instanceId, String template,
                                    Map<String, Object> options, String data) {

    initFramework("");

    if (mMock) {
      mock(instanceId);
    } else {
      if (!isJSFrameworkInit()) {
        WXSDKInstance instance = WXSDKManager.getInstance().getSDKInstance(instanceId);
        if (instance != null) {
          instance.onRenderError(WXRenderErrorCode.WX_CREATE_INSTANCE_ERROR, "createInstance "
                                                                             + "fail!");
        }
        String err = "[WXBridgeManager] invokeCreateInstance: framework.js uninitialized.";
        WXErrorCode.WX_ERR_INVOKE_NATIVE.appendErrMsg(err);
        commitJSBridgeAlarmMonitor(instanceId, WXErrorCode.WX_ERR_INVOKE_NATIVE);
        WXLogUtils.e(err);
        return;
      }
      try {
        if (WXEnvironment.isApkDebugable()) {
          WXLogUtils.d("createInstance >>>> instanceId:" + instanceId
                       + ", options:"
                       + WXJsonUtils.fromObjectToJSONString(options)
                       + ", data:" + data);
        }
        WXJSObject instanceIdObj = new WXJSObject(WXJSObject.String,
                                                  instanceId);
        WXJSObject instanceObj = new WXJSObject(WXJSObject.String,
                                                template);
        WXJSObject optionsObj = new WXJSObject(WXJSObject.JSON,
                                               options == null ? "{}"
                                                               : WXJsonUtils.fromObjectToJSONString(options));
        WXJSObject dataObj = new WXJSObject(WXJSObject.JSON,
                                            data == null ? "{}" : data);
        WXJSObject[] args = {instanceIdObj, instanceObj, optionsObj,
            dataObj};
        invokeExecJS(instanceId, null, METHOD_CREATE_INSTANCE, args);
        commitJSBridgeAlarmMonitor(instanceId, WXErrorCode.WX_SUCCESS);
      } catch (Throwable e) {
        WXSDKInstance instance = WXSDKManager.getInstance().getSDKInstance(instanceId);
        if (instance != null) {
          instance.onRenderError(WXRenderErrorCode.WX_CREATE_INSTANCE_ERROR,
                                 "createInstance failed!");
        }
        String err = "[WXBridgeManager] invokeCreateInstance " + e.getCause();
        WXErrorCode.WX_ERR_INVOKE_NATIVE.appendErrMsg(err);
        commitJSBridgeAlarmMonitor(instanceId, WXErrorCode.WX_ERR_INVOKE_NATIVE);
        WXLogUtils.e(err);
      }
    }
  }
```
它把之前传过来的参数又包装了以下，传给invokeExecJS执行
```
private void invokeExecJS(String instanceId, String namespace, String function, WXJSObject[] args){
    if (WXEnvironment.isApkDebugable()) {
      mLodBuilder.append("callJS >>>> instanceId:").append(instanceId)
              .append("function:").append(function)
              .append(" tasks:").append(WXJsonUtils.fromObjectToJSONString(args));
      WXLogUtils.d(mLodBuilder.substring(0));
      mLodBuilder.setLength(0);
    }

    if(mDestroyedInstanceId!=null && !mDestroyedInstanceId.contains(instanceId)) {
      mWXBridge.execJS(instanceId, namespace, function, args);
    }else{
      WXLogUtils.w("invokeExecJS: instanceId: "+instanceId+"was  destroy !! ExecJS abandon !!");
    }
  }
```
mWXBridge是WXBridge的实例，执行execJS调用so库方法进行js代码解析，在安卓中就是V8引擎，解析完后c++代码会调用callNative函数，将js中对native的操作告诉native，最终实现native端的渲染。
## 2.3 native中处理v8引擎解析的js代码产生的回调，从而实现js-->native
```
public int callNative(String instanceId, String tasks, String callback) {
    long start = System.currentTimeMillis();
    if(WXSDKManager.getInstance().getSDKInstance(instanceId)!=null) {
      WXSDKManager.getInstance().getSDKInstance(instanceId).firstScreenCreateInstanceTime(start);
    }
    int errorCode = WXBridgeManager.getInstance().callNative(instanceId, tasks, callback);

    if(WXSDKManager.getInstance().getSDKInstance(instanceId)!=null) {
      WXSDKManager.getInstance().getSDKInstance(instanceId).callNativeTime(System.currentTimeMillis() - start);
    }
    if(WXEnvironment.isApkDebugable()){
      if(errorCode == WXBridgeManager.DESTROY_INSTANCE){
        WXLogUtils.w("destroyInstance :"+instanceId+" JSF must stop callNative");
      }
    }
    return errorCode;
  }
```
它又调用了WXBridgeManager的callNative
```
public int callNative(String instanceId, String tasks, String callback) {
    if (TextUtils.isEmpty(tasks)) {
      if (WXEnvironment.isApkDebugable()) {
        WXLogUtils.e("[WXBridgeManager] callNative: call Native tasks is null");
      }
      return INSTANCE_RENDERING_ERROR;
    }

    if (WXEnvironment.isApkDebugable()) {
      mLodBuilder.append("[WXBridgeManager] callNative >>>> instanceId:").append(instanceId)
          .append(", tasks:").append(tasks).append(", callback:").append(callback);
      WXLogUtils.d(mLodBuilder.substring(0));
      mLodBuilder.setLength(0);
    }

    if(mDestroyedInstanceId!=null &&mDestroyedInstanceId.contains(instanceId)){
      return DESTROY_INSTANCE;
    }


    long start = System.currentTimeMillis();
    JSONArray array = JSON.parseArray(tasks);

    if(WXSDKManager.getInstance().getSDKInstance(instanceId)!=null) {
      WXSDKManager.getInstance().getSDKInstance(instanceId).jsonParseTime(System.currentTimeMillis() - start);
    }

    int size = array.size();
    if (size > 0) {
      try {
        JSONObject task;
        for (int i = 0; i < size; ++i) {
          task = (JSONObject) array.get(i);
          if (task != null && WXSDKManager.getInstance().getSDKInstance(instanceId) != null) {
            if (TextUtils.equals(WXDomModule.WXDOM, (String) task.get(WXDomModule.MODULE))) {
              sDomModule = getDomModule(instanceId);
              sDomModule.callDomMethod(task);
            } else {
              WXModuleManager.callModuleMethod(instanceId, (String) task.get(WXDomModule.MODULE),
                      (String) task.get(WXDomModule.METHOD), (JSONArray) task.get(WXDomModule.ARGS));
            }
          }
        }
      } catch (Exception e) {
        WXLogUtils.e("[WXBridgeManager] callNative exception: ", e);
      }
    }

    if (UNDEFINED.equals(callback)) {
      return INSTANCE_RENDERING_ERROR;
    }
    // get next tick
    getNextTick(instanceId, callback);
    return INSTANCE_RENDERING;
  }

  private void getNextTick(final String instanceId, final String callback) {
    addJSTask(METHOD_CALLBACK,instanceId, callback, "{}");
    sendMessage(instanceId, WXJSBridgeMsgType.CALL_JS_BATCH);
  }


  private void addJSTask(final String method, final String instanceId, final Object... args) {
    mJSHandler.post(new Runnable() {
      @Override
      public void run() {
        if (args == null || args.length == 0) {
          return;
        }

        ArrayList<Object> argsList = new ArrayList<>();
        for (Object arg : args) {
          argsList.add(arg);
        }

        WXHashMap<String, Object> task = new WXHashMap<>();
        task.put(WXConst.KEY_METHOD, method);
        task.put(WXConst.KEY_ARGS, argsList);

        if (mNextTickTasks.get(instanceId) == null) {
          ArrayList<WXHashMap<String, Object>> list = new ArrayList<>();
          list.add(task);
          mNextTickTasks.put(instanceId, list);
        } else {
          mNextTickTasks.get(instanceId).add(task);
        }
      }
    });
  }

  private void sendMessage(String instanceId, int what) {
    Message msg = Message.obtain(mJSHandler);
    msg.obj = instanceId;
    msg.what = what;
    msg.sendToTarget();
  }
```
在这个callNative函数中会分发task，并且获取getNextTick。tasks中就包含各种函数，下面的callDomMethod会进行判断，从而调用native中的对应方法
## 2.4 WXDOMModule.java
```
public void callDomMethod(JSONObject task) {
    if( task == null ) {
      return;
    }

    String method = (String) task.get(METHOD);
    JSONArray args = (JSONArray) task.get(ARGS);

    if(method == null){
      return;
    }

    try {
      switch (method) {
        case CREATE_BODY:
          if(args == null){
            return;
          }
          createBody((JSONObject) args.get(0));
          break;
        case UPDATE_ATTRS:
          if(args == null){
            return;
          }
          updateAttrs((String) args.get(0), (JSONObject) args.get(1));
          break;
        case UPDATE_STYLE:
          if(args == null){
            return;
          }
          updateStyle((String) args.get(0), (JSONObject) args.get(1));
          break;
        case REMOVE_ELEMENT:
          if(args == null){
            return;
          }
          removeElement((String) args.get(0));
          break;
        case ADD_ELEMENT:
          if(args == null){
            return;
          }
          addElement((String) args.get(0), (JSONObject) args.get(1), (Integer) args.get(2));
          break;
        case MOVE_ELEMENT:
          if(args == null){
            return;
          }
          moveElement((String) args.get(0), (String) args.get(1), (Integer) args.get(2));
          break;
        case ADD_EVENT:
          if(args == null){
            return;
          }
          addEvent((String) args.get(0), (String) args.get(1));
          break;
        case REMOVE_EVENT:
          if(args == null){
            return;
          }
          removeEvent((String) args.get(0), (String) args.get(1));
          break;
        case CREATE_FINISH:
          createFinish();
          break;
        case REFRESH_FINISH:
          refreshFinish();
          break;
        case UPDATE_FINISH:
          updateFinish();
          break;
        case SCROLL_TO_ELEMENT:
          if(args == null){
            return;
          }
          scrollToElement((String) args.get(0), (JSONObject) args.get(1));
          break;
        case ADD_RULE:
          if (args == null)
            return;
          addRule((String) args.get(0), (JSONObject) args.get(1));
      }

    }catch (IndexOutOfBoundsException e){
      // no enougn args
      e.printStackTrace();
      WXLogUtils.e("Dom module call miss arguments.");
    } catch (ClassCastException cce) {
      WXLogUtils.e("Dom module call arguments format error!!");
    }
  }
```
# 3 渲染举例
当method是CREATE_BODY时，会执行createBody函数
```
/**
* Create a body for the current {@link com.taobao.weex.WXSDKInstance} according to given
* parameter.
* @param element info about how to create a body
*/
public void createBody(JSONObject element) {
    if (element == null) {
        return;
    }
    Message msg = Message.obtain();
    WXDomTask task = new WXDomTask();
    task.instanceId = mWXSDKInstance.getInstanceId();
    task.args = new ArrayList<>();
    task.args.add(element);
    msg.what = WXDomHandler.MsgType.WX_DOM_CREATE_BODY;
    msg.obj = task;
    WXSDKManager.getInstance().getWXDomManager().sendMessage(msg);
}
```
上面这个函数最终是调用了WXDOMManager中的sendMessage函数
```
public void sendMessage(Message msg) {
    if (msg == null || mDomHandler == null || mDomThread == null
        || !mDomThread.isWXThreadAlive() || mDomThread.getLooper() == null) {
      return;
    }
    mDomHandler.sendMessage(msg);
  }
```
从代码中可以看到WXDOMManager中其实又是执行了mDomHandler的sendMessage。WXDomHandler负责响应消息，并且分发任务，
它继承了os.handler.callback。它会处理消息，最终createBody被分发到mWXDomManager.createBody,Manger中又是调用了
WXDOMStatement.createBody(element);下面看WXDOmStatement的createBody函数
```
//WXDOMStatement.java
/**
* Create command object for creating body according to the JSONObject. And put the command
* object in the queue.
* @param element the jsonObject according to which to create command object.
*/
void createBody(JSONObject element) {
    if (mDestroy) {
        return;
    }
    WXSDKInstance instance = WXSDKManager.getInstance().getSDKInstance(mInstanceId);
    if (element == null) {
        if (instance != null) {
        instance.commitUTStab(WXConst.DOM_MODULE, WXErrorCode.WX_ERR_DOM_CREATEBODY);
        }
        return;
    }
    //Parse the jsonObject to {@link WXDomObject} recursively
    WXDomObject domObject = parseInner(element);
    if(domObject==null){
        return;
    }
    Map<String, Object> style = new HashMap<>(5);
    if (domObject.style == null || !domObject.style.containsKey(WXDomPropConstant.WX_FLEXDIRECTION)) {
        style.put(WXDomPropConstant.WX_FLEXDIRECTION, "column");
    }
    if (domObject.style == null || !domObject.style.containsKey(WXDomPropConstant.WX_BACKGROUNDCOLOR)) {
        style.put(WXDomPropConstant.WX_BACKGROUNDCOLOR, "#ffffff");
    }
    //If there is height or width in JS, then that value will override value here.
    if (domObject.style == null || !domObject.style.containsKey(WXDomPropConstant.WX_WIDTH)) {
        style.put(WXDomPropConstant.WX_WIDTH, WXViewUtils.getWebPxByWidth(WXViewUtils.getWeexWidth(mInstanceId)));
        domObject.setModifyWidth(true);
    }
    if (domObject.style == null || !domObject.style.containsKey(WXDomPropConstant.WX_HEIGHT)) {
        style.put(WXDomPropConstant.WX_HEIGHT, WXViewUtils.getWebPxByWidth(WXViewUtils.getWeexHeight(mInstanceId)));
        domObject.setModifyHeight(true);
    }
    domObject.ref = WXDomObject.ROOT;
    domObject.updateStyle(style);
    transformStyle(domObject, true);

    try {
        final WXComponent component = mWXRenderManager.createBodyOnDomThread(mInstanceId, domObject);
        AddDomInfo addDomInfo = new AddDomInfo();
        addDomInfo.component = component;
        mAddDom.put(domObject.ref, addDomInfo);

        mNormalTasks.add(new IWXRenderTask() {

        @Override
        public void execute() {
            WXSDKInstance instance = WXSDKManager.getInstance().getSDKInstance(mInstanceId);
            if (instance == null || instance.getContext() == null) {
                WXLogUtils.e("instance is null or instance is destroy!");
                return;
            }
            try {
                mWXRenderManager.createBody(mInstanceId, component);
            } catch (Exception e) {
                WXLogUtils.e("create body failed.", e);
            }
        }

        @Override
        public String toString() {
            return "createBody";
        }
        });
        animations.add(new Pair<String, Map<String, Object>>(domObject.ref,domObject.style));
        mDirty = true;

        if (instance != null) {
        instance.commitUTStab(WXConst.DOM_MODULE, WXErrorCode.WX_SUCCESS);
        }
    }catch (Exception e){

        WXLogUtils.e("create body in dom thread failed." + e.getMessage());
    }
}
```
这个函数中有一句parseInner函数把element这个JSONObject转换成domObject，给他加上了各种type、
event、childern等属性
```
/**
   * Parse the jsonObject to {@link WXDomObject} recursively
   * @param map the original JSONObject
   * @return Dom Object corresponding to the JSONObject.
*/
private WXDomObject parseInner(JSONObject map) {
    if (map == null || map.size() <= 0) {
      return null;
    }

    String type = (String) map.get("type");
    WXDomObject domObject = WXDomObjectFactory.newInstance(type);

    if(domObject==null){
      return null;
    }

    domObject.type = type;
    domObject.ref = (String) map.get("ref");
    Object style = map.get("style");
    if (style != null && style instanceof JSONObject) {
      domObject.style = new WXStyle();
      putAll(domObject.style, (JSONObject) style);
    }
    Object attr = map.get("attr");
    if (attr != null && attr instanceof JSONObject) {
      domObject.attr = new WXAttr();
      putAll(domObject.attr, (JSONObject) attr);
    }
    Object event = map.get("event");
    if (event != null && event instanceof JSONArray) {
      domObject.event = new WXEvent();
      JSONArray eventArray = (JSONArray) event;
      int count = eventArray.size();
      for (int i = 0; i < count; ++i) {
        domObject.event.add(eventArray.getString(i));
      }
    }
    Object children = map.get("children");
    if (children != null && children instanceof JSONArray) {
      domObject.children = new ArrayList<>();
      JSONArray childrenArray = (JSONArray) children;
      int count = childrenArray.size();
      for (int i = 0; i < count; ++i) {
        domObject.children.add(parseInner(childrenArray.getJSONObject(i)));
      }
    }

    return domObject;
}
```
这createBody函数就是根据JSONObject创建一个创建body的命令并且推到队列中。
队列里会执行这么一句话，执行了mWXRenderManager的createBodyOnDomThread函数
```
final WXComponent component = mWXRenderManager.createBodyOnDomThread(mInstanceId, domObject);
```
看WXRenderManager中的createBodyOnDomThread函数
```
public WXComponent createBodyOnDomThread(String instanceId, WXDomObject domObject) {
    WXRenderStatement statement = mRegistries.get(instanceId);
    if (statement == null) {
      return null;
    }
    return statement.createBodyOnDomThread(domObject);
}
```
又是调用了WXRenderStatement中的对应函数
```
WXComponent createBodyOnDomThread(WXDomObject dom) {
    if (mWXSDKInstance == null) {
      return null;
    }
    WXDomObject domObject = new WXDomObject();
    domObject.type = WXBasicComponentType.DIV;
    domObject.ref = "god";
    mGodComponent = (WXVContainer) WXComponentFactory.newInstance(mWXSDKInstance, domObject, null);
    mGodComponent.createView(null, -1);
    if (mGodComponent == null) {
      if (WXEnvironment.isApkDebugable()) {
        WXLogUtils.e("rootView failed!");
      }
      //TODO error callback
      return null;
    }
    FrameLayout frameLayout = (FrameLayout) mGodComponent.getHostView();
    ViewGroup.LayoutParams layoutParams = new LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
    frameLayout.setLayoutParams(layoutParams);
    frameLayout.setBackgroundColor(Color.TRANSPARENT);

    WXComponent component = generateComponentTree(dom, mGodComponent);
    mGodComponent.addChild(component);
    mRegistry.put(component.getRef(), component);
    return component;
}
```
这个函数就是创建WXComponent，但是component是由其中generateComponentTree这个函数是把之前传进来的WXDomObject转换成Component的
```
private WXComponent generateComponentTree(WXDomObject dom, WXVContainer parent) {
    if (dom == null || parent == null) {
      return null;
    }
    WXComponent component = WXComponentFactory.newInstance(mWXSDKInstance, dom,
                                                           parent, parent.isLazy());

    mRegistry.put(dom.ref, component);
    if (component instanceof WXVContainer) {
      WXVContainer parentC = (WXVContainer) component;
      int count = dom.childCount();
      WXDomObject child = null;
      for (int i = 0; i < count; ++i) {
        child = dom.getChild(i);
        if (child != null) {
          parentC.addChild(generateComponentTree(child, parentC));
        }
      }
    }

    return component;
}
```
终于得到WXComponent后，在WXDOMStatement.createBody中接着就执行了
mWXRenderManager.createBody(mInstanceId, component);同样的它又
是调用了statement.createBody(component);
```
/**
   * create RootView ，every weex Instance View has a rootView;
   * @see com.taobao.weex.dom.WXDomStatement#createBody(JSONObject)
*/
void createBody(WXComponent component) {
    long start = System.currentTimeMillis();
    component.createView(mGodComponent, -1);
    if (WXEnvironment.isApkDebugable()) {
      WXLogUtils.renderPerformanceLog("createView", (System.currentTimeMillis() - start));
    }
    start = System.currentTimeMillis();
    component.applyLayoutAndEvent(component);
    component.bindData(component);

    if (WXEnvironment.isApkDebugable()) {
      WXLogUtils.renderPerformanceLog("bind", (System.currentTimeMillis() - start));
    }

    if (component instanceof WXScroller) {
      WXScroller scroller = (WXScroller) component;
      if (scroller.getInnerView() instanceof ScrollView) {
        mWXSDKInstance.setRootScrollView((ScrollView) scroller.getInnerView());
      }
    }
    mWXSDKInstance.setRootView(mGodComponent.getRealView());
    if (mWXSDKInstance.getRenderStrategy() != WXRenderStrategy.APPEND_ONCE) {
      mWXSDKInstance.onViewCreated(mGodComponent);
    }
}
```
最终这两句话创建rootview并且触发mWXSDKInstance的onViewCreated
```
mWXSDKInstance.setRootView(mGodComponent.getRealView());
if (mWXSDKInstance.getRenderStrategy() != WXRenderStrategy.APPEND_ONCE) {
    mWXSDKInstance.onViewCreated(mGodComponent);
}
```

# 4 渲染结束调用过程
## 4.1 当method是CREATE_FINISH时，调用createFinish
```
/**
  * Notify the {@link WXDomManager} that creation of dom tree is finished.
  * This notify is given by JS.
*/
public void createFinish() {
    Message msg = Message.obtain();
    WXDomTask task = new WXDomTask();
    task.instanceId = mWXSDKInstance.getInstanceId();
    msg.what = WXDomHandler.MsgType.WX_DOM_CREATE_FINISH;
    msg.obj = task;
    WXSDKManager.getInstance().getWXDomManager().sendMessage(msg);
  }
```
getWXDomManager的sendMessage调用了mDomHandler.sendMessage(msg);
```
WXDomHandler.java
/**
 * Handler for dom operations.
 */
public class WXDomHandler implements Handler.Callback {

  /**
   * The batch operation in dom thread will run at most once in 16ms.
   */
  private static final int DELAY_TIME = 16;//ms
  private WXDomManager mWXDomManager;
  private boolean mHasBatch = false;

  public WXDomHandler(WXDomManager domManager) {
    mWXDomManager = domManager;
  }

  @Override
  public boolean handleMessage(Message msg) {
    if (msg == null) {
      return false;
    }
    int what = msg.what;
    Object obj = msg.obj;
    WXDomTask task = null;
    if (obj instanceof WXDomTask) {
      task = (WXDomTask) obj;
    }
    if (!mHasBatch) {
      mHasBatch = true;
      mWXDomManager.sendEmptyMessageDelayed(WXDomHandler.MsgType.WX_DOM_BATCH, DELAY_TIME);
    }

    switch (what) {
      case MsgType.WX_DOM_CREATE_BODY:
        mWXDomManager.createBody(task.instanceId, (JSONObject) task.args.get(0));
        break;
      case MsgType.WX_DOM_UPDATE_ATTRS:
        mWXDomManager.updateAttrs(task.instanceId, (String) task.args.get(0), (JSONObject) task.args.get(1));
        break;
      case MsgType.WX_DOM_UPDATE_STYLE:
        mWXDomManager.updateStyle(task.instanceId, (String) task.args.get(0), (JSONObject) task.args.get(1));
        break;
      case MsgType.WX_DOM_ADD_DOM:
        mWXDomManager.addDom(task.instanceId, (String) task.args.get(0), (JSONObject) task.args.get(1), (Integer) task.args.get(2));
        break;
      case MsgType.WX_DOM_REMOVE_DOM:
        mWXDomManager.removeDom(task.instanceId, (String) task.args.get(0));
        break;
      case MsgType.WX_DOM_MOVE_DOM:
        mWXDomManager.moveDom(task.instanceId, (String) task.args.get(0), (String) task.args.get(1), (Integer) task.args.get(2));
        break;
      case MsgType.WX_DOM_ADD_EVENT:
        mWXDomManager.addEvent(task.instanceId, (String) task.args.get(0), (String) task.args.get(1));
        break;
      case MsgType.WX_DOM_REMOVE_EVENT:
        mWXDomManager.removeEvent(task.instanceId, (String) task.args.get(0), (String) task.args.get(1));
        break;
      case MsgType.WX_DOM_CREATE_FINISH:
        mWXDomManager.createFinish(task.instanceId);
        break;
      case MsgType.WX_DOM_REFRESH_FINISH:
        mWXDomManager.refreshFinish(task.instanceId);
        break;
      case MsgType.WX_DOM_UPDATE_FINISH:
        mWXDomManager.updateFinish(task.instanceId);
        break;
      case MsgType.WX_ANIMATION:
        mWXDomManager.startAnimation(task.instanceId,
                                     (String) task.args.get(0),
                                     (String) task.args.get(1),
                                     (String) task.args.get(2));
        break;
      case MsgType.WX_DOM_BATCH:
        mWXDomManager.batch();
        mHasBatch = false;
        break;

      case MsgType.WX_DOM_SCROLLTO:
        mWXDomManager.scrollToDom(task.instanceId, (String) task.args.get(0), (JSONObject) task.args.get(1));
        break;
      case MsgType.WX_DOM_ADD_RULE:
        mWXDomManager.addRule((String) task.args.get(0), (JSONObject) task.args.get(1));
        break;
      default:
        break;
    }
    return true;
  }


  public static class MsgType {

    public static final int WX_DOM_CREATE_BODY = 0x0;
    public static final int WX_DOM_UPDATE_ATTRS = 0x01;
    public static final int WX_DOM_UPDATE_STYLE = 0x02;
    public static final int WX_DOM_ADD_DOM = 0x03;
    public static final int WX_DOM_REMOVE_DOM = 0x04;
    public static final int WX_DOM_MOVE_DOM = 0x05;
    public static final int WX_DOM_ADD_EVENT = 0x06;
    public static final int WX_DOM_REMOVE_EVENT = 0x07;
    public static final int WX_DOM_SCROLLTO = 0x08;
    public static final int WX_DOM_CREATE_FINISH = 0x09;
    public static final int WX_DOM_REFRESH_FINISH = 0x0a;
    public static final int WX_DOM_UPDATE_FINISH = 0x0b;
    public static final int WX_ANIMATION=0xc;
    public static final int WX_DOM_ADD_RULE=0xd;

    public static final int WX_DOM_BATCH = 0xff;
  }
}
```
最终调用了mWXDomManager中的对应方法，而WXDomManager中最终又调用了WXDomStatement中的对应方法。
## 4.2 WXDomStatement.java
weex.dom.WXDomStatement调用createFinish，通知WXRenderManager，given view is finished
```
/**
  * Create a command object for notifying {@link WXRenderManager} that the process of creating
  * given view is finished, and put the command object in the queue.
*/
void createFinish() {
    if (mDestroy) {
      return;
    }

    final WXDomObject root = mRegistry.get(WXDomObject.ROOT);
    mNormalTasks.add(new IWXRenderTask() {

      @Override
      public void execute() {
        mWXRenderManager.createFinish(mInstanceId,
                                      (int) root.getLayoutWidth(),
                                      (int) root.getLayoutHeight());
      }

      @Override
      public String toString() {
        return "createFinish";
      }
    });

    mDirty = true;
    WXSDKInstance instance = WXSDKManager.getInstance().getSDKInstance(mInstanceId);
    if (instance != null) {
      instance.commitUTStab(WXConst.DOM_MODULE, WXErrorCode.WX_SUCCESS);
    }
  }
```

## 4.3 渲染完触发回调
WXRenderStatement调用createFinish，触发mWXSDKInstance.onViewCreated(mGodComponent);