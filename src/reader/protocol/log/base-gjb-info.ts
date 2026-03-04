/**
 * GJB tag inventory push notification.
 *
 * Mirrors Python `log_base_gjb_info.py`.  Sent by the reader when a GJB
 * (Chinese military standard) tag is detected during inventory.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Log message carrying information about a single GJB tag read.
 */
export class LogBaseGJbInfo extends Message {
  /** Reader name (set externally after reception). */
  readerName: string | undefined = undefined;
  /** EPC hex string. */
  epc: string | undefined = undefined;
  /** EPC raw bytes. */
  bEpc: number[] | undefined = undefined;
  /** TID hex string. */
  tid: string | undefined = undefined;
  /** TID raw bytes. */
  bTid: number[] | undefined = undefined;
  /** Protocol-Control word. */
  pc: number | undefined = undefined;
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
    this.msgId = EnumG.BaseLogMid_GJb;
  }

  /** @inheritdoc */
  pack(): void {
    super.pack();
  }

  /**
   * Deserialise the data payload into typed properties.
   *
   * Layout: epcLength (uint16) + EPC bytes + PC (uint16) + antId (uint8),
   * then optional property blocks.
   */
  unPack(): void {
    if (!this.cData || this.cData.length === 0) return;

    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);

    const epcLength = buffer.readUint16BE();
    this.bEpc = buffer.readByteArray(epcLength * 8) ?? undefined;
    if (this.bEpc) {
      this.epc = bytesToHex(this.bEpc);
    }
    this.pc = buffer.readUint16BE();
    this.antId = buffer.readUint8();

    while (buffer.pos / 8 < this.cData.length) {
      const pid = buffer.readUint8();

      if (pid === 1) {
        this.rssi = buffer.readUint8();
      } else if (pid === 2) {
        this.result = buffer.readUint8();
      } else if (pid === 3) {
        const tidLen = buffer.readUint16BE();
        this.bTid = buffer.readByteArray(tidLen * 8) ?? undefined;
        if (this.bTid) {
          this.tid = bytesToHex(this.bTid);
        }
      } else if (pid === 4) {
        const userLen = buffer.readUint16BE();
        this.bUser = buffer.readByteArray(userLen * 8) ?? undefined;
        if (this.bUser) {
          this.userData = bytesToHex(this.bUser);
        }
      }
    }
  }
}
