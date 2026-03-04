/**
 * Base Inventory EPC command — start an EPC tag inventory.
 *
 * Mirrors Python `base_inventoryEpc.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { hexToBytes } from '../../utils/hex-utils.js';
import { Parameter } from '../parameter.js';

/** Return-code descriptions for the inventory-epc response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Port parameter error.',
  2: 'Filter parameter error.',
  3: 'TID parameter error.',
  4: 'User parameter error.',
  5: 'Reserve parameter error.',
  6: 'Other error.',
};

/** Options for {@link MsgBaseInventoryEpc}. */
export interface InventoryEpcOptions {
  /** EPC filter parameter. */
  filter?: Parameter;
  /** Read TID parameter. */
  readTid?: Parameter;
  /** Read user-data parameter. */
  readUserData?: Parameter;
  /** Read reserved-area parameter. */
  readReserved?: Parameter;
  /** Hex access password. */
  hexPassword?: string;
  /** Monza QT peek flag. */
  monzaQtPeek?: number;
  /** RFMicron sensor flag. */
  rfmicron?: number;
  /** EM sensor flag. */
  emSensor?: number;
  /** Read EPC parameter. */
  readEpc?: Parameter;
  /** Fast ID parameter. */
  paramFastId?: Parameter;
  /** Ctesius sensor flag. */
  ctesius?: number;
  /** Seed value. */
  seed?: number;
  /** DES EPC parameter. */
  desEcpParam?: number;
  /** KunYue flag. */
  kunYue?: number;
}

/**
 * Start an EPC Gen2 tag inventory on selected antennas.
 */
export class MsgBaseInventoryEpc extends Message {
  /** Bitmask of enabled antennas. */
  antennaEnable: number;
  /** Inventory mode (single / continuous). */
  inventoryMode: number;
  /** EPC filter parameter. */
  filter: Parameter | undefined;
  /** Read TID parameter. */
  readTid: Parameter | undefined;
  /** Read user-data parameter. */
  readUserData: Parameter | undefined;
  /** Read reserved-area parameter. */
  readReserved: Parameter | undefined;
  /** Hex access password. */
  hexPassword: string | undefined;
  /** Monza QT peek flag. */
  monzaQtPeek: number | undefined;
  /** RFMicron sensor flag. */
  rfmicron: number | undefined;
  /** EM sensor flag. */
  emSensor: number | undefined;
  /** Read EPC parameter. */
  readEpc: Parameter | undefined;
  /** Fast ID parameter. */
  paramFastId: Parameter | undefined;
  /** Ctesius sensor flag. */
  ctesius: number | undefined;
  /** Seed value. */
  seed: number | undefined;
  /** DES EPC parameter. */
  desEcpParam: number | undefined;
  /** KunYue flag. */
  kunYue: number | undefined;

  /**
   * @param antennaEnable Bitmask of enabled antennas.
   * @param inventoryMode Inventory mode (single / continuous).
   * @param options Optional inventory parameters.
   */
  constructor(antennaEnable: number, inventoryMode: number, options?: InventoryEpcOptions) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_InventoryEpc;
    this.antennaEnable = antennaEnable;
    this.inventoryMode = inventoryMode;
    this.filter = options?.filter;
    this.readTid = options?.readTid;
    this.readUserData = options?.readUserData;
    this.readReserved = options?.readReserved;
    this.hexPassword = options?.hexPassword;
    this.monzaQtPeek = options?.monzaQtPeek;
    this.rfmicron = options?.rfmicron;
    this.emSensor = options?.emSensor;
    this.readEpc = options?.readEpc;
    this.paramFastId = options?.paramFastId;
    this.ctesius = options?.ctesius;
    this.seed = options?.seed;
    this.desEcpParam = options?.desEcpParam;
    this.kunYue = options?.kunYue;
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
    if (this.readReserved !== undefined) {
      buffer.putUint8(0x04);
      buffer.putBytes(this.readReserved.toBytes());
    }
    if (this.hexPassword !== undefined) {
      buffer.putUint8(0x05);
      buffer.putBytes(hexToBytes(this.hexPassword));
    }
    if (this.monzaQtPeek !== undefined) {
      buffer.putUint8(0x06);
      buffer.putUint8(this.monzaQtPeek);
    }
    if (this.rfmicron !== undefined) {
      buffer.putUint8(0x07);
      buffer.putUint8(this.rfmicron);
    }
    if (this.emSensor !== undefined) {
      buffer.putUint8(0x08);
      buffer.putUint8(this.emSensor);
    }
    if (this.readEpc !== undefined) {
      buffer.putUint8(0x09);
      buffer.putBytes(this.readEpc.toBytes());
    }
    if (this.paramFastId !== undefined) {
      buffer.putUint8(0x0a);
      buffer.putBytes(this.paramFastId.toBytes());
    }
    if (this.ctesius !== undefined) {
      buffer.putUint8(0x12);
      buffer.putUint8(this.ctesius);
    }
    if (this.desEcpParam !== undefined) {
      buffer.putUint8(0x14);
      buffer.putUint8(this.desEcpParam);
    }
    if (this.kunYue !== undefined) {
      buffer.putUint8(0x16);
      buffer.putUint8(this.kunYue);
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
