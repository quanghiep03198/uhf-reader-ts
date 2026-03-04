/**
 * Base Lock 6B Get command — query the lock state of an ISO 18000-6B tag byte.
 *
 * Mirrors Python `base_lock6bGet.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { hexToBytes, bytesToHex } from '../../utils/hex-utils.js';

/** Return-code descriptions for the lock-6b-get response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Other error.',
};

/**
 * Query the lock state of a specific byte of an ISO 18000-6B tag.
 */
export class MsgBaseLock6bGet extends Message {
  /** Bitmask of enabled antennas. */
  antennaEnable: number;
  /** Hex TID to match. */
  hexMatchTid: string;
  /** Byte index to query. */
  lockIndex: number;
  /** Lock state result (0 = unlocked, 1 = locked). */
  lockState: number | undefined;

  /**
   * @param antennaEnable Bitmask of enabled antennas.
   * @param hexMatchTid Hex TID to match.
   * @param lockIndex Byte index to query.
   */
  constructor(antennaEnable: number, hexMatchTid: string, lockIndex: number) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_Lock6bGet;
    this.antennaEnable = antennaEnable;
    this.hexMatchTid = hexMatchTid;
    this.lockIndex = lockIndex;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint32BE(this.antennaEnable);
    buffer.putBytes(hexToBytes(this.hexMatchTid));
    buffer.putUint8(this.lockIndex);

    this.cData = buffer.toByteArray();
    this.dataLen = buffer.bitLength / 8;
  }

  /** @inheritdoc */
  override unPack(): void {
    if (this.cData.length) {
      this.rtCode = this.cData[0];
      this.rtMsg = RT_MESSAGES[this.rtCode];

      if (this.cData.length > 1) {
        const stateBuffer = new DynamicBuffer('0x' + bytesToHex(this.cData));
        stateBuffer.pos = 8;
        if (stateBuffer.readUint8() === 1) {
          this.lockState = stateBuffer.readUint8();
        }
      }
    }
  }
}
