/**
 * Base Inventory GJB command — start a GJB (military standard) tag inventory.
 *
 * Mirrors Python `base_inventoryGJb.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { hexToBytes } from '../../utils/hex-utils.js';
import { Parameter } from '../parameter.js';

/** Return-code descriptions for the inventory-gjb response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Port parameter error.',
  2: 'Filter parameter error.',
  3: 'TID parameter error.',
  4: 'User parameter error.',
  5: 'Other error.',
};

/** Options for {@link MsgBaseInventoryGJb}. */
export interface InventoryGJbOptions {
  /** Filter parameter. */
  filter?: Parameter;
  /** Read TID parameter. */
  readTid?: Parameter;
  /** Read user-data parameter. */
  readUserData?: Parameter;
  /** Hex access password. */
  hexPassword?: string;
  /** Safe mark flag. */
  safeMark?: number;
}

/**
 * Start a GJB (military standard) tag inventory on selected antennas.
 */
export class MsgBaseInventoryGJb extends Message {
  /** Bitmask of enabled antennas. */
  antennaEnable: number;
  /** Inventory mode. */
  inventoryMode: number;
  /** Filter parameter. */
  filter: Parameter | undefined;
  /** Read TID parameter. */
  readTid: Parameter | undefined;
  /** Read user-data parameter. */
  readUserData: Parameter | undefined;
  /** Hex access password. */
  hexPassword: string | undefined;
  /** Safe mark flag. */
  safeMark: number | undefined;

  /**
   * @param antennaEnable Bitmask of enabled antennas.
   * @param inventoryMode Inventory mode.
   * @param options Optional inventory parameters.
   */
  constructor(antennaEnable: number, inventoryMode: number, options?: InventoryGJbOptions) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_InventoryGJb;
    this.antennaEnable = antennaEnable;
    this.inventoryMode = inventoryMode;
    this.filter = options?.filter;
    this.readTid = options?.readTid;
    this.readUserData = options?.readUserData;
    this.hexPassword = options?.hexPassword;
    this.safeMark = options?.safeMark;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint32BE(this.antennaEnable);
    buffer.putUint8(this.inventoryMode);

    if (this.filter !== undefined) {
      buffer.putUint8(0x01);
      const filterBytes = this.filter.toBytes();
      buffer.putUint16BE(filterBytes.length);
      buffer.putBytes(filterBytes);
    }
    if (this.readTid !== undefined) {
      buffer.putUint8(0x02);
      buffer.putBytes(this.readTid.toBytes());
    }
    if (this.readUserData !== undefined) {
      buffer.putUint8(0x03);
      buffer.putBytes(this.readUserData.toBytes());
    }
    if (this.hexPassword !== undefined) {
      buffer.putUint8(0x05);
      buffer.putBytes(hexToBytes(this.hexPassword));
    }
    if (this.safeMark !== undefined) {
      buffer.putUint8(0x06);
      buffer.putUint8(this.safeMark);
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
