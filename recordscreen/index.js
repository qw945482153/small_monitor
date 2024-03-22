import { handleScreen } from './recordscreen';
import { BasePlugin } from '../type';
import { EVENTTYPES } from '../comon';
import { validateOption, generateUUID, _support } from '../utils';

export default class RecordScreen extends BasePlugin {
  type="";
  recordScreentime = 10; // 默认录屏时长
  recordScreenTypeList  = [
    EVENTTYPES.ERROR,
    EVENTTYPES.UNHANDLEDREJECTION,
    EVENTTYPES.RESOURCE,
    EVENTTYPES.FETCH,
    EVENTTYPES.XHR,
  ]; // 录屏事件集合
  constructor(params = {}) {
    super(EVENTTYPES.RECORDSCREEN);
    this.type = EVENTTYPES.RECORDSCREEN;
    this.bindOptions(params);
  }
  bindOptions(params) {
    const { recordScreenTypeList, recordScreentime } = params;
    validateOption(recordScreentime, 'recordScreentime', 'number') &&
      (this.recordScreentime = recordScreentime);
    validateOption(recordScreenTypeList, 'recordScreenTypeList', 'array') &&
      (this.recordScreenTypeList = recordScreenTypeList);
  }
  core({ transportData, options }) {
    // 给公共配置上添加开启录屏的标识 和 录屏列表
    options.silentRecordScreen = true;
    options.recordScreenTypeList = this.recordScreenTypeList;
    // 添加初始的recordScreenId
    _support.recordScreenId = generateUUID();
    handleScreen(transportData, this.recordScreentime);
  }
  transform() {}
}
