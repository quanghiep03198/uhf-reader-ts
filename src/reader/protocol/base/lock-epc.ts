/**
 * Base Lock EPC command — lock a memory area of an EPC tag.
 *
 * Mirrors Python `base_lockEpc.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { hexToBytes } from '../../utils/hex-utils.js';
import { Parameter } from '../parameter.js';

/** Return-code descriptions for the lock-epc response. */
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
  9: 'Other error.',
  10: 'Label is missing.',
  11: 'Command error.',
};

/** Options for {@link MsgBaseLockEpc}. */
export interface LockEpcOptions {
  /** EPC filter parameter. */
  filter?: Parameter;
  /** Hex access password. */
  hexPassword?: string;
}

/**
 * Lock a memory area of an EPC Gen2 tag.
 */
export class MsgBaseLockEpc extends Message {
  /** Bitmask of enabled antennas. */
  antennaEnable: number;
  /** Memory area to lock. */
  area: number;
  /** Lock mode. */
  mode: number;
  /** EPC filter parameter. */
  filter: Parameter | undefined;
  /** Hex access password. */
  hexPassword: string | undefined;

  /**
   * @param antennaEnable Bitmask of enabled antennas.
   * @param area Memory area to lock.
   * @param mode Lock mode.
   * @param options Optional lock parameters.
   */
  constructor(antennaEnable: number, area: number, mode: number, options?: LockEpcOptions) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_LockEpc;
    this.antennaEnable = antennaEnable;
    this.area = area;
    this.mode = mode;
    this.filter = options?.filter;
    this.hexPassword = options?.hexPassword;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint32BE(this.antennaEnable);
    buffer.putUint8(this.area);
    buffer.putUint8(this.mode);

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
