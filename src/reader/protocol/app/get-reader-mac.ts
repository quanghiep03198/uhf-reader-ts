/**
 * Get reader MAC address command / response.
 *
 * Mirrors Python `app_get_readerMac.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Retrieves the reader's Ethernet MAC address.
 */
export class MsgAppGetReaderMac extends Message {
  /** MAC address string (e.g. "aa-bb-cc-dd-ee-ff"). */
  mac: string | undefined = undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_GetReaderMac;
  }

  /** @inheritdoc */
  override pack(): void {
    super.pack();
  }

  /**
   * Deserialise the data payload.
   *
   * Layout: 6 × uint8 formatted as hex pairs joined by dashes.
   */
  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    const hexData = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hexData);
    const parts: string[] = [];
    for (let i = 0; i < 6; i++) {
      parts.push(buffer.readUint8().toString(16).padStart(2, '0'));
    }
    this.mac = parts.join('-');
    this.rtCode = 0;
  }

  /**
   * @returns The MAC address string.
   */
  toString(): string {
    return this.mac ?? '';
  }
}
