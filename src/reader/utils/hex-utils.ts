/**
 * Hex conversion utility functions.
 *
 * Replaces Python `HexUtils.py`.
 */

/**
 * Convert a hex string to an array of byte values.
 * @param hex Hex string (e.g. "aabbcc"). Must have even length.
 * @returns Array of byte values (0-255).
 */
export function hexToBytes(hex: string): number[] {
  const buf = Buffer.from(hex, 'hex');
  return Array.from(buf);
}

/**
 * Convert an array of byte values to a lower-case hex string.
 * @param arr Array of byte values (0-255).
 * @returns Lower-case hex string.
 */
export function bytesToHex(arr: number[]): string {
  return Buffer.from(arr).toString('hex');
}

/**
 * Convert a hex string to an unsigned integer (big-endian).
 * @param hexValue Hex string (e.g. "ff" → 255).
 * @returns Unsigned integer value.
 */
export function hexToInt(hexValue: string): number {
  const bytes = hexToBytes(hexValue);
  let result = 0;
  for (const b of bytes) {
    result = result * 256 + b;
  }
  return result;
}

/**
 * Convert an array of byte values to an ASCII string.
 * @param list Array of char-code values.
 * @returns ASCII string.
 */
export function listToAscii(list: number[]): string {
  return list.map((x) => String.fromCharCode(x)).join('');
}
