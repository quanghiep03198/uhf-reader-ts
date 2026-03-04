/**
 * Base Get Capabilities command — query reader hardware capabilities.
 *
 * Mirrors Python `base_get_capabilities.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Query the reader's hardware capabilities (power range, antenna count, frequencies, protocols).
 */
export class MsgBaseGetCapabilities extends Message {
  /** Minimum supported power level. */
  minPower: number | undefined;
  /** Maximum supported power level. */
  maxPower: number | undefined;
  /** Number of antenna ports. */
  antennaCount: number | undefined;
  /** Supported frequency indices. */
  frequencyArray: number[] = [];
  /** Supported protocol indices. */
  protocolArray: number[] = [];

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_GetCapabilities;
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
      this.minPower = buffer.readUint8();
      this.maxPower = buffer.readUint8();
      this.antennaCount = buffer.readUint8();

      const freLen = buffer.readUint16BE();
      if (freLen) {
        this.frequencyArray = [];
        for (let i = 0; i < freLen; i++) {
          this.frequencyArray.push(buffer.readUint8());
        }
      }

      const proLen = buffer.readUint16BE();
      if (proLen) {
        this.protocolArray = [];
        for (let i = 0; i < proLen; i++) {
          this.protocolArray.push(buffer.readUint8());
        }
      }

      this.rtCode = 0;
    }
  }
}
