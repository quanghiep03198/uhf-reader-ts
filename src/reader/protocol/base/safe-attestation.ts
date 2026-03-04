/**
 * Base Safe Attestation command — secure authentication operations.
 *
 * Mirrors Python `base_safe_attestation.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { hexToBytes } from '../../utils/hex-utils.js';
import { Parameter } from '../parameter.js';

/** Return-code descriptions for the safe-attestation response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Frequency parameter reader is not supported.',
  2: 'Save failure.',
};

/** Options for {@link MsgBaseSafeAttestation}. */
export interface SafeAttestationOptions {
  /** Token 1 (hex string). */
  token1?: string;
  /** Token 2 result code. */
  token2Result?: number;
  /** Enciphered data parameter. */
  encipheredData?: Parameter;
  /** Key (hex string). */
  key?: string;
}

/**
 * Execute a secure authentication / attestation operation.
 */
export class MsgBaseSafeAttestation extends Message {
  /** Token 1 (hex string). */
  token1: string | undefined;
  /** Token 2 result code. */
  token2Result: number | undefined;
  /** Enciphered data parameter. */
  encipheredData: Parameter | undefined;
  /** Key (hex string). */
  key: string | undefined;

  /**
   * @param options Safe attestation parameters.
   */
  constructor(options: SafeAttestationOptions = {}) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_SafeAttestation;
    this.token1 = options.token1;
    this.token2Result = options.token2Result;
    this.encipheredData = options.encipheredData;
    this.key = options.key;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();

    if (this.token1 !== undefined) {
      buffer.putUint8(0x01);
      buffer.putBytes(hexToBytes(this.token1));
    }
    if (this.token2Result !== undefined) {
      buffer.putUint8(0x02);
      buffer.putUint8(this.token2Result);
    }
    if (this.encipheredData !== undefined) {
      buffer.putUint8(0x03);
      const dataBytes = this.encipheredData.toBytes();
      buffer.putUint16BE(dataBytes.length);
      buffer.putBytes(dataBytes);
    }
    if (this.key !== undefined) {
      buffer.putUint8(0x04);
      const keyBytes = hexToBytes(this.key);
      buffer.putUint16BE(keyBytes.length);
      buffer.putBytes(keyBytes);
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
