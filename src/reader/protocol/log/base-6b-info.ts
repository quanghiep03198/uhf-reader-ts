/**
 * ISO 18000-6B tag inventory push notification.
 *
 * Mirrors Python `log_base_6b_info.py`.  Sent by the reader when a 6B
 * tag is detected during an inventory round.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Log message carrying information about a single 6B tag read.
 */
export class LogBase6bInfo extends Message {
  /** Reader name (set externally after reception). */
  readerName: string | undefined = undefined;
  /** TID hex string (8 bytes). */
  tid: string | undefined = undefined;
  /** TID raw bytes. */
  bTid: number[] | undefined = undefined;
  /** Antenna port ID. */
  antId: number | undefined = undefined;
  /** RSSI value. */
  rssi: number | undefined = undefined;
  /** Read result code (`0` = success). */
  result = 0;
  /** User-memory hex string. */
  userData: string | undefined = undefined;
  /** User-memory raw bytes. */
  bUser: number[] | undefined = undefined;
  /** Reader serial number (set externally after reception). */
  readerSerialNumber: string | undefined = undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseLogMid_6b;
  }

  /** @inheritdoc */
  pack(): void {
    super.pack();
  }

  /**
   * Deserialise the data payload into typed properties.
   *
   * Layout: TID (8 bytes) + antId (uint8) then optional property blocks.
   */
  unPack(): void {
    if (!this.cData || this.cData.length === 0) return;

    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);

    // Fixed 8-byte TID
    this.bTid = buffer.readByteArray(8 * 8) ?? undefined;
    if (this.bTid) {
      this.tid = bytesToHex(this.bTid);
    }
    this.antId = buffer.readUint8();

    while (buffer.pos / 8 < this.cData.length) {
      const pid = buffer.readUint8();

      if (pid === 1) {
        this.rssi = buffer.readUint8();
      } else if (pid === 2) {
        this.result = buffer.readUint8();
      } else if (pid === 3) {
        const userLen = buffer.readUint16BE();
        this.bUser = buffer.readByteArray(userLen * 8) ?? undefined;
        if (this.bUser) {
          this.userData = bytesToHex(this.bUser);
        }
      }
    }
  }
}
