/**
 * Base Stop command — stops the current inventory operation.
 *
 * Mirrors Python `base_stop.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';

/** Return-code descriptions for the stop response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Stop failure',
};

/**
 * Stop the current baseband operation (inventory, etc.).
 */
export class MsgBaseStop extends Message {
  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_Stop;
  }

  /** @inheritdoc */
  override pack(): void {
    super.pack();
  }

  /** @inheritdoc */
  override unPack(): void {
    if (this.cData.length) {
      this.rtCode = this.cData[0];
      this.rtMsg = RT_MESSAGES[this.rtCode];
    }
  }
}
