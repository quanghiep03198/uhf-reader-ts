import { Parameter } from '../parameter.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex, hexToBytes } from '../../utils/hex-utils.js';

/**
 * Parameter for safe enciphered (attestation) data operations.
 */
export class ParamSafeEncipheredData extends Parameter {
  /** Word offset to start from. */
  start: number;
  /** Hex string of the enciphered data. */
  enData: string;

  /**
   * @param start  Word offset to start from.
   * @param enData Hex string of the enciphered data.
   */
  constructor(start: number, enData: string) {
    super();
    this.start = start;
    this.enData = enData;
  }

  /**
   * Serialise this parameter into a byte array.
   * @returns Array of byte values (0-255).
   */
  toBytes(): number[] {
    const buffer = new DynamicBuffer();
    buffer.putUint16BE(this.start);
    buffer.putBytes(hexToBytes(this.enData));
    return buffer.toByteArray();
  }

  /**
   * Populate this parameter from a byte array.
   * @param data Array of byte values (0-255).
   */
  fromBytes(data: number[]): void {
    const buffer = new DynamicBuffer('0x' + bytesToHex(data));
    this.start = buffer.readUint16BE();
    const dataLen = buffer.readUint16BE();
    this.enData = bytesToHex(buffer.readByteArray(dataLen * 8) ?? []);
  }

  /** String representation for debugging. */
  toString(): string {
    return `(${this.start}, ${this.enData})`;
  }
}
