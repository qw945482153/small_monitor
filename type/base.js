import { EVENTTYPES, STATUS_CODE, BREADCRUMBTYPES } from "../comon"; 

// Without 设置可选属性
export const Without = {};

// 至少有一个 互斥属性
export const XOR = Without;

/**
 * http请求
 */

export const HttpDate = {
    type: "", 
    method: "", //请求方式
    time: 5000,
    url: '', // 接口地址
    elapsedTime: 0, // 接口时长
    message: "", //接口信息
    Status: 200, //接口状态编码
    status:'ok', //接口状态
    requestData:{
        httpType:"",  //请求类型 xhr fetch
        method:"", // 请求方式
        data:[]
    },
    response: {
        Status: 0, // 接口状态
        data:""
    }
}


/**
 * 资源加载失败
 */

export const ResouceError = {
    time:0,
    message:"", //加载失败的信息
    name:"" //脚本类型 js脚本
}

/**
 * 长任务列表
 */
export const LongTask = {
    time:0,
    message:"", // longTask
    LongTask:"", //长任务详情 
}


/**
 * 性能指标
 */

export const PerfromanceData = {
    name: "FCP",
    value: "", //数值
    rating: "" //等级
}

/**
 * 内存信息
 */

export const MemoryData = {
    name: "memory",
    memory:{
        jsHeapSizeLimit: 0,
        totalJSHeapSize: 0,
        usedJSHeapSize:0

    }
}

/**
 * 代码错误
 */

export const CodeError = {
    colum: 0,
    line: 0,
    message: "",
    fileName: "" //发出错误的文件
}

/**
 * 用户行为
 */

export const Behavior = {
    type: EVENTTYPES,
    category: "",
    status: STATUS_CODE,
    data: XOR,
    message: "",
    name: ""
}

/**
 * 录屏信息
 */

export const RecordScreen = {
    recordScreenID: '', // 录屏id
    events: "" //录屏内容
}

/**
 * 上报的数据接口
 */

export const ReportData = {
   HttpDate,
   ResouceError,
   LongTask,
   PerfromanceData,
   MemoryData,
   CodeError,
   RecordScreen,
   type: "", // 事件类型
    pageUrl: "", // 页面地址
    time: 0, // 发生时间
    uuid: "", // 页面唯一标识
    apikey: "", // 项目id
    status: "", // 事件状态
    sdkVersion: "", // 版本信息
    breadcrumb: [], // 用户行为
    // 设备信息
  deviceInfo: {
    browserVersion: "", // 版本号
    browser: "", // Chrome
    osVersion: "", // 电脑系统 10
    os: "", // 设备系统
    ua: "", // 设备详情
    device: "", // 设备种类描述
    device_type:"" // 设备种类，如pc
  }
}

export const Callback= (args) => {
    return args
}
export const IAnyObject = {
    key:""
}

export const voidFun = (args) => args;

export const  ReplaceHandler = {
    type:EVENTTYPES,
    callback:Callback
}

export const ReplaceCallback = (data) => data

export const ResourceTarget = {
    src: "",
    href: "",
    localName: ""
}

//通用信息
export const AUthInfo = {
    apikey: "",
    sdkVersion: "",
    userId: ""
}

export const BreadcrumbData = {
    type:EVENTTYPES, //事件类型
    category: BREADCRUMBTYPES, //用户行为类型
    status: STATUS_CODE, //行为状态,
    time:0, //发生时间
    data:""
}

export const ErrorTarget  = {
    target:{
        localName:""
    },
    error:"",
    message:""
}

export const RouteHistory = {
    from:"string",
    to:"string"
}

export const WebMonitor = {
    hasError:false, //某段时间代码是否报错
    events: [], // 储存录屏的信息
    recordScrrenId: "", // 本次录屏的id
    _loopTimer: 0, //白屏循环检测的timer
    transportData: "", //数据上报
    options: "", //配置信息
    replaceFlag:
    {// 订阅信息
       
    },
    deviceInfo:{
        // 设备信息
       
    }
}

export const SdkBase = {
    chrome:{
        app:{
            
        }
    },
    history: "",
    addEventListener:"",
    innerWidth:"",
    innerHeight:"",
    onpopstate:"",
    performance:"",
    __webMonitor__:{
    }
}

export class BasePlugin{
    type = "";
    constructor(type){
        this.type = type;
    }
    // eslint-disable-next-line no-unused-vars
    bindOptions(options){} // 校验参数
    // eslint-disable-next-line no-unused-vars
    core(SdkBase){} //核心方法
    // eslint-disable-next-line no-unused-vars
    transform(data){} //数据转化
}