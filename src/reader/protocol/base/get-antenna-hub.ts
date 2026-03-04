/**
 * Base Get Antenna Hub command — query antenna hub configuration.
 *
 * Mirrors Python `base_get_antennaHub.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Query the current antenna hub port configuration.
 */
export class MsgBaseGetAntennaHub extends Message {
  /** Map of antenna port number → hub configuration value. */
  dicHub: Record<number, number> = {};

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_GetAntennaHub;
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
      // Matches Python: int(len(self.cData) / 2)
      for (let i = 0; i < Math.floor(this.cData.length / 2); i++) {
        const key = buffer.readUint8();
        const value = buffer.readUint16BE();
        this.dicHub[key] = value;
      }
      this.rtCode = 0;
    }
  }
}
