// import { _global, setSilentFlag } from "./utils/index";
import { _global, getFlag, setFlag } from "./utils/global.js";
// import { setupReplace, handleOptions } from "./lib/index";
import { handleOptions } from "./lib/options.js";
import { setupReplace } from "./lib/setupReplace.js";
import { EVENTTYPES } from "./comon/constant.js";
import { HandleEvents } from "./code/HandleEvents.js";
import { subscribeEvent } from "./code/subsrcibe.js";
import { nativeTryCatch } from "./utils/exception.js";
import { transportData } from "./code/reportData";
import { breadcrumb } from "./code/breadcrumb";
import { options } from './lib/options.js'
import { notify } from "./code/subsrcibe";
import performance from './performance/index.js';
import recordscreen from './recordscreen/index.js';
import {log} from './code/customLog.js';
// 初始化
function init(options){
    //判断参数是否传入
    if(!options.dsn || !options.apikey) return console.error("web-monitor 缺少必须配置项:"+options.dsn ? 'dsn' : 'apikey');
    //windos 是否支持fetch   sdk是否禁用
    if(!('fetch' in _global) || options.disabled) return;
    //初始化配置
    handleOptions(options);
    setupReplace();
    console.log(options.isperformance,options.isrecordscreen);
    if(options?.isperformance){
      use(performance)
    }
    if(options?.isrecordscreen){
      use(recordscreen, {
        recordScreentime: 15
      })
    }
}

// vue项目
function install(Vue, options) {
    if (getFlag(EVENTTYPES.VUE)) return;
    setFlag(EVENTTYPES.VUE, true);
    const handler = Vue.config.errorHandler;
    // vue项目在Vue.config.errorHandler中上报错误
    Vue.config.errorHandler = function (err, vm, info) {
      HandleEvents.handleError(err);
      if (handler) handler.apply(null, [err, vm, info]);
    };
    init(options);
  }

// react项目 在 ErrorBoundary中上报错误
function errorBoundary(err){
  if(getFlag(EVENTTYPES.REACT)) return;
  setFlag(EVENTTYPES.REACT, true);
  HandleEvents.handleError(err);
}

// 插件扩展
function use(plugin,option){
  const instance = new plugin(option);
  console.log(!subscribeEvent({callback:data =>{
    instance.transform(data);
  },
  type: instance.type,
}))
// if (
//   !subscribeEvent({
//     callback: data => {
//       instance.transform(data);
//     },
//     type: instance.type,
//   })
// )return;
  
nativeTryCatch(() => {
  instance.core( { transportData, breadcrumb, options, notify} )
})

}
export default {
    init,install,errorBoundary,use,log
}