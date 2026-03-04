/**
 * Base Write Monza QT command — read/write Monza QT configuration.
 *
 * Mirrors Python `base_writeMonzaQt.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { hexToBytes, bytesToHex } from '../../utils/hex-utils.js';
import { Parameter } from '../parameter.js';

/** Return-code descriptions for the write-monza-qt response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Port parameter error.',
  2: 'Filter parameter error.',
  3: 'Qt parameter error.',
  4: 'CRC check error.',
  5: 'Underpower error.',
  6: 'Access password error.',
  7: 'Other error.',
  8: 'Label is missing.',
  9: 'Command error.',
};

/** Options for {@link MsgBaseWriteMonzaQt}. */
export interface WriteMonzaQtOptions {
  /** EPC filter parameter. */
  filter?: Parameter;
  /** Hex access password. */
  hexPassword?: string;
  /** Response distance flag (1 bit). */
  responseDistance?: number;
  /** Pattern flag (1 bit). */
  pattern?: number;
}

/**
 * Read or write Monza QT configuration on an Impinj Monza tag.
 */
export class MsgBaseWriteMonzaQt extends Message {
  /** Bitmask of enabled antennas. */
  antennaEnable: number;
  /** Operation type (read/write). */
  operationType: number;
  /** EPC filter parameter. */
  filter: Parameter | undefined;
  /** Hex access password. */
  hexPassword: string | undefined;
  /** Response distance flag (1 bit). */
  responseDistance: number | undefined;
  /** Pattern flag (1 bit). */
  pattern: number | undefined;
  /** QT parameter result from read operation. */
  qtParamResult: number | undefined;

  /**
   * @param antennaEnable Bitmask of enabled antennas.
   * @param operationType Operation type (read/write).
   * @param options Optional QT parameters.
   */
  constructor(antennaEnable: number, operationType: number, options?: WriteMonzaQtOptions) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_MonzaQT;
    this.antennaEnable = antennaEnable;
    this.operationType = operationType;
    this.filter = options?.filter;
    this.hexPassword = options?.hexPassword;
    this.responseDistance = options?.responseDistance;
    this.pattern = options?.pattern;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint32BE(this.antennaEnable);
    buffer.putUint8(this.operationType);

    if (this.filter !== undefined) {
      buffer.putUint8(0x01);
      const filterBytes = this.filter.toBytes();
      buffer.putUint16BE(filterBytes.length);
      buffer.putBytes(filterBytes);
    }
    if (this.hexPassword !== undefined) {
      buffer.putUint8(0x02);
      buffer.putBytes(hexToBytes(this.hexPassword));
    }
    if (this.responseDistance !== undefined && this.pattern !== undefined) {
      buffer.putUint8(0x03);
      buffer.putBits(1, this.responseDistance);
      buffer.putBits(1, this.pattern);
      buffer.putBits(6, 0);
      buffer.putUint8(0);
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
        const queryBuffer = new DynamicBuffer('0x' + bytesToHex(this.cData));
        queryBuffer.pos = 8;
        if (queryBuffer.readUint8() === 1) {
          this.qtParamResult = queryBuffer.readUint16BE();
        }
      }
    }
  }
}
