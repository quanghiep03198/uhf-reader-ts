import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex, listToAscii } from '../../utils/hex-utils.js';

export class MsgAppGetHttpParam extends Message {
  /** HTTP report on/off state. */
  onOrOff: number | undefined = undefined;
  /** Report period. */
  period: number | undefined = undefined;
  /** Report format. */
  formats: number | undefined = undefined;
  /** Timeout. */
  timeout: number | undefined = undefined;
  /** Open cache flag. */
  openCache: number | undefined = undefined;
  /** HTTP report address URL. */
  reportAddress: string | undefined = undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_GetHttpParam;
  }

  override pack(): void { super.pack(); }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);
    this.onOrOff = buffer.readUint8();
    this.period = buffer.readUint16BE();
    this.formats = buffer.readUint8();
    this.timeout = buffer.readUint16BE();
    this.openCache = buffer.readUint8();
    while (buffer.pos / 8 < this.cData.length) {
      const pid = buffer.readUint8();
      if (pid === 1) {
        const reLen = buffer.readUint16BE();
        if (reLen) {
          const bytes = buffer.readByteArray(reLen * 8);
          if (bytes) this.reportAddress = listToAscii(bytes);
        }
      }
    }
    this.rtCode = 0;
  }

  toString(): string {
    return `(${this.onOrOff}, ${this.period}, ${this.timeout}, ${this.reportAddress})`;
  }
}
