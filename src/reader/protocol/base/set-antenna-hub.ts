/**
 * Base Set Antenna Hub command — configure antenna hub ports.
 *
 * Mirrors Python `base_set_antennaHub.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

/** Return-code descriptions for the set-antenna-hub response. */
const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Port parameter reader is not supported.',
  2: 'Save failure.',
};

/** Options for {@link MsgBaseSetAntennaHub}. */
export interface SetAntennaHubOptions {
  /** Map of antenna port number → hub configuration value. */
  portHub?: Record<number, number>;
}

/**
 * Configure antenna hub port mappings.
 */
export class MsgBaseSetAntennaHub extends Message {
  /** Map of antenna port number → hub configuration value. */
  dicHub: Record<number, number>;

  /**
   * @param options Antenna hub configuration.
   */
  constructor(options: SetAntennaHubOptions = {}) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseMid_SetAntennaHub;
    this.dicHub = options.portHub ?? {};
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    for (const [key, value] of Object.entries(this.dicHub)) {
      if (/^\d+$/.test(key)) {
        buffer.putUint8(Number(key));
        buffer.putUint16BE(value);
      }
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
