/**
 * Serial port discovery utilities.
 *
 * Replaces Python `serial_utils.py`.
 * Uses the `serialport` npm package.
 */

/**
 * List available serial port device paths.
 * @returns Promise resolving to an array of device path strings (e.g. `["/dev/ttyUSB0"]`).
 */
export async function getSerials(): Promise<string[]> {
  // Dynamic import avoids requiring the native `serialport` addon at module load
  // time, so environments that don't need serial access won't fail on import.
  const { SerialPort } = await import('serialport');
  const ports = await SerialPort.list();
  return ports.map((p) => p.path);
}
