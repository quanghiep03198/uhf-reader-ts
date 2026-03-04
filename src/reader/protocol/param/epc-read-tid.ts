import { Parameter } from '../parameter.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Parameter for configuring TID reading during EPC inventory.
 */
export class ParamEpcReadTid extends Parameter {
  /** Read mode / memory area. */
  area: number;
  /** Number of bytes to read. */
  dataLen: number;

  /**
   * @param mode    Read mode / memory area.
   * @param dataLen Number of bytes to read.
   */
  constructor(mode: number, dataLen: number) {
    super();
    this.area = mode;
    this.dataLen = dataLen;
  }

  /**
   * Serialise this parameter into a byte array.
   * @returns Array of byte values (0-255).
   */
  toBytes(): number[] {
    const buffer = new DynamicBuffer();
    buffer.putUint8(this.area);
    buffer.putUint8(this.dataLen);
    return buffer.toByteArray();
  }

  /**
   * Populate this parameter from a byte array.
   * @param data Array of byte values (0-255).
   */
  fromBytes(data: number[]): void {
    const buffer = new DynamicBuffer('0x' + bytesToHex(data));
    this.area = buffer.readUint8();
    this.dataLen = buffer.readUint8();
  }

  /** String representation for debugging. */
  toString(): string {
    return `(${this.area}, ${this.dataLen})`;
  }
}
