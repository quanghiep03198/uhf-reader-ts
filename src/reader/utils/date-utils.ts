/**
 * Date/time formatting utility functions.
 *
 * Replaces Python `dateUtils.py`.
 */

/**
 * Pad a number to two digits.
 * @param n The number to pad.
 * @returns Zero-padded two-digit string.
 */
function pad2(n: number): string {
  return String(Math.floor(n)).padStart(2, '0');
}

/**
 * Convert seconds to a `DD:HH:MM:SS` formatted string.
 * @param second Total number of seconds.
 * @returns Formatted string `DD:HH:MM:SS`.
 */
export function secondToDhms(second: number): string {
  let s = second;
  const m2 = s % 60;
  s = Math.floor(s / 60);
  const m = s % 60;
  s = Math.floor(s / 60);
  const h = s % 24;
  const d = Math.floor(s / 24);
  return `${pad2(d)}:${pad2(h)}:${pad2(m)}:${pad2(m2)}`;
}

/**
 * Convert seconds to an `HH:MM:SS` formatted string.
 * @param second Total number of seconds.
 * @returns Formatted string `HH:MM:SS`.
 */
export function secondToHms(second: number): string {
  let s = second;
  const sec = s % 60;
  s = Math.floor(s / 60);
  const m = s % 60;
  const h = Math.floor(s / 60);
  return `${pad2(h)}:${pad2(m)}:${pad2(sec)}`;
}

/**
 * Return the current local time as `YYYY-MM-DD HH:MM:SS`.
 * @returns Formatted date-time string.
 */
export function nowTimeStr(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

/**
 * Return the current Unix timestamp in seconds.
 * @returns Integer seconds since Unix epoch.
 */
export function nowTimeSecond(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Format a Unix timestamp (in seconds) as `YYYY-MM-DD HH:MM:SS`.
 * @param second Unix timestamp in seconds.
 * @returns Formatted date-time string.
 */
export function secondFormat(second: number): string {
  const d = new Date(second * 1000);
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}
