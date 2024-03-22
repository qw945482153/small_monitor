import { setFlag,_support } from "./global";
import { EVENTTYPES } from "../comon";


/**
 * 返回包含id,class,innerText的字符串标签
 * @param target html 节点
 */
export  function htmlElementAsString(target) {
    const tagName = target.tagName.toLowerCase();
    if(tagName === 'body'){
        return "";
    }
    let classNames = target.classList.value;
    classNames = classNames !== '' ? ` class='${classNames}'`:'';
    const id = target.id ? ` id="${target.id}"`:''
    const innerText  = target.innerText;
    return `<${tagName}${id}${classNames !==''? classNames:''}>${innerText}</${tagName}>}`;
}

/**
 * 将地址字符串转换成对象，
 * 输入：'https://github.com/xy-sea/web-see?token=123&name=11'
 * 输出：{
 *  "host": "github.com",
 *  "path": "/xy-sea/web-see",
 *  "protocol": "https",
 *  "relative": "/xy-sea/web-see?token=123&name=11"
 * }
 */

export function parseUrlToObj(url) {
    if (!url) {
      return {};
    }
    //const match = url.match(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
    const match = url.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
    if (!match) {
      return {};
    }
    const query = match[6] || '';
    const fragment = match[8] || '';
    return {
      host: match[4],
      path: match[5],
      protocol: match[2],
      relative: match[5] + query + fragment,
    };
  }

  export function setSilentFlag(
    {
    silentXhr = true,
    silentFetch = true,
    silentClick = true,
    silentHistory = true,
    silentError = true,
    silentHashchange = true,
    silentUnhandledrejection = true,
    silentWhiteScreen = false,
  }
  ){
    setFlag(EVENTTYPES.XHR, !silentXhr);
    setFlag(EVENTTYPES.FETCH, !silentFetch);
    setFlag(EVENTTYPES.CLICK, !silentClick);
    setFlag(EVENTTYPES.HISTORY, !silentHistory);
    setFlag(EVENTTYPES.ERROR, !silentError);
    setFlag(EVENTTYPES.HASHCHANGE, !silentHashchange);
    setFlag(EVENTTYPES.UNHANDLEDREJECTION, !silentUnhandledrejection);
    setFlag(EVENTTYPES.WHITESCREEN, !silentWhiteScreen);
  }

  //对每一个对象错误详情，生成唯一的编码
  
export function getErrorUid(input) {
    return window.btoa(encodeURIComponent(input));
}

export function hashMapExist(hash) {
    const exist = _support.errorMap.has(hash);
    if (!exist) {
      _support.errorMap.set(hash, true);
    }
    return exist;
  }
  