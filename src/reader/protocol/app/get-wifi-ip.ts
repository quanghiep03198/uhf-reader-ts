import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/** Command to get Wi-Fi IP configuration. */
export class MsgAppGetWifiIp extends Message {
  /** Hotspot ID for query. */
  hotId: number;
  /** Auto IP mode. */
  autoIp: number | undefined = undefined;
  /** IP address. */
  ip: string | undefined = undefined;
  /** Subnet mask. */
  mask: string | undefined = undefined;
  /** Gateway. */
  gateway: string | undefined = undefined;
  /** Primary DNS. */
  dns1: string | undefined = undefined;
  /** Secondary DNS. */
  dns2: string | undefined = undefined;

  constructor(opts?: { hotId?: number }) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_GetWifiIp;
    this.hotId = opts?.hotId ?? 0;
  }

  override pack(): void {
    const buffer = new DynamicBuffer();
    if (this.hotId !== undefined) {
      buffer.putUint8(0x01);
      buffer.putUint32BE(this.hotId);
    }
    this.cData = buffer.toByteArray();
    this.dataLen = buffer.bitLength / 8;
  }

  private readIpAddress(buffer: DynamicBuffer): string {
    return buffer.readUint8() + '.' + buffer.readUint8() + '.' + buffer.readUint8() + '.' + buffer.readUint8();
  }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);
    this.autoIp = buffer.readUint8();
    this.ip = this.readIpAddress(buffer);
    this.mask = this.readIpAddress(buffer);
    this.gateway = this.readIpAddress(buffer);
    this.dns1 = this.readIpAddress(buffer);
    this.dns2 = this.readIpAddress(buffer);
    this.rtCode = 0;
  }

  /** @returns String representation. */
  toString(): string {
    return `(${this.autoIp}, ${this.ip}, ${this.mask}, ${this.gateway}, ${this.dns1}, ${this.dns2})`;
  }
}
