/**
 * Protocol message — frame parse / serialise / CRC.
 *
 * Mirrors Python `message.py`.  The frame format is:
 *
 * ```
 * | Head (1B) | PType (1B) | PVersion (1B) | MsgType (1B) | MsgId (1B)
 * | [RS485Addr (1B)] | DataLen (2B) | Data (NB) | CRC16 (2B) |
 * ```
 */

import { DynamicBuffer } from '../utils/dynamic-buffer.js';
import { hexToBytes, bytesToHex } from '../utils/hex-utils.js';

/** Frame header constant. */
const FRAME_HEADER = 0x5a;

/**
 * Protocol message.
 *
 * Subclasses override {@link pack} and {@link unPack} to handle the
 * message-specific `cData` payload.
 */
export class Message {
  /** Frame header byte (always `0x5A`). */
  head = FRAME_HEADER;
  /** Protocol type. */
  pType = 0x00;
  /** Protocol version. */
  pVersion = 0x01;

  // ── MsgType bit-fields ──────────────────────────────────────────────
  /** Bits 6-7 of the MsgType byte (2 bits, always 0). */
  mt_14_15 = 0;
  /** Bit 5 of the MsgType byte (1 bit). `1` = RS485 mode. */
  mt_13 = 0;
  /** Bit 4 of the MsgType byte (1 bit). `1` = log/push notification. */
  mt_12 = 0;
  /** Bits 0-3 of the MsgType byte (4 bits). Message category. */
  mt_8_11 = 0;

  /** Message ID within the category. */
  msgId = 0xff;

  /** RS485 address byte (only present when `mt_13 === 1`). */
  rs485Address = 0;
  /** Length of the data payload in bytes. */
  dataLen = 0;
  /** Data payload as a byte array. */
  cData: number[] = [];
  /** Bytes that were input to the CRC calculation (all bytes between head and CRC). */
  crcData: number[] = [];
  /** Two-byte CRC value. */
  crc: number[] = [];
  /** Full serialised message bytes. */
  msgData: number[] = [];
  /** Return code from the reader (`-1` = not yet set). */
  rtCode = -1;
  /** Return message / description. */
  rtMsg: string | undefined = undefined;

  // ── Static factory ──────────────────────────────────────────────────

  /**
   * Parse a hex string into a {@link Message} instance.
   *
   * @param hexStr Hex string (with or without `"0x"` prefix).
   * @returns The parsed message.
   * @throws {Error} If the data cannot be parsed.
   */
  static parse(hexStr: string): Message {
    const msg = new Message();

    const clean = hexStr.startsWith('0x') || hexStr.startsWith('0X')
      ? hexStr
      : '0x' + hexStr;

    const bitBuffer = new DynamicBuffer(clean);
    msg.msgData = bitBuffer.toByteArray();

    msg.head = bitBuffer.readUint8();
    msg.pType = bitBuffer.readUint8();
    msg.pVersion = bitBuffer.readUint8();

    // MsgType byte — 2+1+1+4 bits
    msg.mt_14_15 = bitBuffer.readBits(2);
    msg.mt_13 = bitBuffer.readBits(1);
    msg.mt_12 = bitBuffer.readBits(1);
    msg.mt_8_11 = bitBuffer.readBits(4);

    msg.msgId = bitBuffer.readUint8();

    if (msg.mt_13 === 1) {
      msg.rs485Address = bitBuffer.readUint8();
    }

    msg.dataLen = bitBuffer.readUint16BE();

    if (msg.dataLen) {
      msg.cData = bitBuffer.readByteArray(msg.dataLen * 8) ?? [];
    }

    msg.crc = bitBuffer.readByteArray(16) ?? [];

    // crcData = all bytes between head and CRC (i.e. bytes [1 .. len-3])
    bitBuffer.pos = 8; // skip head byte
    msg.crcData = bitBuffer.readByteArray((msg.msgData.length - 3) * 8) ?? [];

    return msg;
  }

  // ── Serialise ───────────────────────────────────────────────────────

  /**
   * Serialise this message to a byte array.
   *
   * @param is485 Whether to include the RS485 address byte.
   * @returns The complete frame as `number[]`.
   */
  toBytes(is485: boolean): number[] {
    const buf = new DynamicBuffer();

    buf.putUint8(this.head).putUint8(this.pType).putUint8(this.pVersion);

    // Upper nibble of MsgType: mt_14_15 (2 bits) | mt_13 (1 bit) | mt_12 (1 bit)
    const upperNibble = ((this.mt_14_15 & 0x3) << 2)
      | ((this.mt_13 & 0x1) << 1)
      | (this.mt_12 & 0x1);
    buf.putBits(4, upperNibble);

    // Lower nibble of MsgType: mt_8_11
    buf.putBits(4, this.mt_8_11 & 0xf);

    buf.putUint8(this.msgId);

    if (is485) {
      buf.putUint8(this.rs485Address);
    }

    buf.putUint16BE(this.dataLen);

    if (this.cData && this.cData.length === this.dataLen) {
      buf.putBytes(this.cData);
    }

    // CRC is computed over everything after the head byte.
    // buf.hex gives the full hex; slice(2) skips the first byte (head = 0x5A).
    const crcHex = Message.crc16XmodemHex(buf.hex.slice(2));
    this.crcData = hexToBytes(crcHex);
    this.crc = this.crcData;

    buf.putBytes(this.crc);

    this.msgData = buf.toByteArray();
    return this.msgData;
  }

  // ── Virtual hooks for subclasses ────────────────────────────────────

  /**
   * Serialise subclass-specific fields into {@link cData}.
   * Override in subclasses.
   */
  pack(): void {
    /* no-op — subclasses override */
  }

  /**
   * Deserialise {@link cData} into subclass-specific fields.
   * Override in subclasses.
   */
  unPack(): void {
    /* no-op — subclasses override */
  }

  // ── Key / CRC helpers ──────────────────────────────────────────────

  /**
   * Correlation key used to match a request to its response.
   * @returns `"<mt_8_11><msgId>"` string.
   */
  toKey(): string {
    return String(this.mt_8_11) + String(this.msgId);
  }

  /**
   * Verify the CRC of a previously parsed message.
   * @returns `true` if the CRC is valid.
   */
  checkCrc(): boolean {
    if (!this.crcData.length || !this.crc.length) {
      return false;
    }
    const expected = Message.crc16XmodemHex(this.crcData);
    const actual = bytesToHex(this.crc);
    return expected === actual;
  }

  // ── Static CRC utilities ───────────────────────────────────────────

  /**
   * Compute CRC16-XMODEM.
   *
   * Polynomial `0x1021`, initial value `0x0000`.
   *
   * @param data Byte array or hex string.
   * @returns 16-bit CRC value.
   */
  static crc16Xmodem(data: number[] | string): number {
    const bytes: number[] = typeof data === 'string' ? hexToBytes(data) : data;
    let crc = 0x0000;
    const polynomial = 0x1021;
    for (const byte of bytes) {
      for (let i = 0; i < 8; i++) {
        const bit = ((byte >> (7 - i)) & 1) === 1;
        const c15 = ((crc >> 15) & 1) === 1;
        crc <<= 1;
        if (c15 !== bit) {
          crc ^= polynomial;
        }
      }
    }
    return crc & 0xffff;
  }

  /**
   * Compute CRC16-XMODEM and return the result as a zero-padded hex string.
   *
   * @param data Byte array or hex string.
   * @returns 4-character lower-case hex string (e.g. `"065c"`).
   */
  static crc16XmodemHex(data: number[] | string): string {
    return Message.crc16Xmodem(data).toString(16).padStart(4, '0');
  }
}
