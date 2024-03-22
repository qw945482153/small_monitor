import { variableTypeDatection } from "./verifyType";
// 获取当前时间
export function getTimestamp(){
    return Date.now();
}

//获取目标类型
export function typeofAny(target){
    return Object.prototype.toString.call(target).slice(8,-1).toLowerCase();
}

// 验证选项的类型
export function validateOption(target,targetName,expectType){
    if(!target) return false;
    if(typeofAny(target) === expectType) return true
    console.error(`web-monito:${targetName}期望传入${expectType}类型,目前是${typeofAny(target)}类型`)
}

// 截取指定的字符串
export function interceptStr(str, interceptLength) {
    if (variableTypeDatection.isString(str)) {
      return (
        str.slice(0, interceptLength) +
        (str.length > interceptLength ? `:截取前${interceptLength}个字符` : '')
      );
    }
    return '';
  }
  
  //获取页面专属uuid
  export function generateUUID() {
    let d = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
  }
 // 获取本地连接地址
  export function getLocationHref(){
    if (typeof document === 'undefined' || document.location == null) return '';
    return document.location.href;
  }

// unknown转化成字符串
  export function unknownToString(target) {
    if (variableTypeDatection.isString(target)) {
      return target ;
    }
    if (variableTypeDatection.isUndefined(target)) {
      return 'undefined';
    }
    return JSON.stringify(target);
  }

  /**
 *
 * 重写对象上面的某个属性
 * ../param source 需要被重写的对象
 * ../param name 需要被重写对象的key
 * ../param replacement 以原有的函数作为参数，执行并重写原有函数
 * ../param isForced 是否强制重写（可能原先没有该属性）
 * ../returns void
 */
export function replaceAop(
  source,
  name,
  replacement,
  isForced = false
) {
  if (source === undefined) return;
  if (name in source || isForced) {
    const original = source[name];
    const wrapped = replacement(original);
    if (typeof wrapped === 'function') {
      source[name] = wrapped;
    }
  }
}


/**
 * 添加事件监听器
 * ../export
 * ../param {{ addEventListener: Function }} target
 * ../param {keyof TotalEventName} eventName
 * ../param {Function} handler
 * ../param {(boolean | Object)} opitons
 * ../returns
 */
export function on(target, eventName, handler, opitons = false) {
  target.addEventListener(eventName, handler, opitons);
}


/**
 * 函数节流
 * fn 需要节流的函数
 * delay 节流的时间间隔
 * 返回一个包含节流功能的函数
 */
export const throttle = (fn, delay) => {
  let canRun = true;
  return function (...args) {
    if (!canRun) return;
    fn.apply(this, args);
    canRun = false;
    setTimeout(() => {
      canRun = true;
    }, delay);
  };
};