import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Set Fail.',
};

/** Command to set the Wi-Fi switch state. */
export class MsgAppSetWifiSwitch extends Message {
  /** Wi-Fi switch (0 = off, 1 = on). */
  wifiSwitch: number;

  constructor(wifiSwitch: number) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_SetWifiOnOff;
    this.wifiSwitch = wifiSwitch;
  }

  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint8(this.wifiSwitch);
    this.cData = buffer.toByteArray();
    this.dataLen = buffer.bitLength / 8;
  }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    this.rtCode = this.cData[0];
    this.rtMsg = RT_MESSAGES[this.rtCode];
  }
}
