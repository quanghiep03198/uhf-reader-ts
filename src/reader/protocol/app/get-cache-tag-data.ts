import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';

const RT_MESSAGES: Record<number, string> = {
  0: 'Have data.',
  1: 'No data.',
  2: 'End of data return.',
};

export class MsgAppGetCacheTagData extends Message {
  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_GetCacheTagData;
  }

  override pack(): void { super.pack(); }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    this.rtCode = this.cData[0];
    this.rtMsg = RT_MESSAGES[this.rtCode];
  }
}
