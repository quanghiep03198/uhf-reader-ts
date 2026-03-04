import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';
import { secondFormat } from '../../utils/date-utils.js';

export class MsgAppGetReaderTime extends Message {
  /** Time in seconds. */
  seconds: number | undefined = undefined;
  /** Formatted time string. */
  formatTime: string | undefined = undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_GetReaderTime;
  }

  override pack(): void { super.pack(); }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);
    const second = buffer.readUint32BE();
    const mic = buffer.readUint32BE();
    const wholeSeconds = Math.floor(mic / 1_000_000);
    this.seconds = second + wholeSeconds;
    this.formatTime = secondFormat(this.seconds);
    this.rtCode = 0;
  }

  toString(): string {
    return String(this.seconds);
  }
}
