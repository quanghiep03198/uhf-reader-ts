/**
 * EPC tag inventory push notification.
 *
 * Mirrors Python `log_base_epc_info.py`.  Sent by the reader during an
 * EPC inventory round — one message per detected tag.  The data payload
 * contains mandatory fields (EPC, PC, antenna) followed by optional
 * TLV-like property blocks identified by a one-byte property ID.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Log message carrying information about a single EPC tag read.
 */
export class LogBaseEpcInfo extends Message {
  /** Reader name (set externally after reception). */
  readerName: string | undefined = undefined;
  /** EPC hex string. */
  epc: string | undefined = undefined;
  /** EPC raw bytes. */
  bEpc: number[] | undefined = undefined;
  /** Protocol-Control word. */
  pc: number | undefined = undefined;
  /** Antenna port ID. */
  antId: number | undefined = undefined;
  /** RSSI value. */
  rssi: number | undefined = undefined;
  /** Read result code (`0` = success). */
  result = 0;
  /** TID hex string. */
  tid: string | undefined = undefined;
  /** TID raw bytes. */
  bTid: number[] | undefined = undefined;
  /** User-memory hex string. */
  userData: string | undefined = undefined;
  /** User-memory raw bytes. */
  bUser: number[] | undefined = undefined;
  /** Reserved-memory hex string. */
  reserved: string | undefined = undefined;
  /** Reserved-memory raw bytes. */
  bRes: number[] | undefined = undefined;
  /** Child antenna ID (for hub configurations). */
  childAntId: number | undefined = undefined;
  /** UTC timestamp in milliseconds. */
  strUtc: number | undefined = undefined;
  /** Frequency point (Hz). */
  frequencyPoint: number | undefined = undefined;
  /** RF phase value. */
  phase: number | undefined = undefined;
  /** EPC data hex string. */
  epcData: string | undefined = undefined;
  /** EPC data raw bytes. */
  bEpcData: number[] | undefined = undefined;
  /** Ctesius LTU-27 value. */
  ctesiusLtu27: number | undefined = undefined;
  /** Ctesius LTU-31 value. */
  ctesiusLtu31: number | undefined = undefined;
  /** Reader serial number string. */
  readerSerialNumber: string | undefined = undefined;
  /** Reply serial number. */
  replySerialNumber: number | undefined = undefined;
  /** KunYue value. */
  kunYue: number | undefined = undefined;
  /** RSSI in dBm. */
  rssidBm: number | undefined = undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseLogMid_Epc;
  }

  /** @inheritdoc */
  pack(): void {
    super.pack();
  }

  /**
   * Deserialise the data payload into typed properties.
   *
   * The payload layout is:
   * - `epcLength` (uint16) + EPC bytes + PC (uint16) + antId (uint8)
   * - Then zero or more property blocks: `pid` (uint8) + value
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
      } else if (pid === 5) {
        const resLen = buffer.readUint16BE();
        this.bRes = buffer.readByteArray(resLen * 8) ?? undefined;
        if (this.bRes) {
          this.reserved = bytesToHex(this.bRes);
        }
      } else if (pid === 6) {
        this.childAntId = buffer.readUint8();
      } else if (pid === 7) {
        const utcSecond = buffer.readUint32BE() * 1000;
        const utcMicrosecond = buffer.readUint32BE() / 1000;
        this.strUtc = utcSecond + utcMicrosecond;
      } else if (pid === 8) {
        this.frequencyPoint = buffer.readUint32BE();
      } else if (pid === 9) {
        this.phase = buffer.readUint8();
      } else if (pid === 10) {
        const epcDataLen = buffer.readUint16BE();
        this.bEpcData = buffer.readByteArray(epcDataLen * 8) ?? undefined;
        if (this.bEpcData) {
          this.epcData = bytesToHex(this.bEpcData);
        }
      } else if (pid === 0x11) {
        this.ctesiusLtu27 = buffer.readUint16BE();
      } else if (pid === 0x12) {
        this.ctesiusLtu31 = buffer.readUint16BE();
      } else if (pid === 0x13) {
        this.kunYue = buffer.readUint16BE();
      } else if (pid === 0x14) {
        this.rssidBm = buffer.readUint16BE();
      } else if (pid === 0x20) {
        const snLen = buffer.readUint16BE();
        if (snLen) {
          const snBytes = buffer.readByteArray(snLen * 8);
          if (snBytes) {
            this.readerSerialNumber = snBytes.map((b) => String.fromCharCode(b)).join('');
          }
        }
      } else if (pid === 0x22) {
        this.replySerialNumber = buffer.readUint32BE();
      }
    }
  }
}
