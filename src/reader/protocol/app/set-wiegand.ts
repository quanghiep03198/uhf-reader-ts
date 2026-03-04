import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Reader hardware is not supported Wiegand port.',
  2: 'Wiegand communication format not supported by reader.',
  3: 'Data content not supported by the reader.',
};

export class MsgAppSetWiegand extends Message {
  /** Wiegand switch (on/off). */
  wiegandSwitch: number;
  /** Wiegand format. */
  wiegandFormat: number;
  /** Wiegand content. */
  wiegandContent: number;

  constructor(wiegandSwitch: number, wiegandFormat: number, wiegandContent: number) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_SetWigan;
    this.wiegandSwitch = wiegandSwitch;
    this.wiegandFormat = wiegandFormat;
    this.wiegandContent = wiegandContent;
  }

  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint8(this.wiegandSwitch);
    buffer.putUint8(this.wiegandFormat);
    buffer.putUint8(this.wiegandContent);
    this.cData = buffer.toByteArray();
    this.dataLen = buffer.bitLength / 8;
  }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    this.rtCode = this.cData[0];
    this.rtMsg = RT_MESSAGES[this.rtCode];
  }
}
