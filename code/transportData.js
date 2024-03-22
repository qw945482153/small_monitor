import { options } from '../lib/options'
import { STATUS_CODE,HTTP_CODE } from '../comon';
import { fromHttpStatus } from '../comon/httpStatus';
import { getTimestamp } from '../utils';
import { interceptStr } from '../utils';



//处理接口状态

export function httpTransform(data) {
    let message = '';
    const { elapsedTime, time, method = '', type, Status = 200, response, requestData } = data;
    let status = STATUS_CODE;
    if (Status === 0) {
      status = STATUS_CODE.ERROR;
      message =
        elapsedTime <= options.overTime * 1000
          ? `请求失败，Status值为:${Status}`
          : '请求失败，接口超时';
    } else if (Status < HTTP_CODE.BAD_REQUEST) {
      status = STATUS_CODE.OK;
      if (options.handleHttpStatus && typeof options.handleHttpStatus == 'function') {
        if (options.handleHttpStatus(data)) {
          status = STATUS_CODE.OK;
        } else {
          status = STATUS_CODE.ERROR;
          message = `接口报错，报错信息为：${
            typeof response == 'object' ? JSON.stringify(response) : response
          }`;
        }
      }
    } else {
      status = STATUS_CODE.ERROR;
      message = `请求失败，Status值为:${Status}，${fromHttpStatus(Status)}`;
    }
    message = `${data.url}; ${message}`;
    return {
      url: data.url,
      time,
      status,
      elapsedTime,
      message,
      requestData: {
        httpType: type,
        method,
        data: requestData || '',
      },
      response: {
        Status,
        data: status == STATUS_CODE.ERROR ? response : null,
      },
    };
  }

// 获取加载资源信息
  export function resourceTransform(target) {
    return {
      time: getTimestamp(),
      message:
        (interceptStr(target.src, 120) || interceptStr(target.href, 120)) +
        '; 资源加载失败',
      name: target.localName,
    };
  }
  