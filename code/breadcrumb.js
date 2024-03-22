import { EVENTTYPES, BREADCRUMBTYPES } from "../comon";
import { _support, getTimestamp, validateOption } from "../utils/index";

export class Breadcrumb {
    maxBreadcrumbs = 20; //用户存放的最大长度
    beforePushBreadcrumb = function(res){ return res};
    stack=[]
    constructor(){
        this.stack = []
    }
    /**
     * 添加用户行为栈
     */
    push(data){
       
        if( typeof this.beforePushBreadcrumb === 'function') {
            
            const result = this.beforePushBreadcrumb(data);
            
            if(!result) return;
            this.immediatelyPush(result);
            return
        }   
    }
    /**
     * 判断添加条件
     * @param {*} data 
     */
    immediatelyPush(data){
        data.time || (data.time = getTimestamp());
        if(this.stack.length >= this.maxBreadcrumbs){
            this.shift();
        }
        this.stack.push(data);
        this.stack.sort((a, b) => a.time - b.time);
    }
    /**
     * 超20删掉第一个
     * @returns 
     */
    shift(){
        return this.stack.shift() !== undefined;
    }
    // 全部清除
    clear(){
        this.stack = []
    }
    // 展示收集的数据
    getStack(){
        return this.stack
    }
    //用户行为分类
    getCategory(type){
        switch (type){
            // 接口请求
            case EVENTTYPES.XHR:
            case EVENTTYPES.FETCH:
                return BREADCRUMBTYPES.HTTP;
            // 点击事件
            case EVENTTYPES.CLICK:
                return BREADCRUMBTYPES.CLICK
            // 路由事件
            case EVENTTYPES.HISTORY:
            case EVENTTYPES.HASHCHANGE:
                return BREADCRUMBTYPES.ROUTE
            // 加载资源
            case EVENTTYPES.RESOURCE:
                return BREADCRUMBTYPES.RESOURCE
            // js代码报错
            case EVENTTYPES.UNHANDLEDREJECTION:
            case EVENTTYPES.ERROR:
                return BREADCRUMBTYPES.CODEERROR
            default :
                return BREADCRUMBTYPES.CUSTOM
        }
    }
    //配置绑定
    bindOptions(options){
        const { maxBreadcrumbs, beforePushBreadcrumb} = options;
        validateOption(maxBreadcrumbs,'maxBreadcrumbs','number') && (this.maxBreadcrumbs = maxBreadcrumbs || 20);
        validateOption(beforePushBreadcrumb, 'beforePushBreadcrumb', 'function') && (this.beforePushBreadcrumb = beforePushBreadcrumb);
    }
}

const breadcrumb = _support.breadcrumb || (_support.breadcrumb = new Breadcrumb());

export { breadcrumb };