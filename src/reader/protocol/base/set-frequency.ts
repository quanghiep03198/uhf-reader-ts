/**
 * Base Set Frequency command — set individual frequency points.
 *
 * Mirrors Python `base_set_frequency.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

/** Return-code descriptions for the set-frequency response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'The channel number is not in the current frequency band.',
  2: 'Invalid frequency points.',
  3: 'Other error.',
  4: 'Save failure.',
};

/** Options for {@link MsgBaseSetFrequency}. */
export interface SetFrequencyOptions {
  /** List of frequency cursor indices. */
  listFreqCursor?: number[];
  /** Whether to save across power-down. */
  powerDownSave?: number;
}

/**
 * Set frequency hopping mode and individual frequency points.
 */
export class MsgBaseSetFrequency extends Message {
  /** Automatic frequency hopping flag (0 = manual, 1 = auto). */
  automatically: number;
  /** List of frequency cursor indices (used when automatically === 0). */
  listFreqCursor: number[];
  /** Power-down save flag. */
  powerDownSave: number | undefined;

  /**
   * @param automatically Automatic frequency hopping flag.
   * @param options Optional frequency configuration.
   */
  constructor(automatically: number, options?: SetFrequencyOptions) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_SetFrequency;
    this.automatically = automatically;
    this.listFreqCursor = options?.listFreqCursor ?? [];
    this.powerDownSave = options?.powerDownSave;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint8(this.automatically);

    if (this.automatically === 0 && this.listFreqCursor.length) {
      buffer.putUint8(0x01);
      buffer.putUint16BE(this.listFreqCursor.length);
      for (const freq of this.listFreqCursor) {
        buffer.putUint8(freq);
      }
    }
    if (this.powerDownSave !== undefined) {
      buffer.putUint8(0x02);
      buffer.putUint8(this.powerDownSave);
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
