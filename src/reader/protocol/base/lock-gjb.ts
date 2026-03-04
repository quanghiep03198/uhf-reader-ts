/**
 * Base Lock GJB command — lock a memory area of a GJB (military standard) tag.
 *
 * Mirrors Python `base_lockGJb.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { hexToBytes } from '../../utils/hex-utils.js';
import { Parameter } from '../parameter.js';

/** Return-code descriptions for the lock-gjb response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Port parameter error.',
  2: 'Filter parameter error.',
  3: 'Lock parameter error.',
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

/** Options for {@link MsgBaseLockGJb}. */
export interface LockGJbOptions {
  /** Filter parameter. */
  filter?: Parameter;
  /** Hex access password. */
  hexPassword?: string;
  /** Safe mark flag. */
  safeMark?: number;
}

/**
 * Lock a memory area of a GJB (military standard) tag.
 */
export class MsgBaseLockGJb extends Message {
  /** Bitmask of enabled antennas. */
  antennaEnable: number;
  /** Memory area to lock. */
  area: number;
  /** Lock parameter. */
  lockParam: number;
  /** Filter parameter. */
  filter: Parameter | undefined;
  /** Hex access password. */
  hexPassword: string | undefined;
  /** Safe mark flag. */
  safeMark: number | undefined;

  /**
   * @param antennaEnable Bitmask of enabled antennas.
   * @param area Memory area to lock.
   * @param lockParam Lock parameter.
   * @param options Optional lock parameters.
   */
  constructor(
    antennaEnable: number,
    area: number,
    lockParam: number,
    options?: LockGJbOptions,
  ) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_LockGJb;
    this.antennaEnable = antennaEnable;
    this.area = area;
    this.lockParam = lockParam;
    this.filter = options?.filter;
    this.hexPassword = options?.hexPassword;
    this.safeMark = options?.safeMark;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint32BE(this.antennaEnable);
    buffer.putUint8(this.area);
    buffer.putUint8(this.lockParam);

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

    this.cData = buffer.toByteArray();
    this.dataLen = buffer.bitLength / 8;
  }

  /** @inheritdoc */
  override unPack(): void {
    if (this.cData.length) {
      this.rtCode = this.cData[0];
      this.rtMsg = RT_MESSAGES[this.rtCode];
    }
  }
}
