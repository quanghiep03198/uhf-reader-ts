/**
 * Base Inventory Hybrid command — start a hybrid (6B + GB) inventory.
 *
 * Mirrors Python `base_inventory_Hybrid.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

/** Return-code descriptions for the inventory-hybrid response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Other error.',
};

/**
 * Start a hybrid inventory (ISO 18000-6B + GB) on selected antennas.
 */
export class MsgBaseInventoryHybrid extends Message {
  /** Bitmask of enabled antennas. */
  antennaEnable: number;
  /** Read 6B tags flag. */
  read6b: number;
  /** Read GB tags flag. */
  readGb: number;

  /**
   * @param antennaEnable Bitmask of enabled antennas.
   * @param read6b Read 6B tags flag.
   * @param readGb Read GB tags flag.
   */
  constructor(antennaEnable: number, read6b: number, readGb: number) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_Hybrid;
    this.antennaEnable = antennaEnable;
    this.read6b = read6b;
    this.readGb = readGb;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint32BE(this.antennaEnable);
    buffer.putUint8(this.read6b);
    buffer.putUint8(this.readGb);

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
