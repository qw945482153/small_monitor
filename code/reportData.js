import { Queue } from "../utils/queu"
import { _support, generateUUID, getLocationHref, isBrowserEnv, isEmpty, validateOption } from "../utils";
import { EVENTTYPES } from "../comon";
import { breadcrumb } from "./breadcrumb";
import { options } from "../lib";

export class TransportData{
    queue = new Queue(); // 消息队列
    apikey = ""; // 项目唯一标识
    errorDsn = ''; // 监控上报接口的地址
    userId = ''; // 用户id
    uuid = ""; // 每次页面加载的唯一标识
    beforeDataReport = (res) => res;; // 上报数据前的hook
    getUserId = ""; // 用户自定义获取userid的方法
    useImgUpload = false; // 是否使用图片打点上报
    constructor(){
        this.uuid = generateUUID(); //每次页面加载的唯一标识
    }
    beacon(url,data){
        return navigator.sendBeacon(url,JSON.stringify(data));
    }
    imgRequest(data,url){
        const requestFun = () => {
            const img = new Image();
            const spliceStr = url.indexOf('?') === -1 ? '?' :'&' ;
            img.src = `${url}${spliceStr}data=${encodeURIComponent(JSON.stringify(data))}`;
        }
        this.queue.addFn(requestFun);
    }
    
    async beforePost(data){
        let transportData = this.getTransportData(data);
        // 配置了beforeDataReport
        if(typeof this.beforeDataReport === 'function'){
            transportData = this.beforeDataReport(transportData);
            if(!transportData){
                return false
            }
            return transportData;
        }
    }
    
    async xhrPost(data,url){
        const requsetFun = () => {
            fetch(`${url}`,{
                method:'POST',
                body:JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        }
        this.queue.addFn(requsetFun)
    }

    //获取用户信息
    getAuthInfo(){
        return {
            userId: this.userId || this.getAUthId() || '',
            sdkVersion:'1.1.1',
            apikey:this.apikey
        };
    }
    getAuthId(){
        if(typeof this.getUserId === 'function'){
            const id = this.getUserId();
            if( typeof id === 'string' || typeof id === 'number'){
                return id
            }else{
                console.error(`web-monitor userId:${id} 期望string 或 number类型，但是传入 ${typeof id}`);
            }
        }
    }

    // 添加公共信息
    // 这里不需要添加时间戳，比如接口报错，发生的时间和上报的不一样
    getTransportData(data){
        const info = {
            ...data,
            ...this.getAuthInfo(), //获取用户信息
            uuid: this.uuid,
            pageUrl: getLocationHref(),
            deviceInfo:_support.deviceInfo //设备信息
        };

        //性能数据,录屏 ， 白屏检测等不需要附带用户行为
        const excludeRreadcrumb = [
            EVENTTYPES.PERFORMANCE,
            EVENTTYPES.RECORDSCREEN,
            EVENTTYPES.WHITESCREEN
        ];
        if( !excludeRreadcrumb.includes(data.type)){
            info.breadcrumb = breadcrumb.getStack();
        }
        return info
    }
    
    // 判断请求是否为SDK配置的接口
    isSdkTransportUrl(targetUrl){
        let isSdkDsn = false;
        if (this.errorDsn && targetUrl.indexOf(this.errorDsn) !== -1){
            isSdkDsn = true;
        } 
        return isSdkDsn;
    }

    bindOptions(options){
        const { dsn, apikey, beforeDataReport, userId, getUserId, useImgUpload} = options;
        validateOption(apikey, 'apikey', 'string') && (this.apikey = apikey);
        validateOption(dsn, 'dsn', 'string') && (this.errorDsn = dsn);
        validateOption(userId, 'userId', 'string') && (this.userId = userId || '');
        validateOption(useImgUpload, 'useImgUpload', 'boolean') && (this.useImgUpload = useImgUpload || false);
        validateOption(beforeDataReport, 'beforeDataReport', 'function') && (this.beforeDataReport = beforeDataReport);
        validateOption(getUserId, 'getUserId', 'function') && (this.getUserId = getUserId);
    }

    //数据上报
    async send(data){
        const dsn = this.errorDsn
        if(isEmpty(dsn)){
            console.error(`web-monitro: dsn为空,没有传入监控错误的上报的dsn地址,请在配置中配置`);
            return;
        }
        // 开启录屏，由recordScreen 插件控制
        if(_support.options.silentRecordScreen){
            if(options.recordScreenTypeList.includes(data.type)){
                //修改hasError
                _support.hasError = true;
                data.recordScreenId = _support.recordScreenId;
            }
        }
        const result = await this.beforePost(data);
        if (isBrowserEnv && result){
            // 优先使用sendBeacon 上报 若数量大 再使用图片打点上报和fetch上报
            const value = this.beacon(dsn,result)
            if(!value){
                return this.useImgUpload ? this.imgRequest(result, dsn) : this.xhrPost(result, dsn);
            }
        }

    }
}

const transportData = _support.transportData || (_support.transportData = new TransportData());

export { transportData }