/**
 * Base Get GB Baseband command — query GB (national standard) baseband parameters.
 *
 * Mirrors Python `base_get_gb_baseband.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Query the current GB (national standard) baseband parameters.
 */
export class MsgBaseGetGbBaseBand extends Message {
  /** TC speed bit. */
  speed_tc: number | undefined;
  /** TRext speed bit. */
  speed_trext: number | undefined;
  /** K speed (4 bits). */
  speed_k: number | undefined;
  /** Miller encoding (2 bits). */
  speed_miller: number | undefined;
  /** CIN parameter (4 bits). */
  cin: number | undefined;
  /** CCN parameter (4 bits). */
  ccn: number | undefined;
  /** Session number. */
  session: number | undefined;
  /** Inventory flag. */
  inventoryFlag: number | undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_GetGbBaseBand;
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
      this.speed_tc = buffer.readBits(1);
      this.speed_trext = buffer.readBits(1);
      this.speed_k = buffer.readBits(4);
      this.speed_miller = buffer.readBits(2);
      this.cin = buffer.readBits(4);
      this.ccn = buffer.readBits(4);
      this.session = buffer.readUint8();
      this.inventoryFlag = buffer.readUint8();
      this.rtCode = 0;
    }
  }
}
