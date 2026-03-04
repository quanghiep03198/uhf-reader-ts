/**
 * Set serial port parameters command / response.
 *
 * Mirrors Python `app_set_serialParam.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Failed,This baud rate is not supported.',
};

/**
 * Sets the serial port baud rate on the reader.
 */
export class MsgAppSetSerialParam extends Message {
  /** Baud rate index. */
  baudRateIndex: number;

  constructor(baudRateIndex: number) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_SetSerialParam;
    this.baudRateIndex = baudRateIndex;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint8(this.baudRateIndex);
    this.cData = buffer.toByteArray();
    this.dataLen = buffer.bitLength / 8;
  }

  /** @inheritdoc */
  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    this.rtCode = this.cData[0];
    this.rtMsg = RT_MESSAGES[this.rtCode];
  }
}
