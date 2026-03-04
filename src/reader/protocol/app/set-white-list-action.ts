import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Set Fail.',
};

export class MsgAppSetWhiteListAction extends Message {
  /** Relay number. */
  relay: number;
  /** Relay close time in ms. */
  relayCloseTime: number;

  constructor(relay: number, relayCloseTime: number) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_SetWhiteListActionParam;
    this.relay = relay;
    this.relayCloseTime = relayCloseTime;
  }

  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint8(this.relay);
    buffer.putUint16BE(this.relayCloseTime);
    this.cData = buffer.toByteArray();
    this.dataLen = buffer.bitLength / 8;
  }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    this.rtCode = this.cData[0];
    this.rtMsg = RT_MESSAGES[this.rtCode];
  }
}
