import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';

export class MsgAppReset extends Message {
  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_Reset;
  }

  override pack(): void { super.pack(); }

  override unPack(): void { /* no response data */ }
}
