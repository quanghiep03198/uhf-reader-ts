import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Fail',
};

export interface UdpParamOptions {
  ip?: string;
  port?: number;
  period?: number;
}

export class MsgAppSetUdpParam extends Message {
  /** UDP on/off switch. */
  onOrOff: number;
  /** UDP server IP address. */
  ip: string | undefined;
  /** UDP port. */
  port: number | undefined;
  /** Report period. */
  period: number | undefined;

  constructor(onOrOff: number, opts?: UdpParamOptions) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_SetUdpParam;
    this.onOrOff = onOrOff;
    this.ip = opts?.ip;
    this.port = opts?.port;
    this.period = opts?.period;
  }

  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint8(this.onOrOff);
    if (this.onOrOff === 1) {
      if (this.ip !== undefined) {
        buffer.putUint8(0x01);
        for (const octet of this.ip.split('.')) {
          buffer.putUint8(Number(octet));
        }
      }
      if (this.port !== undefined) {
        buffer.putUint8(0x02);
        buffer.putUint16BE(this.port);
      }
      if (this.period !== undefined) {
        buffer.putUint8(0x03);
        buffer.putUint16BE(this.period);
      }
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
