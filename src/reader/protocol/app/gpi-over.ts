/**
 * GPI trigger over push notification.
 *
 * Mirrors Python `app_gpiOver.py`.  Sent by the reader when a GPI
 * (General Purpose Input) trigger event ends.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';
import { secondFormat } from '../../utils/date-utils.js';

/**
 * Log message indicating a GPI trigger event has ended.
 */
export class LogGpiOver extends Message {
  /** GPI port number. */
  gpiPort: number | undefined = undefined;
  /** GPI port level. */
  gpiPortLevel: number | undefined = undefined;
  /** Formatted system time string. */
  systemTime: string | undefined = undefined;
  /** Reader serial number (set externally after reception). */
  readerSerialNumber: string | undefined = undefined;
  /** Reader name (set externally after reception). */
  readerName: string | undefined = undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppLogMid_gpiOver;
  }

  /** @inheritdoc */
  pack(): void {
    super.pack();
  }

  /**
   * Deserialise the data payload into typed properties.
   *
   * Layout: gpiPort (uint8) + gpiPortLevel (uint8) + seconds (uint32) +
   * microseconds (uint32).
   */
  unPack(): void {
    if (!this.cData || this.cData.length === 0) return;

    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);

    this.gpiPort = buffer.readUint8();
    this.gpiPortLevel = buffer.readUint8();
    const second = buffer.readUint32BE();
    const mic = buffer.readUint32BE();
    const wholeSeconds = Math.floor(mic / 1_000_000);
    this.systemTime = secondFormat(second + wholeSeconds);
  }

  /**
   * String representation of this GPI over event.
   *
   * @returns Tuple-like string of port, level, and time.
   */
  toString(): string {
    return `(${this.gpiPort}, ${this.gpiPortLevel}, ${this.systemTime})`;
  }
}
