import { variableTypeDatection } from "./verifyType";
import { UAParser } from 'ua-parser-js' //解析游览器设备信息的包

export const isBrowserEnv = variableTypeDatection.isWindow(
    typeof window !== 'undefined' ? window :0
);

// 获取全局变量

export function getGlobal(){
    return window
}

const _global = getGlobal(); // 全局变量
const _support = getGlobalSupport(); // 插件变量引用的全部地址
const uaResult = new UAParser().getResult(); 

// 获取设备信息
_support.deviceInfo = {
    browserVersion: uaResult.browser.version, // 游览器版本号
    browser: uaResult.browser.name, // 游览器类型
    osVersion: uaResult.os.version, // 操作系统 版本
    os: uaResult.os.name, // 操作系统名字
    ua: uaResult.ua, // 游览器内核
    device: uaResult.device.model ? uaResult.device.model : 'Unknow', // 设备驱动模型
    device_type: uaResult.device.type ? uaResult.device.type : 'Pc' // 设备名字
};

_support.hasError = false; // 某段时间代码是否报错

// errorMap 储存代码错误的集合
_support.errorMap = new Map();

_support.replaceFlag = _support.replaceFlag || {};  // 订阅消息

const replaceFlag = _support.replaceFlag;

// 设置订阅消息是否存在
export function setFlag(replaceType,isSet){ 
    if(typeof replaceType === 'string' && typeof isSet === 'boolean'){
        if(replaceFlag[replaceType]) return;
        replaceFlag[replaceType] = isSet;
    }else{
        console.error("参数错误:",typeof replaceType === 'string' ? 'isSet不是boolean类型' : 'replaceType是不是string类型');
    }
}

//判断订阅消息是否存在
export function getFlag(replactType){
    return replaceFlag[replactType] ? true : false;
}

// 获取插件变量引用的全部地址
export function getGlobalSupport(){
    _global.__webMonitor__ =  _global.__webMonitor__ || {};
    return _global.__webMonitor__;
}
// 判断游览器是否为chrome 并且判断跳转是哪种跳转方式 has || history
export function supportHistory(){
    const chrome = _global.chrome;
    const isChromePackagedApp = chrome && chrome.app && chrome.app.runtime;
    const hasHistoryApi = 
        'history' in _global &&
        !!(_global.history).pushState &&
        !!(_global.history).replaceState;
        return !isChromePackagedApp && hasHistoryApi;
}
export { _global, _support}