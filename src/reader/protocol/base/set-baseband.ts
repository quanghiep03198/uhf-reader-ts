/**
 * Base Set Baseband command — configure baseband parameters.
 *
 * Mirrors Python `base_set_baseband.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

/** Return-code descriptions for the set-baseband response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Parameter reader is not supported.',
  2: 'Q value parameter error.',
  3: 'Session parameter error.',
  4: 'Inventory parameter error.',
  5: 'Other error.',
  6: 'Save failure.',
};

/** Options for {@link MsgBaseSetBaseband}. */
export interface SetBasebandOptions {
  /** Base speed / link profile. */
  baseSpeed?: number;
  /** Q value for anti-collision. */
  qValue?: number;
  /** Session number (0-3). */
  session?: number;
  /** Inventory flag (A/B). */
  inventoryFlag?: number;
}

/**
 * Configure baseband parameters (speed, Q value, session, inventory flag).
 */
export class MsgBaseSetBaseband extends Message {
  /** Base speed / link profile. */
  baseSpeed: number | undefined;
  /** Q value for anti-collision. */
  qValue: number | undefined;
  /** Session number (0-3). */
  session: number | undefined;
  /** Inventory flag (A/B). */
  inventoryFlag: number | undefined;

  /**
   * @param options Baseband configuration.
   */
  constructor(options: SetBasebandOptions = {}) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_SetBaseband;
    this.baseSpeed = options.baseSpeed;
    this.qValue = options.qValue;
    this.session = options.session;
    this.inventoryFlag = options.inventoryFlag;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    if (this.baseSpeed !== undefined) {
      buffer.putUint8(0x01);
      buffer.putUint8(this.baseSpeed);
    }
    if (this.qValue !== undefined) {
      buffer.putUint8(0x02);
      buffer.putUint8(this.qValue);
    }
    if (this.session !== undefined) {
      buffer.putUint8(0x03);
      buffer.putUint8(this.session);
    }
    if (this.inventoryFlag !== undefined) {
      buffer.putUint8(0x04);
      buffer.putUint8(this.inventoryFlag);
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
