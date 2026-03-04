import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'RTC setup failed.',
};

export class MsgAppSetReaderTime extends Message {
  /** Time in seconds (Unix timestamp). */
  seconds: number;

  constructor(seconds: number) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_SetReaderTime;
    this.seconds = seconds;
  }

  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint32BE(this.seconds);
    buffer.putUint32BE(0);
    this.cData = buffer.toByteArray();
    this.dataLen = buffer.bitLength / 8;
  }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    this.rtCode = this.cData[0];
    this.rtMsg = RT_MESSAGES[this.rtCode];
  }
}
