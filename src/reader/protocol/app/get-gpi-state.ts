import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

export class MsgAppGetGpiState extends Message {
  /** GPI port states keyed by port index. */
  dicGpi: Map<number, number> = new Map();

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_GetGpiState;
  }

  override pack(): void { super.pack(); }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);
    const count = Math.floor(buffer.bitLength / 16);
    for (let i = 0; i < count; i++) {
      const gpiIndex = buffer.readUint8();
      this.dicGpi.set(gpiIndex, buffer.readUint8());
    }
    this.rtCode = 0;
  }

  toString(): string {
    return JSON.stringify(Object.fromEntries(this.dicGpi));
  }
}
