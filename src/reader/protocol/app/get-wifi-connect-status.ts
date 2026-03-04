import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex, listToAscii } from '../../utils/hex-utils.js';

/** Command to get Wi-Fi connection status. */
export class MsgAppGetWifiConnectStatus extends Message {
  /** Connected hotspot name. */
  hotspotName: string | undefined = undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_GetWifiConnectStatus;
  }

  override pack(): void {
    super.pack();
  }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);
    const hnLen = buffer.readUint16BE();
    if (hnLen) {
      const bytes = buffer.readByteArray(hnLen * 8);
      if (bytes) this.hotspotName = listToAscii(bytes);
    }
    this.rtCode = 0;
  }

  /** @returns String representation. */
  toString(): string {
    return String(this.hotspotName);
  }
}
