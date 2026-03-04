import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

export class MsgAppGetWiegand extends Message {
  /** Wiegand switch (on/off). */
  wiegandSwitch: number | undefined = undefined;
  /** Wiegand format. */
  wiegandFormat: number | undefined = undefined;
  /** Wiegand content. */
  wiegandContent: number | undefined = undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_GetWigan;
  }

  override pack(): void { super.pack(); }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);
    this.wiegandSwitch = buffer.readUint8();
    this.wiegandFormat = buffer.readUint8();
    this.wiegandContent = buffer.readUint8();
    this.rtCode = 0;
  }

  toString(): string {
    return `(${this.wiegandSwitch}, ${this.wiegandFormat}, ${this.wiegandContent})`;
  }
}
