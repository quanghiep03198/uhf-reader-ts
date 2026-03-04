import { Parameter } from '../parameter.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Parameter for reading user data from ISO 18000-6B tags.
 */
export class Param6bReadUserData extends Parameter {
  /** Byte offset to start reading from. */
  start: number;
  /** Number of bytes to read. */
  dataLen: number;

  /**
   * @param start   Byte offset to start reading from.
   * @param dataLen Number of bytes to read.
   */
  constructor(start: number, dataLen: number) {
    super();
    this.start = start;
    this.dataLen = dataLen;
  }

  /**
   * Serialise this parameter into a byte array.
   * @returns Array of byte values (0-255).
   */
  toBytes(): number[] {
    const buffer = new DynamicBuffer();
    buffer.putUint8(this.start);
    buffer.putUint8(this.dataLen);
    return buffer.toByteArray();
  }

  /**
   * Populate this parameter from a byte array.
   * @param data Array of byte values (0-255).
   */
  fromBytes(data: number[]): void {
    const buffer = new DynamicBuffer('0x' + bytesToHex(data));
    this.start = buffer.readUint8();
    this.dataLen = buffer.readUint8();
  }

  /** String representation for debugging. */
  toString(): string {
    return `(${this.start}, ${this.dataLen})`;
  }
}
