/**
 * Base Set Tag Log command — configure tag logging parameters.
 *
 * Mirrors Python `base_set_tagLog.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

/** Return-code descriptions for the set-tag-log response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Parameter reader is not supported.',
  2: 'Save failure.',
};

/** Options for {@link MsgBaseSetTagLog}. */
export interface SetTagLogOptions {
  /** Repeated tag reporting time (ms). */
  repeatedTime?: number;
  /** RSSI threshold value. */
  rssiTV?: number;
}

/**
 * Configure tag logging / reporting parameters.
 */
export class MsgBaseSetTagLog extends Message {
  /** Repeated tag reporting time (ms). */
  repeatedTime: number | undefined;
  /** RSSI threshold value. */
  rssiTV: number | undefined;

  /**
   * @param options Tag log configuration.
   */
  constructor(options: SetTagLogOptions = {}) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_SetTagLog;
    this.repeatedTime = options.repeatedTime;
    this.rssiTV = options.rssiTV;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    if (this.repeatedTime !== undefined) {
      buffer.putUint8(0x01);
      buffer.putUint16BE(this.repeatedTime);
    }
    if (this.rssiTV !== undefined) {
      buffer.putUint8(0x02);
      buffer.putUint8(this.rssiTV);
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
