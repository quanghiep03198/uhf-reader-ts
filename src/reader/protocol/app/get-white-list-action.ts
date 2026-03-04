import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

export class MsgAppGetWhiteListAction extends Message {
  /** Relay number. */
  relay: number | undefined = undefined;
  /** Relay close time in ms. */
  relayCloseTime: number | undefined = undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_GetWhiteListActionParam;
  }

  override pack(): void { super.pack(); }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);
    this.relay = buffer.readUint8();
    this.relayCloseTime = buffer.readUint16BE();
    this.rtCode = 0;
  }

  toString(): string {
    return `(${this.relay}, ${this.relayCloseTime})`;
  }
}
