import { setSilentFlag } from '../utils/browser.js';
import { breadcrumb } from '../code/breadcrumb.js';
import { validateOption } from '../utils/helpers.js';
import { _support } from '../utils/global.js';
import { transportData } from '../code/reportData.js';

export class Options {
    dsn = ''; //监控上报接口的地址
    isperformance = false; // 是否开启性能监测
    isrecordscreen = false; //是否开启录像功能
    throttleDelayTime = 0; //click时间的节流时长
    overTime = 10; //接口超时时长
    whiteBoxElements = ['html','body','#app','#root'];  //白屏检测的容器列表
    silentWhiteScreen = true; //是否开启白屏检测
    skeletonProject = false; //项目是否有骨架屏
    filterXhrUrlRegExp = "" //过滤接口请求正则
    handleHttpStatus= ''; // 处理接口返回的 response
    repeatCodeError = false; // 是否去除重复的代码错误，重复的错误只上报一次
    constructor(){}
    bindOptions(options){
        const {
            dsn,
            filterXhrUrlRegExp,
            throttleDelayTime = 0,
            overTime = 10,
            silentWhiteScreen = false,
            whiteBoxElements = ['html','body','#app','#root'],
            skeletonProject = false,
            handleHttpStatus,
            repeatCodeError = false
        } = options;
        validateOption(dsn,'dsn','string') && (this.dsn = dsn);
        validateOption(filterXhrUrlRegExp,'filterXhrUrlRegExp','regexp') && (this.filterXhrUrlRegExp = filterXhrUrlRegExp);
        validateOption(throttleDelayTime,'throttleDelayTime','number') && (this.throttleDelayTime = throttleDelayTime);
        validateOption(overTime,'overTime','number') && (this.overTime = overTime);
        validateOption(silentWhiteScreen,'silentWhiteScreen','boolean') && (this.silentWhiteScreen = silentWhiteScreen);
        validateOption(whiteBoxElements,'whiteBoxElements','array') && (this.whiteBoxElements = whiteBoxElements);
        validateOption(handleHttpStatus,'handleHttpStatus','function') && (this.handleHttpStatus = handleHttpStatus);
        validateOption(repeatCodeError,'repeatCodeError','boolean') && (this.repeatCodeError = repeatCodeError);
        validateOption(skeletonProject,'skeletonProject','boolean') && (this.skeletonProject = skeletonProject);
    }
}

const options = _support.options || (_support.options = new Options());

export function handleOptions(paramOptions){
    // setSilentFlag 给全局添加已设置的标识 防止重复
    setSilentFlag(paramOptions);
    // // 设置用户行为的配置
    breadcrumb.bindOptions(paramOptions);
    // transportData配置上报
    transportData.bindOptions(paramOptions);
    // // 绑定其他配置
    options.bindOptions(paramOptions);
    
}

export {options};