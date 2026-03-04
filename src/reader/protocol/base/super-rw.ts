/**
 * Base Super R/W command — special read/write operations.
 *
 * Mirrors Python `base_super_rw.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { hexToBytes, bytesToHex } from '../../utils/hex-utils.js';

/** Return-code descriptions for the super-rw response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Port parameter error.',
  3: 'Other error.',
};

/** Options for {@link MsgBaseSuperRW}. */
export interface SuperRWOptions {
  /** Hex data for write operations. */
  hexData?: string;
}

/**
 * Execute a special (super) read/write operation on a tag.
 */
export class MsgBaseSuperRW extends Message {
  /** Bitmask of enabled antennas. */
  antennaEnable: number;
  /** Instruction type. */
  instructType: number;
  /** Start address. */
  start: number;
  /** Extra code (hex string). */
  extraCode: string;
  /** Hex data for write operations. */
  hexData: string | undefined;
  /** Read data result (hex string). */
  readData: string | undefined;

  /**
   * @param antennaEnable Bitmask of enabled antennas.
   * @param instructType Instruction type.
   * @param start Start address.
   * @param extraCode Extra code (hex string).
   * @param options Optional super R/W parameters.
   */
  constructor(
    antennaEnable: number,
    instructType: number,
    start: number,
    extraCode: string,
    options?: SuperRWOptions,
  ) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_SuperRW;
    this.antennaEnable = antennaEnable;
    this.instructType = instructType;
    this.start = start;
    this.extraCode = extraCode;
    this.hexData = options?.hexData;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint32BE(this.antennaEnable);
    buffer.putUint8(this.instructType);
    buffer.putUint16BE(this.start);
    buffer.putBytes(hexToBytes(this.extraCode));

    if (this.hexData) {
      buffer.putUint8(0x01);
      buffer.putBytes(hexToBytes(this.hexData));
    }

    this.cData = buffer.toByteArray();
    this.dataLen = buffer.bitLength / 8;
  }

  /** @inheritdoc */
  override unPack(): void {
    if (this.cData.length) {
      this.rtCode = this.cData[0];
      this.rtMsg = RT_MESSAGES[this.rtCode];

      if (this.cData.length > 1) {
        const readBuffer = new DynamicBuffer('0x' + bytesToHex(this.cData));
        readBuffer.pos = 8;
        if (readBuffer.readUint8() === 1) {
          const readBytes = readBuffer.readByteArray(16);
          if (readBytes) {
            this.readData = bytesToHex(readBytes);
          }
        }
      }
    }
  }
}
