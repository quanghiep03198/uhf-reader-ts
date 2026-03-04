/**
 * Base Set Auto-Dormancy command — configure auto-dormancy settings.
 *
 * Mirrors Python `base_set_autoDormancy.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

/** Return-code descriptions for the set-auto-dormancy response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Parameter error.',
  2: 'Other error.',
  3: 'Save failure.',
};

/** Options for {@link MsgBaseSetAutoDormancy}. */
export interface SetAutoDormancyOptions {
  /** Idle time before dormancy (seconds). */
  freeTime?: number;
}

/**
 * Enable or disable auto-dormancy and set idle time.
 */
export class MsgBaseSetAutoDormancy extends Message {
  /** Auto-dormancy on/off (1 = on, 0 = off). */
  onOff: number;
  /** Idle time before dormancy (seconds). */
  freeTime: number | undefined;

  /**
   * @param onOff Auto-dormancy on/off flag.
   * @param options Optional dormancy parameters.
   */
  constructor(onOff: number, options?: SetAutoDormancyOptions) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_SetAutoDormancy;
    this.onOff = onOff;
    this.freeTime = options?.freeTime;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint8(this.onOff);
    if (this.freeTime !== undefined) {
      buffer.putUint8(0x01);
      buffer.putUint16BE(this.freeTime);
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
