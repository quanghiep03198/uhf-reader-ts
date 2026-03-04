/**
 * Base Set Residence Time command — configure antenna/frequency dwell times.
 *
 * Mirrors Python `base_set_residenceTime.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

/** Return-code descriptions for the set-residence-time response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Parameter error.',
  2: 'Other error.',
  3: 'Save failure.',
};

/** Options for {@link MsgBaseSetResidenceTime}. */
export interface SetResidenceTimeOptions {
  /** Antenna lingering / dwell time (ms). */
  antLingeringTime?: number;
  /** Frequency lingering / dwell time (ms). */
  freLingeringTime?: number;
}

/**
 * Configure the antenna and frequency dwell (lingering) times.
 */
export class MsgBaseSetResidenceTime extends Message {
  /** Antenna lingering / dwell time (ms). */
  antLingeringTime: number | undefined;
  /** Frequency lingering / dwell time (ms). */
  freLingeringTime: number | undefined;

  /**
   * @param options Residence time configuration.
   */
  constructor(options: SetResidenceTimeOptions = {}) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_SetResidenceTime;
    this.antLingeringTime = options.antLingeringTime;
    this.freLingeringTime = options.freLingeringTime;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    if (this.antLingeringTime !== undefined) {
      buffer.putUint8(0x01);
      buffer.putUint16BE(this.antLingeringTime);
    }
    if (this.freLingeringTime !== undefined) {
      buffer.putUint8(0x02);
      buffer.putUint16BE(this.freLingeringTime);
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
