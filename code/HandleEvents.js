import { EVENTTYPES, STATUS_CODE } from "../comon"
import { openWhiteScreen } from "../lib"
import { getTimestamp, hashMapExist, parseUrlToObj, unknownToString } from "../utils"
import { options } from '../lib/options'
import { httpTransform, resourceTransform } from '../code/transportData'
import { transportData } from './reportData'
import { breadcrumb } from "./breadcrumb"
import { getErrorUid } from "../utils"
import ErrorStackParser  from "error-stack-parser"
export const HandleEvents = {
    //处理xhr,fetch回调
    handleHttp(data,type){
        const result = httpTransform(data);
        if(!data.url.includes(options.dsn)){
            breadcrumb.push({
                type,
                category:breadcrumb.getCategory(type),
                data: result,
                status: result.status,
                time: data.time
            })
        }
        if(result.status === 'error'){
            transportData.send({...result, type, status:STATUS_CODE.ERROR});
        }
    },
    //处理白屏
    handleWhiteScreen(){
        openWhiteScreen(res => {
            transportData.send({
                type: EVENTTYPES.WHITESCREEN,
                time:getTimestamp(),
                ...res,
            })
        }, options)
    },
    //捕抓错误
    handleError(ev){
        const target = ev.target;
        if(!target || (ev.target && !ev.target.localName)){
            //vue 和 react捕获的错误使用ev解析， 异步错误用ev.error解析
            const stackFrame = ErrorStackParser.parse(!target? ev : ev.error)[0];
            const { fileName, columnNumber, lineNumber } = stackFrame;
            const errorData = {
                type: EVENTTYPES.ERROR,
                status: STATUS_CODE.ERROR,
                time: getTimestamp(),
                message: ev.message,
                fileName,
                line: lineNumber,
                column: columnNumber
            };
            breadcrumb.push({
                type: EVENTTYPES.ERROR,
                category: breadcrumb.getCategory(EVENTTYPES.ERROR),
                data: errorData,
                time: getTimestamp(),
                status: STATUS_CODE.ERROR
            })
            const hash = getErrorUid(`${EVENTTYPES.ERROR}-${fileName}-${columnNumber}`);
            if(!options.repeatCodeError || (options.repeatCodeError && !hashMapExist(hash))){
                return transportData.send(errorData);
            }
        }

        // 资源加载报错
        if (target?.localName){
            //获取资源加载的信息
            const data = resourceTransform(target);
            breadcrumb.push({
                type:EVENTTYPES.RESOURCE,
                category: breadcrumb.getCategory(EVENTTYPES.RESOURCE),
                status:STATUS_CODE.ERROR,
                time: getTimestamp(),
                data,
            })
            return transportData.send({
                ...data,
                type:EVENTTYPES.RESOURCE,
                status:STATUS_CODE.ERROR
            })
        }
    },
    // 路由模式history 跳转捕获
    handleHistory(data){
        const {from, to} = data;
        // 定义parsedFrom变量，值为relative
        const parsedFrom = parseUrlToObj(from);
        const parsedTo = parseUrlToObj(to);
        breadcrumb.push({
            type: EVENTTYPES.HISTORY,
            category: breadcrumb.getCategory(EVENTTYPES.HISTORY),
            data: {
                from: parsedFrom ? parsedFrom : '/',
                to: parsedTo ? parsedTo : '/',
            },
            time:getTimestamp(),
            status: STATUS_CODE.OK
        })
    },
    // handleUnhandleRejecion 事件
    handleUnhandleRejection(ev){
        const stackFrame = ErrorStackParser.parse(ev.reason)[0];
        const { fileName, columnNumber, lineNumber} = stackFrame;
        const message = unknownToString(ev.reason.message || ev.reason.stack);
        const data = {
            type: EVENTTYPES.UNHANDLEDREJECTION,
            status: STATUS_CODE.ERROR,
            time:getTimestamp(),
            message,
            fileName,
            line: lineNumber,
            column: columnNumber
        };
        breadcrumb.push({
            type: EVENTTYPES.UNHANDLEDREJECTION,
            category: breadcrumb.getCategory(EVENTTYPES.UNHANDLEDREJECTION),
            time:getTimestamp(),
            status: STATUS_CODE.ERROR,
            data
        })

        const hash = getErrorUid(`${EVENTTYPES.UNHANDLEDREJECTION}-${message}-${fileName}-${columnNumber}`)
        
        // 开启repeatCodeError 第一次报错才上报
        if(!options.repeatCodeError || (options.repeatCodeError && !hashMapExist(hash))){
            transportData.send(data);
        }
    },
    handleHashchange(data){
        const {oldURL, newURL} = data;
        const {from} = parseUrlToObj(oldURL);
        const {to} = parseUrlToObj(newURL);
        breadcrumb.push({
            type: EVENTTYPES.HASHCHANGE,
            category: breadcrumb.getCategory(EVENTTYPES.HASHCHANGE),
            data:{
                from,
                to
            },
            time: getTimestamp(),
            status: STATUS_CODE.OK,
        });
    }
} 