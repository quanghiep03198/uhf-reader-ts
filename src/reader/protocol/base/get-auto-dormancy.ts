/**
 * Base Get Auto-Dormancy command — query auto-dormancy settings.
 *
 * Mirrors Python `base_get_autoDormancy.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Query the current auto-dormancy configuration.
 */
export class MsgBaseGetAutoDormancy extends Message {
  /** Auto-dormancy on/off (1 = on, 0 = off). */
  onOff: number | undefined;
  /** Idle time before dormancy (seconds). */
  freeTime: number | undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_GetAutoDormancy;
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
      this.onOff = buffer.readUint8();
      this.freeTime = buffer.readUint16BE();
      this.rtCode = 0;
    }
  }
}
