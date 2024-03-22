/***
 * 数据判断
 * @param type 数据类型
 * @param value 校验数据
 * @return Boolean
 */
function isType(type){
    return function (value){
        return  Object.prototype.toString.call(value) === `[object ${type}]`;
    }
}

/**
 * 检测变量类型
 * @param type 数据类型
 */
export const variableTypeDatection = {
    isNumber: isType('Number'),
    isString: isType('String'),
    isBoolean: isType('Boolean'),
    isNull: isType('Null'),
    isUndefined: isType('Undefined'),
    isSymbol: isType('Symbol'),
    isFunction :isType('Function'),
    isObject: isType('Object'),
    isArray: isType('Array'),
    isProcess: isType('Process'),
    isWindow: isType('Window')
}

/**
 * 自定义错误类型判断
 * @param error
 * @returns Boolean
 */

export function isError(error){
    switch(Object.prototype.toString.call(error)){
        case '[object Error]':
            return true
        case '[object Exception]':
            return true
        case '[object DOMException]':
            return true
        default :
            return false
    }
}

/**
 * 检查是否是空对象
 * @param obj
 */

export function isEmptyObject(obj){
    return variableTypeDatection.isObject(obj) && Object.keys(obj).length === 0
}
/**
 * 检查是否是空字符串
 * @param wat
 */
export function isEmpty(wat){
    return (
        (variableTypeDatection.isString(wat) && wat.trim() === '') || wat === null
    )
}
/**
 * 判断对象是否有该属性
 * @param {*} obj 
 * @param {*} key 
 * @returns 
 */
export function isExistProperty(obj,key){
    return Object.prototype.hasOwnProperty.call(obj,key);
}