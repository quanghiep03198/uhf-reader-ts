/**
 * Base Destroy EPC command — permanently destroy an EPC tag.
 *
 * Mirrors Python `base_destroyEpc.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { hexToBytes } from '../../utils/hex-utils.js';
import { Parameter } from '../parameter.js';

/** Return-code descriptions for the destroy-epc response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Port parameter error.',
  2: 'Filter parameter error.',
  3: 'CRC check error.',
  4: 'Underpower error.',
  5: 'Access password error.',
  6: 'Other error.',
  7: 'Label is missing.',
  8: 'Command error.',
};

/** Options for {@link MsgBaseDestroyEpc}. */
export interface DestroyEpcOptions {
  /** EPC filter parameter. */
  filter?: Parameter;
}

/**
 * Permanently destroy (kill) an EPC Gen2 tag.
 */
export class MsgBaseDestroyEpc extends Message {
  /** Bitmask of enabled antennas. */
  antennaEnable: number;
  /** Hex kill password. */
  hexPassword: string;
  /** EPC filter parameter. */
  filter: Parameter | undefined;

  /**
   * @param antennaEnable Bitmask of enabled antennas.
   * @param hexPassword Hex kill password.
   * @param options Optional destroy parameters.
   */
  constructor(antennaEnable: number, hexPassword: string, options?: DestroyEpcOptions) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_DestroyEpc;
    this.antennaEnable = antennaEnable;
    this.hexPassword = hexPassword;
    this.filter = options?.filter;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint32BE(this.antennaEnable);
    buffer.putBytes(hexToBytes(this.hexPassword));

    if (this.filter !== undefined) {
      buffer.putUint8(0x01);
      const filterBytes = this.filter.toBytes();
      buffer.putUint16BE(filterBytes.length);
      buffer.putBytes(filterBytes);
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
