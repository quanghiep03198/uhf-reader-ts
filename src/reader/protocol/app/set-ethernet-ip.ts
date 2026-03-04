/**
 * Set Ethernet IP configuration command / response.
 *
 * Mirrors Python `app_set_ethernetIp.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'ReaderIp parameter error.',
};

/** Options for setting the Ethernet IP configuration. */
export interface EthernetIpOptions {
  ip?: string;
  mask?: string;
  gateway?: string;
  dns1?: string;
  dns2?: string;
}

/**
 * Configures the reader's Ethernet IP address, subnet mask,
 * gateway, and DNS settings.
 */
export class MsgAppSetEthernetIP extends Message {
  /** Auto IP flag (0 = DHCP, 1 = static). */
  autoIp: number;
  /** Static IP address. */
  ip: string | undefined;
  /** Subnet mask. */
  mask: string | undefined;
  /** Gateway address. */
  gateway: string | undefined;
  /** Primary DNS. */
  dns1: string | undefined;
  /** Secondary DNS. */
  dns2: string | undefined;

  constructor(autoIp: number, opts?: EthernetIpOptions) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_SetReaderIP;
    this.autoIp = autoIp;
    this.ip = opts?.ip;
    this.mask = opts?.mask;
    this.gateway = opts?.gateway;
    this.dns1 = opts?.dns1;
    this.dns2 = opts?.dns2;
  }

  private packIpField(buffer: DynamicBuffer, tag: number, addr: string): void {
    buffer.putUint8(tag);
    for (const octet of addr.split('.')) {
      buffer.putUint8(Number(octet));
    }
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint8(this.autoIp);
    if (this.autoIp === 1) {
      if (this.ip !== undefined) this.packIpField(buffer, 0x01, this.ip);
      if (this.mask !== undefined) this.packIpField(buffer, 0x02, this.mask);
      if (this.gateway !== undefined) this.packIpField(buffer, 0x03, this.gateway);
      if (this.dns1 !== undefined) this.packIpField(buffer, 0x04, this.dns1);
      if (this.dns2 !== undefined) this.packIpField(buffer, 0x05, this.dns2);
    }
    this.cData = buffer.toByteArray();
    this.dataLen = buffer.bitLength / 8;
  }

  /** @inheritdoc */
  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    this.rtCode = this.cData[0];
    this.rtMsg = RT_MESSAGES[this.rtCode];
  }
}
