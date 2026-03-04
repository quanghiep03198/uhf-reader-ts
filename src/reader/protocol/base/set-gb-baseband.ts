/**
 * Base Set GB Baseband command — configure GB (national standard) baseband parameters.
 *
 * Mirrors Python `base_set_gb_baseband.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

/** Return-code descriptions for the set-gb-baseband response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Parameter reader is not supported.',
  2: 'Q value parameter error.',
  3: 'Session parameter error.',
  4: 'Inventory parameter error.',
  5: 'Other error.',
  6: 'Save failure.',
};

/** Options for {@link MsgBaseSetGbBaseBand}. */
export interface SetGbBaseBandOptions {
  /** TC speed bit. */
  speed_tc?: number;
  /** TRext speed bit. */
  speed_trext?: number;
  /** K speed (4 bits). */
  speed_k?: number;
  /** Miller encoding (2 bits). */
  speed_miller?: number;
  /** CIN parameter (4 bits, default 4). */
  cin?: number;
  /** CCN parameter (4 bits, default 3). */
  ccn?: number;
  /** Session number. */
  session?: number;
  /** Inventory flag. */
  inventoryFlag?: number;
}

/**
 * Configure GB (national standard) baseband parameters.
 */
export class MsgBaseSetGbBaseBand extends Message {
  /** TC speed bit. */
  speed_tc: number | undefined;
  /** TRext speed bit. */
  speed_trext: number | undefined;
  /** K speed (4 bits). */
  speed_k: number | undefined;
  /** Miller encoding (2 bits). */
  speed_miller: number | undefined;
  /** CIN parameter (4 bits). */
  cin: number;
  /** CCN parameter (4 bits). */
  ccn: number;
  /** Session number. */
  session: number | undefined;
  /** Inventory flag. */
  inventoryFlag: number | undefined;

  /**
   * @param options GB baseband configuration.
   */
  constructor(options: SetGbBaseBandOptions = {}) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_SetGbBaseBand;
    this.speed_tc = options.speed_tc;
    this.speed_trext = options.speed_trext;
    this.speed_k = options.speed_k;
    this.speed_miller = options.speed_miller;
    this.cin = options.cin ?? 4;
    this.ccn = options.ccn ?? 3;
    this.session = options.session;
    this.inventoryFlag = options.inventoryFlag;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();

    if (
      this.speed_tc !== undefined &&
      this.speed_trext !== undefined &&
      this.speed_k !== undefined &&
      this.speed_miller !== undefined
    ) {
      buffer.putUint8(0x01);
      buffer.putBits(1, this.speed_tc);
      buffer.putBits(1, this.speed_trext);
      buffer.putBits(4, this.speed_k);
      buffer.putBits(2, this.speed_miller);
    }
    if (this.cin !== undefined && this.ccn !== undefined) {
      buffer.putUint8(0x02);
      buffer.putBits(4, this.cin);
      buffer.putBits(4, this.ccn);
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
