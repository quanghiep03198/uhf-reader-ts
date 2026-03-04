import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/** Command to get the Wi-Fi switch state. */
export class MsgAppGetWifiSwitch extends Message {
  /** Wi-Fi switch state. */
  wifiSwitch: number | undefined = undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_GetWifiOnOff;
  }

  override pack(): void {
    super.pack();
  }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);
    this.wifiSwitch = buffer.readUint8();
    this.rtCode = 0;
  }

  /** @returns String representation. */
  toString(): string {
    return String(this.wifiSwitch);
  }
}
