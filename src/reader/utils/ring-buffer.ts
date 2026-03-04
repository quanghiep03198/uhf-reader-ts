import { DynamicBuffer } from './dynamic-buffer.js';
/**
 * RingBuffer — circular buffer for incoming byte data.
 *
 * Replaces Python `ring_buffer.py`. All position tracking (`dataCount`,
 * `dataHead`, `dataEnd`) is in **bits**, not bytes.
 */
export class RingBuffer {
  /** Internal dynamic buffer for storage. */
  private buffer: DynamicBuffer;

  /** Number of unread bits available. */
  dataCount: number;

  /** Read head position in bits. */
  dataHead: number;

  /** Write end position in bits. */
  dataEnd: number;

  constructor() {
    this.buffer = new DynamicBuffer();
    this.buffer.pos = 0;
    this.dataCount = 0;
    this.dataHead = 0;
    this.dataEnd = 0;
  }

  /**
   * Reset counters without clearing underlying buffer data.
   */
  reset(): void {
    this.dataCount = 0;
    this.dataHead = 0;
    this.dataEnd = 0;
  }

  /**
   * Append bytes to the buffer.
   * @param data Array of byte values (0-255).
   */
  writeData(data: number[]): void {
    this.buffer.putBytes(data);
    this.dataEnd += data.length * 8;
    this.dataCount += data.length * 8;
  }

  /**
   * Read `bitLen` bits as bytes (bitLen must be a multiple of 8).
   * Advances the read head.
   * @param bitLen Number of bits to read.
   * @returns Array of byte values, or `undefined` if not enough data.
   */
  readData(bitLen: number): number[] | undefined {
    if (this.dataCount && bitLen <= this.dataCount) {
      const bytes = this.buffer.readByteArray(bitLen);
      this.dataHead += bitLen;
      this.dataCount -= bitLen;
      return bytes;
    }
    return undefined;
  }

  /**
   * Read `bitLen` bits as an unsigned integer. Advances the read head.
   * @param bitLen Number of bits to read.
   * @returns Unsigned integer value, or 0 if not enough data.
   */
  readBit(bitLen: number): number {
    if (this.dataCount) {
      if (bitLen <= this.dataCount) {
        this.dataHead += bitLen;
        this.dataCount -= bitLen;
        return this.buffer.readBits(bitLen);
      }
      return 0;
    }
    return 0;
  }

  /**
   * Peek at the byte at the current read position without advancing.
   * @param pos Bit-offset to check (must be less than `dataCount`).
   * @returns Byte value, or `undefined` if out of range.
   */
  indexData(pos: number): number | undefined {
    if (pos < this.dataCount && this.dataCount > 0) {
      const value = this.buffer.readUint8();
      this.buffer.pos -= 8;
      return value;
    }
    return undefined;
  }

  /**
   * Skip `bitLen` bits of data, discarding them.
   * @param bitLen Number of bits to discard.
   */
  cleanData(bitLen: number): void {
    if (bitLen > this.dataCount) {
      this.reset();
      this.buffer.clear();
    } else {
      this.dataHead += bitLen;
      this.dataCount -= bitLen;
      this.buffer.pos += bitLen;
    }
  }

  /**
   * Clear the underlying buffer if all data has been consumed.
   */
  cleanAll(): void {
    if (this.dataHead === this.dataEnd) {
      this.buffer.clear();
    }
  }

  /**
   * Back up the read position by `pos` bits.
   * @param pos Number of bits to rewind.
   */
  subPos(pos: number): void {
    if (pos <= this.buffer.pos) {
      this.buffer.pos -= pos;
      this.dataCount += pos;
      this.dataHead -= pos;
    }
  }
}


