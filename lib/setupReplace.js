import { EVENTTYPES, STATUS_CODE } from "../comon";
import { addReplaceHandler } from "../code/replace";
import { HandleEvents } from "../code/HandleEvents";
import { getTimestamp, htmlElementAsString } from "../utils";
import { breadcrumb } from "../code/breadcrumb";
//监听错误方法
export function setupReplace(){
    // 白屏检测
    addReplaceHandler({
        callback:() => {
            HandleEvents.handleWhiteScreen();
        },
        type: EVENTTYPES.WHITESCREEN
    })

    // 重写XMLHttpRequest
    addReplaceHandler(
        {
            callback:data => {
                HandleEvents.handleHttp(data,EVENTTYPES.XHR);
            },
            type: EVENTTYPES.XHR
        }
    )

    //重写Fetch
    addReplaceHandler({
        callback:data => {
            HandleEvents.handleHttp(data,EVENTTYPES.FETCH);
        },
        type: EVENTTYPES.FETCH
    })

    //捕获错误
    addReplaceHandler({
        callback: error => {
            HandleEvents.handleError(error);
        },
        type: EVENTTYPES.ERROR
    })
    
    //监听history模式路由的变化
    addReplaceHandler({
        callback: data => {
            HandleEvents.handleHistory(data);
        },
        type: EVENTTYPES.HISTORY
    })

    //添加handleUnhandleRejecion 事件
    addReplaceHandler({
        callback: data => {
            HandleEvents.handleUnhandleRejection(data);
        },
        type: EVENTTYPES.UNHANDLEDREJECTION
    })

    //监听click事件
    addReplaceHandler({
        // 获取html信息 
        callback: data => {
            const htmlString = htmlElementAsString(data.data.activeElement);
            if(htmlString) {
                breadcrumb.push({
                    type: EVENTTYPES.CLICK,
                    status: STATUS_CODE.OK,
                    category: breadcrumb.getCategory(EVENTTYPES.CLICK),
                    data: htmlString,
                    time: getTimestamp(),
                });
            }
        },
        type: EVENTTYPES.CLICK
    })
    
    // 监听 hashchange 路由变化
    addReplaceHandler({
        callback:(e) => {
            HandleEvents.handleHashchange(e);
        },
        type: EVENTTYPES.HASHCHANGE,
    })
}