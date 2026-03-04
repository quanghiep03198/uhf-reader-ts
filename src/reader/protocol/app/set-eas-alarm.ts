import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { hexToBytes } from '../../utils/hex-utils.js';

const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Set failure.',
};

/** Object that can serialise itself to bytes. */
export interface Serialisable {
  toBytes(): number[];
}

/** Options for EAS alarm configuration. */
export interface EasAlarmOptions {
  actionSuccess?: Serialisable;
  actionFail?: Serialisable;
}

/** Command to set EAS alarm configuration. */
export class MsgAppSetEasAlarm extends Message {
  /** Alarm switch. */
  alarmSwitch: number;
  /** Filter data area. */
  filterData: number;
  /** Start offset. */
  start: number;
  /** Hex content string. */
  hexContent: string;
  /** Hex mask string. */
  hexMask: string;
  /** Action on success. */
  actionSuccess: Serialisable | undefined;
  /** Action on failure. */
  actionFail: Serialisable | undefined;

  constructor(
    alarmSwitch: number,
    filterData: number,
    start: number,
    hexContent: string,
    hexMask: string,
    opts?: EasAlarmOptions,
  ) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_SetEasAlarm;
    this.alarmSwitch = alarmSwitch;
    this.filterData = filterData;
    this.start = start;
    this.hexContent = hexContent;
    this.hexMask = hexMask;
    this.actionSuccess = opts?.actionSuccess;
    this.actionFail = opts?.actionFail;
  }

  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint8(this.alarmSwitch);
    buffer.putUint8(this.filterData);
    buffer.putUint16BE(this.start);
    if (this.hexContent) {
      const contentBytes = hexToBytes(this.hexContent);
      buffer.putUint16BE(contentBytes.length);
      buffer.putBytes(contentBytes);
    }
    if (this.hexMask) {
      const maskBytes = hexToBytes(this.hexMask);
      buffer.putUint16BE(maskBytes.length);
      buffer.putBytes(maskBytes);
    }
    if (this.actionSuccess !== undefined) {
      buffer.putUint8(0x01);
      const sucBytes = this.actionSuccess.toBytes();
      buffer.putUint16BE(sucBytes.length);
      buffer.putBytes(sucBytes);
    }
    if (this.actionFail !== undefined) {
      buffer.putUint8(0x02);
      const failBytes = this.actionFail.toBytes();
      buffer.putUint16BE(failBytes.length);
      buffer.putBytes(failBytes);
    }
    this.cData = buffer.toByteArray();
    this.dataLen = buffer.bitLength / 8;
  }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    this.rtCode = this.cData[0];
    this.rtMsg = RT_MESSAGES[this.rtCode];
  }
}
