/**
 * Base Get Frequency command — query current frequency settings.
 *
 * Mirrors Python `base_get_frequency.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Query the current frequency hopping mode and selected frequency points.
 */
export class MsgBaseGetFrequency extends Message {
  /** Automatic frequency hopping flag. */
  automatically: number | undefined;
  /** List of frequency cursor indices. */
  listFreqCursor: number[] = [];

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_GetFrequency;
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
      this.automatically = buffer.readUint8();
      const freLen = buffer.readUint16BE();
      this.listFreqCursor = [];
      for (let i = 0; i < freLen; i++) {
        this.listFreqCursor.push(buffer.readUint8());
      }
      this.rtCode = 0;
    }
  }
}
