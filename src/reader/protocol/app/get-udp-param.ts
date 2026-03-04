import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

export class MsgAppGetUdpParam extends Message {
  /** UDP on/off state. */
  onOrOff: number | undefined = undefined;
  /** UDP server IP. */
  ip: string | undefined = undefined;
  /** UDP port. */
  port: number | undefined = undefined;
  /** Report period. */
  period: number | undefined = undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_GetUdpParam;
  }

  override pack(): void { super.pack(); }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);
    this.onOrOff = buffer.readUint8();
    this.ip = buffer.readUint8() + '.' + buffer.readUint8() + '.' + buffer.readUint8() + '.' + buffer.readUint8();
    this.port = buffer.readUint16BE();
    this.period = buffer.readUint16BE();
    this.rtCode = 0;
  }

  toString(): string {
    return `(${this.onOrOff}, ${this.ip}, ${this.port}, ${this.period})`;
  }
}
