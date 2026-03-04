import { Parameter } from '../parameter.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Parameter for enabling FastID and TagFocus during EPC inventory.
 */
export class ParamEpcFastId extends Parameter {
  /** FastID enable flag (0 = disabled, 1 = enabled). */
  fastId: number;
  /** TagFocus enable flag (0 = disabled, 1 = enabled). */
  tagFoucs: number;

  /**
   * @param fastId   FastID enable flag.
   * @param tagFoucs TagFocus enable flag.
   */
  constructor(fastId: number, tagFoucs: number) {
    super();
    this.fastId = fastId;
    this.tagFoucs = tagFoucs;
  }

  /**
   * Serialise this parameter into a byte array.
   * @returns Array of byte values (0-255).
   */
  toBytes(): number[] {
    const buffer = new DynamicBuffer();
    buffer.putUint8(this.fastId);
    buffer.putUint8(this.tagFoucs);
    return buffer.toByteArray();
  }

  /**
   * Populate this parameter from a byte array.
   * @param data Array of byte values (0-255).
   */
  fromBytes(data: number[]): void {
    const buffer = new DynamicBuffer('0x' + bytesToHex(data));
    this.fastId = buffer.readUint8();
    this.tagFoucs = buffer.readUint8();
  }

  /** String representation for debugging. */
  toString(): string {
    return `(${this.fastId}, ${this.tagFoucs})`;
  }
}
