/**
 * Get reader information command / response.
 *
 * Mirrors Python `app_get_readerInfo.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';
import { listToAscii } from '../../utils/hex-utils.js';
import { secondToDhms } from '../../utils/date-utils.js';

/**
 * Retrieves general reader information such as serial number,
 * firmware versions, and compile times.
 */
export class MsgAppGetReaderInfo extends Message {
  /** Reader serial number. */
  readerSerialNumber = '';
  /** Power-on time formatted string. */
  powerOnTime = '';
  /** Baseband compile time. */
  baseCompileTime = '';
  /** Application firmware version. */
  appVersions = '';
  /** System firmware version. */
  systemVersions = '';
  /** Application compile time. */
  appCompileTime = '';

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_GetReaderInfo;
  }

  /** @inheritdoc */
  override pack(): void {
    super.pack();
  }

  /**
   * Deserialise the data payload into typed properties.
   *
   * Layout: snLen (uint16) + sn (bytes) + powerOnTime (uint32) +
   * btLen (uint16) + bt (bytes) + TLV blocks (pid 1–3).
   */
  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);
    const snLen = buffer.readUint16BE();
    const sn = buffer.readByteArray(snLen * 8);
    if (sn) this.readerSerialNumber = listToAscii(sn);
    this.powerOnTime = secondToDhms(buffer.readUint32BE());
    const btLen = buffer.readUint16BE();
    const bt = buffer.readByteArray(btLen * 8);
    if (bt) this.baseCompileTime = listToAscii(bt);
    while (buffer.pos / 8 < this.cData.length) {
      const pid = buffer.readUint8();
      if (pid === 1) {
        this.appVersions =
          buffer.readUint8() + '.' + buffer.readUint8() + '.' +
          buffer.readUint8() + '.' + buffer.readUint8();
      } else if (pid === 2) {
        const svLen = buffer.readUint16BE();
        const sv = buffer.readByteArray(svLen * 8);
        if (sv) this.systemVersions = listToAscii(sv);
      } else if (pid === 3) {
        const atLen = buffer.readUint16BE();
        const at = buffer.readByteArray(atLen * 8);
        if (at) this.appCompileTime = listToAscii(at);
      }
    }
    this.rtCode = 0;
  }

  /**
   * String representation of reader info.
   *
   * @returns Tuple-like string of all fields.
   */
  toString(): string {
    return `(${this.readerSerialNumber}, ${this.powerOnTime}, ${this.baseCompileTime.replace(/\0/g, '')}, ${this.appVersions}, ${this.systemVersions}, ${this.appCompileTime})`;
  }
}
