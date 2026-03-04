import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Set Fail.',
};

/** Options for setting a Wi-Fi hotspot. */
export interface WifiHotspotOptions {
  password?: string;
  certificationType?: number;
  encryptionAlgorithm?: number;
}

/** Command to set Wi-Fi hotspot configuration. */
export class MsgAppSetWifiHotspot extends Message {
  /** Wi-Fi hotspot name. */
  hotspotName: string;
  /** Wi-Fi password. */
  password: string | undefined;
  /** Certification type. */
  certificationType: number;
  /** Encryption algorithm. */
  encryptionAlgorithm: number;

  constructor(hotspotName: string, opts?: WifiHotspotOptions) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_SetWifiHotspot;
    this.hotspotName = hotspotName;
    this.password = opts?.password;
    this.certificationType = opts?.certificationType ?? 1;
    this.encryptionAlgorithm = opts?.encryptionAlgorithm ?? 0;
  }

  override pack(): void {
    const buffer = new DynamicBuffer();
    if (this.hotspotName) {
      const nameBytes = Array.from(Buffer.from(this.hotspotName, 'utf-8'));
      buffer.putUint16BE(nameBytes.length);
      buffer.putBytes(nameBytes);
    }
    if (this.password !== undefined) {
      buffer.putUint8(0x01);
      const pwdBytes = Array.from(Buffer.from(this.password, 'utf-8'));
      buffer.putUint16BE(pwdBytes.length);
      buffer.putBytes(pwdBytes);
    }
    if (this.certificationType !== undefined) {
      buffer.putUint8(0x02);
      buffer.putUint8(this.certificationType);
    }
    if (this.encryptionAlgorithm !== undefined) {
      buffer.putUint8(0x03);
      buffer.putUint8(this.encryptionAlgorithm);
    }
    this.cData = buffer.toByteArray();
    this.dataLen = buffer.bitLength / 8;
  }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    this.rtCode = this.cData[0];
    this.rtMsg = RT_MESSAGES[this.rtCode];
  }
}
