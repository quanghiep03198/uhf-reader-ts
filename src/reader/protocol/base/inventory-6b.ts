/**
 * Base Inventory 6B command — start an ISO 18000-6B tag inventory.
 *
 * Mirrors Python `base_inventory6b.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { hexToBytes } from '../../utils/hex-utils.js';
import { Parameter } from '../parameter.js';

/** Return-code descriptions for the inventory-6b response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Port parameter error.',
  2: 'Read parameter error.',
  3: 'UserData parameter error.',
  4: 'Other error.',
};

/** Options for {@link MsgBaseInventory6b}. */
export interface Inventory6bOptions {
  /** Read user-data parameter. */
  readUserData?: Parameter;
  /** Hex match TID for filtering. */
  hexMatchTid?: string;
}

/**
 * Start an ISO 18000-6B tag inventory on selected antennas.
 */
export class MsgBaseInventory6b extends Message {
  /** Bitmask of enabled antennas. */
  antennaEnable: number;
  /** Inventory mode. */
  inventoryMode: number;
  /** Read area (TID / TID+User / User). */
  area: number;
  /** Read user-data parameter. */
  readUserData: Parameter | undefined;
  /** Hex match TID for filtering. */
  hexMatchTid: string | undefined;

  /**
   * @param antennaEnable Bitmask of enabled antennas.
   * @param inventoryMode Inventory mode.
   * @param area Read area.
   * @param options Optional inventory parameters.
   */
  constructor(
    antennaEnable: number,
    inventoryMode: number,
    area: number,
    options?: Inventory6bOptions,
  ) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_Inventory6b;
    this.antennaEnable = antennaEnable;
    this.inventoryMode = inventoryMode;
    this.area = area;
    this.readUserData = options?.readUserData;
    this.hexMatchTid = options?.hexMatchTid;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint32BE(this.antennaEnable);
    buffer.putUint8(this.inventoryMode);
    buffer.putUint8(this.area);

    if (this.readUserData !== undefined) {
      buffer.putUint8(0x01);
      buffer.putBytes(this.readUserData.toBytes());
    }
    if (this.hexMatchTid !== undefined) {
      buffer.putUint8(0x02);
      buffer.putBytes(hexToBytes(this.hexMatchTid));
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
