import { setFlag } from "../utils"
import { getFlag } from '../utils/global'
import { nativeTryCatch } from "../utils/exception";

const handlers = {};

// subsrcibeEvent 设置标识，并将处理的方法放置到handlers中 { xhr: [ function ]}



export function subscribeEvent(handler){
    if(!handler || getFlag(handler.type)) return false
    setFlag(handler.type, true);
    handlers[handler.type] = handlers[handler.type] || [];
    handlers[handler.type]?.push(handler.callback);
    return true;
}


export function notify(type,data){
    if(!type || !handlers[type] ) return;
    // 获取对应事件的回调函数并执行，回调函数为addReplaceHandler事件定义的事件
    handlers[type]?.forEach(callback => {
        nativeTryCatch(
            () => {
                callback(data);
            },
            () => {

            }
        )
    })
}