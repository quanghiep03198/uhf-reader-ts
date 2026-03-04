/**
 * Base Write 6B command — write data to an ISO 18000-6B tag.
 *
 * Mirrors Python `base_write6b.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { hexToBytes, bytesToHex } from '../../utils/hex-utils.js';

/** Return-code descriptions for the write-6b response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Port parameter error.',
  2: 'Write parameter error.',
  3: 'Other error.',
};

/**
 * Write data to an ISO 18000-6B tag.
 */
export class MsgBaseWrite6b extends Message {
  /** Bitmask of enabled antennas. */
  antennaEnable: number;
  /** Hex TID to match. */
  hexMatchTid: string;
  /** Start byte address. */
  start: number;
  /** Hex string of data to write. */
  hexWriteData: string;
  /** Error index on partial-write failure. */
  errorIndex: number | undefined;

  /**
   * @param antennaEnable Bitmask of enabled antennas.
   * @param hexMatchTid Hex TID to match.
   * @param start Start byte address.
   * @param hexWriteData Hex string of data to write.
   */
  constructor(antennaEnable: number, hexMatchTid: string, start: number, hexWriteData: string) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_Write6b;
    this.antennaEnable = antennaEnable;
    this.hexMatchTid = hexMatchTid;
    this.start = start;
    this.hexWriteData = hexWriteData;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint32BE(this.antennaEnable);
    buffer.putBytes(hexToBytes(this.hexMatchTid));
    buffer.putUint8(this.start);

    if (this.hexWriteData) {
      const dataBytes = hexToBytes(this.hexWriteData);
      buffer.putUint16BE(dataBytes.length);
      buffer.putBytes(dataBytes);
    }

    this.cData = buffer.toByteArray();
    this.dataLen = buffer.bitLength / 8;
  }

  /** @inheritdoc */
  override unPack(): void {
    if (this.cData.length) {
      this.rtCode = this.cData[0];
      this.rtMsg = RT_MESSAGES[this.rtCode];

      if (this.cData.length > 1) {
        const errBuffer = new DynamicBuffer('0x' + bytesToHex(this.cData));
        errBuffer.pos = 8;
        if (errBuffer.readUint8() === 1) {
          this.errorIndex = errBuffer.readUint8();
        }
      }
    }
  }
}
