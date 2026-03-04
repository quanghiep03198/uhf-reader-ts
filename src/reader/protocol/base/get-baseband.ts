/**
 * Base Get Baseband command — query baseband parameters.
 *
 * Mirrors Python `base_get_baseband.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Query the current baseband parameters (speed, Q value, session, inventory flag).
 */
export class MsgBaseGetBaseband extends Message {
  /** Base speed / link profile. */
  baseSpeed: number | undefined;
  /** Q value for anti-collision. */
  qValue: number | undefined;
  /** Session number (0-3). */
  session: number | undefined;
  /** Inventory flag (A/B). */
  inventoryFlag: number | undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_GetBaseband;
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
      this.baseSpeed = buffer.readUint8();
      this.qValue = buffer.readUint8();
      this.session = buffer.readUint8();
      this.inventoryFlag = buffer.readUint8();
      this.rtCode = 0;
    }
  }
}
