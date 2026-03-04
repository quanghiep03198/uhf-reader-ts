/**
 * Base Set Power command — configure antenna power levels.
 *
 * Mirrors Python `base_set_power.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

/** Return-code descriptions for the set-power response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Port parameter reader is not supported.',
  2: 'Power parameter reader is not supported.',
  3: 'Save failure.',
};

/** Options for {@link MsgBaseSetPower}. */
export interface SetPowerOptions {
  /** Map of antenna port number → power level. */
  portPower?: Record<number, number>;
  /** Whether to save power setting across power-down (0 or 1). */
  powerDownSave?: number;
}

/**
 * Set the transmit power for one or more antenna ports.
 */
export class MsgBaseSetPower extends Message {
  /** Map of antenna port number → power level. */
  portPower: Record<number, number>;
  /** Power-down save flag. */
  powerDownSave: number | undefined;

  /**
   * @param options Power configuration options.
   */
  constructor(options: SetPowerOptions = {}) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_SetPower;
    this.portPower = options.portPower ?? {};
    this.powerDownSave = options.powerDownSave;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    for (const [key, value] of Object.entries(this.portPower)) {
      if (/^\d+$/.test(key)) {
        buffer.putUint8(Number(key));
        buffer.putUint8(value);
      }
    }
    if (this.powerDownSave !== undefined) {
      buffer.putUint8(0xff);
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
