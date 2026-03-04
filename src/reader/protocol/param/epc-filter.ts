import { Parameter } from '../parameter.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex, hexToBytes } from '../../utils/hex-utils.js';

/**
 * EPC filter parameter used to specify a memory area and bit range for
 * tag filtering during inventory or access operations.
 */
export class ParamEpcFilter extends Parameter {
  /** Memory area to filter on. */
  area: number;
  /** Bit offset where the filter pattern starts. */
  bitStart: number;
  /** Hex string of the filter pattern data. */
  hexData: string;
  /** Length of the filter pattern in bits. */
  bitLength: number;

  /**
   * @param area     Memory area code.
   * @param bitStart Bit offset for the filter start.
   * @param hexData  Hex string of the filter pattern.
   */
  constructor(area: number, bitStart: number, hexData: string) {
    super();
    this.area = area;
    this.bitStart = bitStart;
    this.hexData = hexData;
    this.bitLength = hexData.length * 4;
  }

  /**
   * Serialise this parameter into a byte array.
   * @returns Array of byte values (0-255).
   */
  toBytes(): number[] {
    const buffer = new DynamicBuffer();
    buffer.putUint8(this.area);
    buffer.putUint16BE(this.bitStart);
    buffer.putUint8(this.bitLength);
    buffer.putBytes(hexToBytes(this.hexData));
    return buffer.toByteArray();
  }

  /**
   * Populate this parameter from a byte array.
   * @param data Array of byte values (0-255).
   */
  fromBytes(data: number[]): void {
    const buffer = new DynamicBuffer('0x' + bytesToHex(data));
    this.area = buffer.readUint8();
    this.bitStart = buffer.readUint16BE();
    this.bitLength = buffer.readUint8();
    this.hexData = bytesToHex(buffer.readByteArray(this.bitLength) ?? []);
  }

  /** String representation for debugging. */
  toString(): string {
    return `(${this.area}, ${this.bitStart}, ${this.bitLength}, ${this.hexData})`;
  }
}
