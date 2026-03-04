/**
 * All-GPI-state push notification.
 *
 * Mirrors Python `app_all_gpiState.py`.  Sent by the reader to report
 * the combined level state of all GPI ports as a 32-bit bitmask.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Log message carrying the state of all GPI ports.
 */
export class LogAppAllGpiState extends Message {
  /** Combined GPI port levels as a 32-bit value. */
  gpiPortLevel: number | undefined = undefined;
  /** Reader serial number (set externally after reception). */
  readerSerialNumber: string | undefined = undefined;
  /** Reader name (set externally after reception). */
  readerName: string | undefined = undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppLogMid_allGpiState;
  }

  /** @inheritdoc */
  pack(): void {
    super.pack();
  }

  /**
   * Deserialise the data payload.
   *
   * The payload is a single uint32 representing all GPI port levels.
   */
  unPack(): void {
    if (!this.cData || this.cData.length === 0) return;

    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);
    this.gpiPortLevel = buffer.readUint32BE();
  }

  /**
   * Return the GPI port levels as a 32-character binary string.
   *
   * @returns Binary representation zero-padded to 32 bits.
   */
  toBinaryString(): string {
    return (this.gpiPortLevel ?? 0).toString(2).padStart(32, '0');
  }

  /**
   * String representation of this GPI state.
   *
   * @returns The port level value as a string.
   */
  toString(): string {
    return String(this.gpiPortLevel);
  }
}
