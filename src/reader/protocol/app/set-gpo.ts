/**
 * Set GPO (General Purpose Output) port states command / response.
 *
 * Mirrors Python `app_set_gpo.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Port parameter reader hardware is not supported.',
};

/** GPO port states, keyed by port number (1–32). */
export type GpoStates = Partial<Record<number, number>>;

/**
 * Sets the output levels of one or more GPO ports on the reader.
 */
export class MsgAppSetGpo extends Message {
  /** GPO port states. Keys are port numbers 1–32, values are port levels. */
  gpoStates: GpoStates;

  constructor(gpoStates: GpoStates = {}) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_SetGpo;
    this.gpoStates = gpoStates;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    for (let i = 1; i <= 32; i++) {
      const val = this.gpoStates[i];
      if (val !== undefined) {
        buffer.putUint8(i);
        buffer.putUint8(val);
      }
    }
    this.cData = buffer.toByteArray();
    this.dataLen = buffer.bitLength / 8;
  }

  /** @inheritdoc */
  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    this.rtCode = this.cData[0];
    this.rtMsg = RT_MESSAGES[this.rtCode];
  }
}
