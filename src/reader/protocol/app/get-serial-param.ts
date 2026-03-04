/**
 * Get serial port parameters command / response.
 *
 * Mirrors Python `app_get_serialParam.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Retrieves the current serial port baud rate setting from the reader.
 */
export class MsgAppGetSerialParam extends Message {
  /** Baud rate index. */
  baudRateIndex: number | undefined = undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_GetSerialParam;
  }

  /** @inheritdoc */
  override pack(): void {
    super.pack();
  }

  /**
   * Deserialise the data payload.
   *
   * Layout: baudRateIndex (uint8).
   */
  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);
    this.baudRateIndex = buffer.readUint8();
    this.rtCode = 0;
  }

  /**
   * @returns The baud rate index as a string.
   */
  toString(): string {
    return String(this.baudRateIndex);
  }
}
