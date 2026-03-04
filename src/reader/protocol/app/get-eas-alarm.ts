import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/** Command to get EAS alarm configuration. */
export class MsgAppGetEasAlarm extends Message {
  /** Alarm switch. */
  alarmSwitch: number | undefined = undefined;
  /** Filter area. */
  filterArea: number | undefined = undefined;
  /** Start offset. */
  start: number | undefined = undefined;
  /** Hex content string. */
  hexContent: string | undefined = undefined;
  /** Hex mask string. */
  hexMask: string | undefined = undefined;
  /** Action on success (raw bytes). */
  actionSuccessBytes: number[] | undefined = undefined;
  /** Action on failure (raw bytes). */
  actionFailBytes: number[] | undefined = undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_GetEasAlarm;
  }

  override pack(): void {
    /* query-only message */
  }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);
    this.alarmSwitch = buffer.readUint8();
    this.filterArea = buffer.readUint8();
    this.start = buffer.readUint16BE();
    const contentLen = buffer.readUint16BE();
    if (contentLen) {
      const contentBytes = buffer.readByteArray(contentLen * 8);
      if (contentBytes) this.hexContent = bytesToHex(contentBytes);
    }
    const maskLen = buffer.readUint16BE();
    if (maskLen) {
      const maskBytes = buffer.readByteArray(maskLen * 8);
      if (maskBytes) this.hexMask = bytesToHex(maskBytes);
    }
    while (buffer.pos / 8 < this.cData.length) {
      const pid = buffer.readUint8();
      if (pid === 1) {
        const sucLen = buffer.readUint16BE();
        if (sucLen) {
          this.actionSuccessBytes = buffer.readByteArray(sucLen * 8) ?? undefined;
        }
      }
      if (pid === 2) {
        const failLen = buffer.readUint16BE();
        if (failLen) {
          this.actionFailBytes = buffer.readByteArray(failLen * 8) ?? undefined;
        }
      }
    }
    this.rtCode = 0;
  }

  /** @returns String representation. */
  toString(): string {
    return `(${this.alarmSwitch}, ${this.filterArea}, ${this.start}, ${this.hexContent}, ${this.hexMask})`;
  }
}
