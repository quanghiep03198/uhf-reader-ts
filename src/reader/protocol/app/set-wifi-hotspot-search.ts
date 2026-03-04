import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';

const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Reader is not supported.',
};

/** Command to trigger Wi-Fi hotspot search. */
export class MsgAppSetWifiHotspotSearch extends Message {
  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_SetWifiHotspotSearch;
  }

  override pack(): void {
    super.pack();
  }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    this.rtCode = this.cData[0];
    this.rtMsg = RT_MESSAGES[this.rtCode];
  }
}
