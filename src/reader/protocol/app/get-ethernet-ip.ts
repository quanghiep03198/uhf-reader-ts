/**
 * Get Ethernet IP configuration command / response.
 *
 * Mirrors Python `app_get_ethernetIp.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Retrieves the reader's Ethernet IP configuration including
 * IP, subnet mask, gateway, and DNS settings.
 */
export class MsgAppGetEthernetIP extends Message {
  /** Auto IP mode. */
  autoIp: number | undefined = undefined;
  /** IP address. */
  ip: string | undefined = undefined;
  /** Subnet mask. */
  mask: string | undefined = undefined;
  /** Gateway address. */
  gateway: string | undefined = undefined;
  /** Primary DNS. */
  dns1: string | undefined = undefined;
  /** Secondary DNS. */
  dns2: string | undefined = undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_GetReaderIP;
  }

  /** @inheritdoc */
  override pack(): void {
    super.pack();
  }

  private readIpAddress(buffer: DynamicBuffer): string {
    return buffer.readUint8() + '.' + buffer.readUint8() + '.' +
      buffer.readUint8() + '.' + buffer.readUint8();
  }

  /**
   * Deserialise the data payload.
   *
   * Layout: autoIp (uint8) + ip (4×uint8) + mask (4×uint8) +
   * gateway (4×uint8) + dns1 (4×uint8) + dns2 (4×uint8).
   */
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

  /**
   * @returns Tuple-like string of all network settings.
   */
  toString(): string {
    return `(${this.autoIp}, ${this.ip}, ${this.mask}, ${this.gateway}, ${this.dns1}, ${this.dns2})`;
  }
}
