/**
 * Get base (baseband) firmware version command / response.
 *
 * Mirrors Python `app_get_baseVersion.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Retrieves the baseband firmware version from the reader.
 */
export class MsgAppGetBaseVersion extends Message {
  /** Base firmware version string. */
  baseVersions = '';

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_GetBaseVersion;
  }

  /** @inheritdoc */
  override pack(): void {
    super.pack();
  }

  /**
   * Deserialise the data payload into the version string.
   *
   * Layout: 4 × uint8 joined with dots.
   */
  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);
    this.baseVersions =
      buffer.readUint8() + '.' + buffer.readUint8() + '.' +
      buffer.readUint8() + '.' + buffer.readUint8();
    this.rtCode = 0;
  }

  /**
   * @returns The base firmware version string.
   */
  toString(): string {
    return this.baseVersions;
  }
}
