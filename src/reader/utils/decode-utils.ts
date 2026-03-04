/**
 * Decode utility functions.
 *
 * Replaces Python `decodeUtils.py`.
 */

/**
 * Convert an array of numeric char codes to an ASCII string.
 * @param arr Array of byte values representing ASCII character codes.
 * @returns ASCII string, or `undefined` if `arr` is empty / falsy.
 */
export function decodeListToAscii(arr: number[] | undefined | null): string | undefined {
  if (!arr || arr.length === 0) {
    return undefined;
  }
  return arr.map((c) => String.fromCharCode(c)).join('');
}

/**
 * Convert an array of byte values to an ASCII string via `Buffer`.
 * @param arr Array of byte values.
 * @returns ASCII string, or `undefined` if `arr` is empty / falsy.
 */
export function bytesToAscii(arr: number[] | undefined | null): string | undefined {
  if (!arr || arr.length === 0) {
    return undefined;
  }
  return Buffer.from(arr).toString('ascii');
}
