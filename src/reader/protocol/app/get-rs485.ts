import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

export class MsgAppGetRs485 extends Message {
  /** RS485 address. */
  address: number | undefined = undefined;
  /** Baud rate index. */
  baudRate: number | undefined = undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_GetRs485;
  }

  override pack(): void { super.pack(); }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);
    this.address = buffer.readUint8();
    this.baudRate = buffer.readUint8();
    this.rtCode = 0;
  }

  toString(): string {
    return `(${this.address}, ${this.baudRate})`;
  }
}
