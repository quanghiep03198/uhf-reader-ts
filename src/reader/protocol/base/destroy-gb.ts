/**
 * Base Destroy GB command — permanently destroy a GB (national standard) tag.
 *
 * Mirrors Python `base_destroyGb.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { hexToBytes } from '../../utils/hex-utils.js';
import { Parameter } from '../parameter.js';

/** Return-code descriptions for the destroy-gb response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Port parameter error.',
  2: 'Filter parameter error.',
  3: 'CRC check error.',
  4: 'Underpower error.',
  5: 'Access password error.',
  6: 'Permission denied.',
  7: 'Identify failure.',
  8: 'Other error.',
  9: 'Label is missing.',
  10: 'Command error.',
};

/** Options for {@link MsgBaseDestroyGb}. */
export interface DestroyGbOptions {
  /** Filter parameter. */
  filter?: Parameter;
  /** Hex access password. */
  hexPassword?: string;
  /** Safe mark flag. */
  safeMark?: number;
}

/**
 * Permanently destroy (kill) a GB (national standard) tag.
 */
export class MsgBaseDestroyGb extends Message {
  /** Bitmask of enabled antennas. */
  antennaEnable: number;
  /** Filter parameter. */
  filter: Parameter | undefined;
  /** Hex access password. */
  hexPassword: string | undefined;
  /** Safe mark flag. */
  safeMark: number | undefined;

  /**
   * @param antennaEnable Bitmask of enabled antennas.
   * @param hexPassword Hex kill password.
   * @param options Optional destroy parameters.
   */
  constructor(antennaEnable: number, hexPassword: string, options?: DestroyGbOptions) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_DestroyGb;
    this.antennaEnable = antennaEnable;
    this.filter = options?.filter;
    this.hexPassword = options?.hexPassword ?? hexPassword;
    this.safeMark = options?.safeMark;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint32BE(this.antennaEnable);

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
