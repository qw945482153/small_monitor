import {  EVENTTYPES, HTTPTYPE, EMethods } from "../comon";
import { options } from "../lib";
//import { _global, , getTimestamp, on, replaceAop, supportHistory, variableTypeDatection, throttle, isExistProperty } from "../utils";
import { _global, getTimestamp, on, replaceAop, variableTypeDatection, throttle, supportHistory, isExistProperty, getLocationHref } from "../utils";
import { transportData } from "./reportData";
import { subscribeEvent } from "./subsrcibe";
import { notify } from "./subsrcibe";



// 判断当前接口是否为需要过滤掉的接口
function isFilterHttpUrl(url) {
    return options.filterXhrUrlRegExp && options.filterXhrUrlRegExp.test(url);
}


// 
function replace(type){
    switch (type){
        // js错误 try catch
        case EVENTTYPES.WHITESCREEN:
            whiteScreen()
            break;
        case EVENTTYPES.XHR:
            xhrReplace()
            break;
        case EVENTTYPES.FETCH:
            fetchReplace();
            break;
        case EVENTTYPES.ERROR:
            listenError();
            break;
        case EVENTTYPES.HISTORY:
            historyReplace();
            break;
        case EVENTTYPES.UNHANDLEDREJECTION:
            unhandledrejectionReplace();
            break;
        case EVENTTYPES.CLICK:
            domReplace();
            break;
        case EVENTTYPES.HASHCHANGE:
            listenHashchange();
            break;
        default:
            break;
    }
}
// 添加重写方法
export function addReplaceHandler(handler){
    //方法是否标记已重写
    if(!subscribeEvent(handler)) return
    replace(handler.type);
}

function whiteScreen(){
    notify(EVENTTYPES.WHITESCREEN);
}

//重写xhr请求

function xhrReplace(){
    //判断是否已经重写了
    if(!('XMLHttpRequest' in _global)){
        return;
    }
    const originalXhrProto = XMLHttpRequest.prototype;
    // 重写 open 方法
    replaceAop(originalXhrProto, 'open', (originalOpen) => {
        return function (...args){
            this.webmonitor_xhr = {
                method: variableTypeDatection.isString(args[0]) ? args[0].toUpperCase() : args[0],
                url: args[1],
                sTime: getTimestamp(),
                type: HTTPTYPE.XHR
            };
            originalOpen.apply(args)
        }
    });
    
    // 重写send方法
    replaceAop(originalXhrProto, 'send', (originalSend) => {
        return function (...args){
            const {method,url} = this.webmonitor_xhr;
            // 监听loadend事件 成功或者失败都会调用
            on('loadend', function(){
                if(method === EMethods.Post && transportData.isSdkTransportUrl(url) || isFilterHttpUrl(url)){
                    return ;
                }
                const { responseType, response, status } = this;
                this.webmonitor_xhr.requestData = args[0];
                const eTime = getTimestamp();
                 // 设置该接口的time，用户用户行为按时间排序
                this.webmonitor_xhr.time = this.webmonitor_xhr.sTime;
                this.webmonitor_xhr.Status = status;
                if(['','json','text'].indexOf(responseType) !== -1 ){
                    //用户设置的handleHttpStatus函数来判断接口是否正确，只有接口报错时才保留response
                    if(options.handleHttpStatus && typeof options.handleHttpStatus == 'function'){
                        this.webmonitor_xhr.response = response && JSON.parse(response);
                    }
                }
                // 接口的执行时长
                this.webmonitor_xhr.elapsedTime = eTime - this.webmonitor_xhr.sTime;
                //执行之前注册xhr回调函数
                notify(EVENTTYPES.XHR,this.webmonitor_xhr);
            });
            originalSend.apply(args);
        }
    })
}

