/**
 * Base Set Frequency Range command — set the frequency band.
 *
 * Mirrors Python `base_set_freRange.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

/** Return-code descriptions for the set-freq-range response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Frequency parameter reader is not supported.',
  2: 'Save failure.',
};

/**
 * Set the frequency range (band) of the reader.
 */
export class MsgBaseSetFreqRange extends Message {
  /** Frequency range index. */
  freqRangeIndex: number;

  /**
   * @param freqRangeIndex Frequency range index to set.
   */
  constructor(freqRangeIndex: number) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_SetFreqRange;
    this.freqRangeIndex = freqRangeIndex;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint8(this.freqRangeIndex);
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
