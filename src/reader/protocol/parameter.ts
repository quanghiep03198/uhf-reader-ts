/**
 * Abstract base class for protocol parameter structures.
 *
 * Each concrete parameter overrides {@link toBytes} (serialise) and
 * {@link fromBytes} (deserialise).  Mirrors Python `parameter.py`.
 */
export abstract class Parameter {
  /**
   * Serialise this parameter into a byte array.
   * @returns Array of byte values (0-255).
   */
  abstract toBytes(): number[];

  /**
   * Populate this parameter from a byte array.
   * @param data Array of byte values (0-255).
   */
  abstract fromBytes(data: number[]): void;
}