// 重写fetch请求
function fetchReplace() {
    if (!('fetch' in _global)) {
      return;
    }
    replaceAop(_global, EVENTTYPES.FETCH, originalFetch => {
      return function (url, config = {}) {
        const sTime = getTimestamp();
        const method = (config && config.method) || 'GET';
        let fetchData = {
          type: HTTPTYPE.FETCH,
          method,
          requestData: config && config.body,
          url,
          response: '',
        };
        // 获取配置的headers
        const headers = new Headers(config.headers || {});
        Object.assign(headers, {
          setRequestHeader: headers.set,
        });
        config = Object.assign({}, config, headers);
        return originalFetch.apply(_global, [url, config]).then(
          (res) => {
            // 克隆一份，防止被标记已消费
            const tempRes = res.clone();
            const eTime = getTimestamp();
            fetchData = Object.assign({}, fetchData, {
              elapsedTime: eTime - sTime,
              Status: tempRes.status,
              time: sTime,
            });
            tempRes.text().then((data) => {
              // 同理，进接口进行过滤
              if (
                (method === EMethods.Post && transportData.isSdkTransportUrl(url)) ||
                isFilterHttpUrl(url)
              )
                return;
              // 用户设置handleHttpStatus函数来判断接口是否正确，只有接口报错时才保留response
              if (options.handleHttpStatus && typeof options.handleHttpStatus == 'function') {
                fetchData.response = data;
              }
              notify(EVENTTYPES.FETCH, fetchData);
            });
            return res;
          },
          // 接口报错
          (err) => {
            const eTime = getTimestamp();
            if (
              (method === EMethods.Post && transportData.isSdkTransportUrl(url)) ||
              isFilterHttpUrl(url)
            )
              return;
            fetchData = Object.assign({}, fetchData, {
              elapsedTime: eTime - sTime,
              status: 0,
              time: sTime,
            });
            notify(EVENTTYPES.FETCH, fetchData);
            throw err;
          }
        );
      };
    });
  }

  // 监听常规报错
  function listenError(){
    on(_global,'error',function(e) {
        notify(EVENTTYPES.ERROR,e)
    },
    true);
  }

  //last time route
  let lastHref = getLocationHref();

  // 路由 history模式

  function historyReplace() {
    // 是否支持history
    if (!supportHistory()) return;
    const oldOnpopstate = _global.onpopstate;
    // 添加 onpopstate事件
    _global.onpopstate = function (...args) {
      const to = getLocationHref();
      const from = lastHref;
      lastHref = to;
      notify(EVENTTYPES.HISTORY, {
        from,
        to,
      });
      oldOnpopstate && oldOnpopstate.apply(this, args);
    };
    function historyReplaceFn(originalHistoryFn) {
      return function (...args) {
        const url = args.length > 2 ? args[2] : undefined;
        if (url) {
          const from = lastHref;
          const to = String(url);
          lastHref = to;
          notify(EVENTTYPES.HISTORY, {
            from,
            to,
          });
        }
        return originalHistoryFn.apply(this, args);
      };
    }
    // 重写pushState、replaceState事件
    replaceAop(_global.history, 'pushState', historyReplaceFn);
    replaceAop(_global.history, 'replaceState', historyReplaceFn);
  }
  function unhandledrejectionReplace() {
    on(_global, EVENTTYPES.UNHANDLEDREJECTION, function (ev) {
      // ev.preventDefault() 阻止默认行为后，控制台就不会再报红色错误
      notify(EVENTTYPES.UNHANDLEDREJECTION, ev);
    });
  }


//dom 操作
  function domReplace() {
    if (!('document' in _global)) return;
    // 节流，默认0s
    const clickThrottle = throttle(notify, options.throttleDelayTime);
    on(
      _global.document,
      'click',
      function() {
        clickThrottle(EVENTTYPES.CLICK, {
          category: 'click',
          data: this,
        });
      },
      true
    );
  }


  function listenHashchange() {
    // 通过onpopstate事件，来监听hash模式下路由的变化
    if (isExistProperty(_global, 'onhashchange')) {
      on(_global, EVENTTYPES.HASHCHANGE, function (e) {
        notify(EVENTTYPES.HASHCHANGE, e);
      });
    }
  }