/**
 * Base Get Frequency Range command — query the current frequency band.
 *
 * Mirrors Python `base_get_freRange.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Query the current frequency range (band) of the reader.
 */
export class MsgBaseGetFreqRange extends Message {
  /** Frequency range index. */
  freqRangeIndex: number | undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_GetFreqRange;
  }

  /** @inheritdoc */
  override pack(): void {
    super.pack();
  }

  /** @inheritdoc */
  override unPack(): void {
    if (this.cData.length) {
      const hex = bytesToHex(this.cData);
      const buffer = new DynamicBuffer('0x' + hex);
      this.freqRangeIndex = buffer.readUint8();
      this.rtCode = 0;
    }
  }
}
