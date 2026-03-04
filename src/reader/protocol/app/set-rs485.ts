import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Other error.',
};

export class MsgAppSetRs485 extends Message {
  /** RS485 address. */
  address: number;
  /** Baud rate index. */
  baudRate: number | undefined;

  constructor(address: number, opts?: { baudRate?: number }) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_SetRs485;
    this.address = address;
    this.baudRate = opts?.baudRate;
  }

  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint8(this.address);
    if (this.baudRate !== undefined) {
      buffer.putUint8(0x01);
      buffer.putUint8(this.baudRate);
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
