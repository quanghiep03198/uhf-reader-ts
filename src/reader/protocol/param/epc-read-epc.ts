import { Parameter } from '../parameter.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Parameter for reading EPC memory bank during inventory.
 */
export class ParamEpcReadEpc extends Parameter {
  /** Word offset to start reading from. */
  start: number;
  /** Number of bytes to read. */
  dataLen: number;

  /**
   * @param start   Word offset to start reading from.
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
    buffer.putUint16BE(this.start);
    buffer.putUint8(this.dataLen);
    return buffer.toByteArray();
  }

  /**
   * Populate this parameter from a byte array.
   * @param data Array of byte values (0-255).
   */
  fromBytes(data: number[]): void {
    const buffer = new DynamicBuffer('0x' + bytesToHex(data));
    this.start = buffer.readUint16BE();
    this.dataLen = buffer.readUint8();
  }

  /** String representation for debugging. */
  toString(): string {
    return `(${this.start}, ${this.dataLen})`;
  }
}
