/**
 * Base Get Tag Log command — query tag logging parameters.
 *
 * Mirrors Python `base_get_tagLog.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Query the current tag logging / reporting parameters.
 */
export class MsgBaseGetTagLog extends Message {
  /** Repeated tag reporting time (ms). */
  repeatedTime: number | undefined;
  /** RSSI threshold value. */
  rssiTV: number | undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_GetTagLog;
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
      this.repeatedTime = buffer.readUint16BE();
      this.rssiTV = buffer.readUint8();
      this.rtCode = 0;
    }
  }
}
