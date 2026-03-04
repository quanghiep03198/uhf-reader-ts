/**
 * Base Get Residence Time command — query antenna/frequency dwell times.
 *
 * Mirrors Python `base_get_residenceTime.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Query the current antenna and frequency dwell (lingering) times.
 */
export class MsgBaseGetResidenceTime extends Message {
  /** Antenna lingering / dwell time (ms). */
  antLingeringTime: number | undefined;
  /** Frequency lingering / dwell time (ms). */
  freLingeringTime: number | undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_GetResidenceTime;
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
      while (buffer.pos / 8 < this.cData.length) {
        const pid = buffer.readUint8();
        if (pid === 1) {
          this.antLingeringTime = buffer.readUint16BE();
        }
        if (pid === 2) {
          this.freLingeringTime = buffer.readUint16BE();
        }
      }
      this.rtCode = 0;
    }
  }
}
