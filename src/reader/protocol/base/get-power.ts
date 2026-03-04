/**
 * Base Get Power command — query antenna power levels.
 *
 * Mirrors Python `base_get_power.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Query the transmit power of each antenna port.
 */
export class MsgBaseGetPower extends Message {
  /** Map of antenna port number → power level. */
  dicPower: Record<number, number> = {};

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_GetPower;
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
      for (let i = 0; i < Math.floor(this.cData.length / 2); i++) {
        const key = buffer.readUint8();
        const value = buffer.readUint8();
        this.dicPower[key] = value;
      }
      this.rtCode = 0;
    }
  }
}
