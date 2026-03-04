import { DynamicBuffer } from './dynamic-buffer.js';
import { bytesToHex } from './hex-utils.js';

/**
 * Protocol Control (PC) word utility functions.
 *
 * Replaces Python `pcUtils.py`. Used for computing PC values and
 * assembling EPC / GB data payloads.
 */

/**
 * Compute the PC word-count length from a hex value string.
 * @param value Hex string of the data content.
 * @returns Number of 16-bit words required, or `undefined` if value is empty.
 */
export function getPcLen(value: string): number | undefined {
  if (!value) {
    return undefined;
  }
  const t1 = Math.floor(value.length / 4);
  const t2 = value.length % 4;
  if (t2 === 0) {
    return t1;
  }
  return t1 + 1;
}

/**
 * Compute the EPC PC value as a 4-character hex string.
 * @param value Hex string of the EPC content.
 * @returns 4-character hex string representing the PC word.
 */
export function getPcValue(value: string): string {
  const pcLen = getPcLen(value);
  if (pcLen === undefined) {
    return '';
  }
  const iPc = pcLen << 11;
  const buffer = new DynamicBuffer();
  buffer.putUint32BE(iPc);
  buffer.pos = 16;
  const bytes = buffer.readByteArray(16);
  return bytes ? bytesToHex(bytes) : '';
}

/**
 * Build the full EPC write payload: PC value + content padded to word boundary.
 * @param value Hex string of the EPC content.
 * @returns Hex string of PC + padded content.
 */
export function getEpcData(value: string): string {
  const pcLen = getPcLen(value);
  if (pcLen === undefined) {
    return '';
  }
  const valueLen = pcLen * 4;
  const pcValue = getPcValue(value);
  return pcValue + value.padEnd(valueLen, '0');
}

/**
 * Compute the GB (国标) PC value as a 4-character hex string.
 * @param value Hex string of the GB content.
 * @returns 4-character hex string representing the GB PC word.
 */
export function getGbPcValue(value: string): string {
  const pcLen = getPcLen(value);
  if (pcLen === undefined) {
    return '';
  }
  const iPc = pcLen << 8;
  const buffer = new DynamicBuffer();
  buffer.putUint32BE(iPc);
  buffer.pos = 16;
  const bytes = buffer.readByteArray(16);
  return bytes ? bytesToHex(bytes) : '';
}

/**
 * Build the full GB write payload: PC value + content padded to word boundary.
 * @param value Hex string of the GB content.
 * @returns Hex string of PC + padded content.
 */
export function getGbData(value: string): string {
  const pcLen = getPcLen(value);
  if (pcLen === undefined) {
    return '';
  }
  const valueLen = pcLen * 4;
  const pcValue = getGbPcValue(value);
  return pcValue + value.padEnd(valueLen, '0');
}
