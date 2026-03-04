/**
 * Base Write GJB command — write data to a GJB (military standard) tag.
 *
 * Mirrors Python `base_writeGJb.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { hexToBytes, bytesToHex } from '../../utils/hex-utils.js';
import { Parameter } from '../parameter.js';

/** Return-code descriptions for the write-gjb response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Port parameter error.',
  2: 'Filter parameter error.',
  3: 'Write parameter error.',
  4: 'CRC check error.',
  5: 'Underpower error.',
  6: 'Data area overflow.',
  7: 'Data area is locked.',
  8: 'Access password error.',
  9: 'Permission denied.',
  10: 'Identify failure.',
  11: 'Other error.',
  12: 'Label is missing.',
  13: 'Command error.',
};

/** Options for {@link MsgBaseWriteGJb}. */
export interface WriteGJbOptions {
  /** Filter parameter. */
  filter?: Parameter;
  /** Hex access password. */
  hexPassword?: string;
  /** Safe mark flag. */
  safeMark?: number;
  /** Stay carrier wave flag. */
  stayCarrierWave?: number;
}

/**
 * Write data to a GJB (military standard) tag.
 */
export class MsgBaseWriteGJb extends Message {
  /** Bitmask of enabled antennas. */
  antennaEnable: number;
  /** Memory area to write. */
  area: number;
  /** Start word address. */
  start: number;
  /** Hex string of data to write. */
  hexWriteData: string;
  /** Filter parameter. */
  filter: Parameter | undefined;
  /** Hex access password. */
  hexPassword: string | undefined;
  /** Safe mark flag. */
  safeMark: number | undefined;
  /** Stay carrier wave flag. */
  stayCarrierWave: number | undefined;
  /** Error index on partial-write failure. */
  errorIndex: number | undefined;

  /**
   * @param antennaEnable Bitmask of enabled antennas.
   * @param area Memory area to write.
   * @param start Start word address.
   * @param hexWriteData Hex string of data to write.
   * @param options Optional write parameters.
   */
  constructor(
    antennaEnable: number,
    area: number,
    start: number,
    hexWriteData: string,
    options?: WriteGJbOptions,
  ) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_WriteGJb;
    this.antennaEnable = antennaEnable;
    this.area = area;
    this.start = start;
    this.hexWriteData = hexWriteData;
    this.filter = options?.filter;
    this.hexPassword = options?.hexPassword;
    this.safeMark = options?.safeMark;
    this.stayCarrierWave = options?.stayCarrierWave;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint32BE(this.antennaEnable);
    buffer.putUint8(this.area);
    buffer.putUint16BE(this.start);

    if (this.hexWriteData) {
      const dataBytes = hexToBytes(this.hexWriteData);
      buffer.putUint16BE(dataBytes.length);
      buffer.putBytes(dataBytes);
    }
    if (this.filter !== undefined) {
      buffer.putUint8(0x01);
      const filterBytes = this.filter.toBytes();
      buffer.putUint16BE(filterBytes.length);
      buffer.putBytes(filterBytes);
    }
    if (this.hexPassword !== undefined) {
      buffer.putUint8(0x02);
      buffer.putBytes(hexToBytes(this.hexPassword));
    }
    if (this.safeMark !== undefined) {
      buffer.putUint8(0x03);
      buffer.putUint8(this.safeMark);
    }
    if (this.stayCarrierWave !== undefined) {
      buffer.putUint8(0x05);
      buffer.putUint8(this.stayCarrierWave);
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
          this.errorIndex = errBuffer.readUint16BE();
        }
      }
    }
  }
}
