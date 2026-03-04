import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Fail',
};

export interface HttpParamOptions {
  formats?: number;
  openCache?: number;
  reportAddress?: string;
}

export class MsgAppSetHttpParam extends Message {
  /** HTTP report on/off. */
  onOrOff: number;
  /** Report period. */
  period: number;
  /** Report format. */
  formats: number;
  /** Timeout in ms. */
  timeout: number;
  /** Open cache flag. */
  openCache: number;
  /** HTTP report address URL. */
  reportAddress: string | undefined;

  constructor(onOrOff: number, period: number, timeout: number, opts?: HttpParamOptions) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_SetHttpParam;
    this.onOrOff = onOrOff;
    this.period = period;
    this.timeout = timeout;
    this.formats = opts?.formats ?? 0;
    this.openCache = opts?.openCache ?? 0;
    this.reportAddress = opts?.reportAddress;
  }

  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint8(this.onOrOff);
    buffer.putUint16BE(this.period);
    buffer.putUint8(this.formats);
    buffer.putUint16BE(this.timeout);
    buffer.putUint8(this.openCache);
    if (this.reportAddress !== undefined) {
      buffer.putUint8(0x01);
      const encoded = Array.from(Buffer.from(this.reportAddress, 'utf-8'));
      buffer.putUint16BE(encoded.length);
      buffer.putBytes(encoded);
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
