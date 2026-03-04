/**
 * DynamicBuffer — bit-level read/write buffer.
 *
 * Replaces Python's `bitstring.BitStream`-based `DynamicBuffer`.
 * Supports arbitrary bit-width reads and writes (not just byte-aligned).
 */
export class DynamicBuffer {
  /** Internal byte storage. Grows as needed. */
  private _buf: Buffer;
  /** Total number of bits that have been written. */
  private _bitLength: number;
  /** Current read position in bits. */
  private _pos: number;
  /** Allocated capacity in bytes. */
  private _capacity: number;

  /**
   * Create a new DynamicBuffer.
   * @param hexStr Optional hex string to initialise the buffer with pre-existing data.
   *   Accepts with or without `"0x"` prefix (e.g. `"0xaabb"` or `"aabb"`).
   */
  constructor(hexStr?: string) {
    if (hexStr !== undefined) {
      const clean = hexStr.startsWith('0x') || hexStr.startsWith('0X')
        ? hexStr.slice(2)
        : hexStr;
      if (clean.length === 0) {
        this._buf = Buffer.alloc(64);
        this._capacity = 64;
        this._bitLength = 0;
      } else {
        const bytes = Buffer.from(clean, 'hex');
        this._capacity = Math.max(bytes.length * 2, 64);
        this._buf = Buffer.alloc(this._capacity);
        bytes.copy(this._buf);
        this._bitLength = bytes.length * 8;
      }
    } else {
      this._buf = Buffer.alloc(64);
      this._capacity = 64;
      this._bitLength = 0;
    }
    this._pos = 0;
  }

  // ---------------------------------------------------------------------------
  // Properties
  // ---------------------------------------------------------------------------

  /** Total bits written into the buffer. */
  get bitLength(): number {
    return this._bitLength;
  }

  /** Current read position in bits. */
  get pos(): number {
    return this._pos;
  }

  set pos(value: number) {
    this._pos = value;
  }

  /**
   * Hex string representation of the entire buffer content (only the written portion).
   * @returns Lower-case hex string.
   */
  get hex(): string {
    const byteLen = Math.ceil(this._bitLength / 8);
    return this._buf.subarray(0, byteLen).toString('hex');
  }

  /**
   * Return the written bytes as a `number[]`.
   * Alias for {@link toByteArray} matching the Python `tobytes` property name.
   * @returns Array of byte values (0-255).
   */
  get toBytes(): number[] {
    return this.toByteArray();
  }

  // ---------------------------------------------------------------------------
  // Write helpers (private)
  // ---------------------------------------------------------------------------

  /** Ensure the internal buffer has room for at least `extraBits` more bits. */
  private ensureCapacity(extraBits: number): void {
    const requiredBytes = Math.ceil((this._bitLength + extraBits) / 8);
    if (requiredBytes > this._capacity) {
      const newCap = Math.max(this._capacity * 2, requiredBytes * 2);
      const newBuf = Buffer.alloc(newCap);
      this._buf.copy(newBuf, 0, 0, Math.ceil(this._bitLength / 8));
      this._buf = newBuf;
      this._capacity = newCap;
    }
  }

  /**
   * Write `bitLen` bits of `value` (unsigned) into the buffer at the current
   * write position (`this._bitLength`). Bits are written MSB-first.
   */
  private writeBitsUnsigned(bitLen: number, value: number): void {
    this.ensureCapacity(bitLen);
    for (let i = bitLen - 1; i >= 0; i--) {
      const bit = (value >>> i) & 1;
      const byteIndex = Math.floor(this._bitLength / 8);
      const bitOffset = 7 - (this._bitLength % 8);
      if (bit) {
        this._buf[byteIndex] |= 1 << bitOffset;
      } else {
        this._buf[byteIndex] &= ~(1 << bitOffset);
      }
      this._bitLength++;
    }
  }

  // ---------------------------------------------------------------------------
  // Read helpers (private)
  // ---------------------------------------------------------------------------

  /**
   * Read `bitLen` bits starting from `this._pos` as an unsigned integer.
   * Advances `this._pos` by `bitLen`.
   */
  private readBitsUnsigned(bitLen: number): number {
    if (this._pos + bitLen > this._bitLength) {
      throw new RangeError(
        `Cannot read ${bitLen} bits at pos ${this._pos}; only ${this._bitLength - this._pos} bits available`,
      );
    }
    let value = 0;
    for (let i = 0; i < bitLen; i++) {
      const byteIndex = Math.floor(this._pos / 8);
      const bitOffset = 7 - (this._pos % 8);
      const bit = (this._buf[byteIndex] >>> bitOffset) & 1;
      value = (value << 1) | bit;
      this._pos++;
    }
    return value >>> 0; // ensure unsigned 32-bit
  }

  // ---------------------------------------------------------------------------
  // Public write methods
  // ---------------------------------------------------------------------------

  /**
   * Write `bitLen` bits of an unsigned integer value.
   * @param bitLen Number of bits to write (1-32).
   * @param value  Unsigned integer value.
   * @returns `this` for chaining.
   */
  putBits(bitLen: number, value: number): this {
    this.writeBitsUnsigned(bitLen, value);
    return this;
  }

  /**
   * Write `bitLen` bits of a signed integer value (two's complement).
   * @param bitLen Number of bits to write (1-32).
   * @param value  Signed integer value.
   * @returns `this` for chaining.
   */
  putSigned(bitLen: number, value: number): this {
    // Convert signed to unsigned representation in the given bit width.
    const unsigned = value < 0 ? (1 << bitLen) + value : value;
    this.writeBitsUnsigned(bitLen, unsigned);
    return this;
  }

  /**
   * Write an 8-bit unsigned integer.
   * @param value Byte value (0-255).
   * @returns `this` for chaining.
   */
  putUint8(value: number): this {
    this.writeBitsUnsigned(8, value & 0xff);
    return this;
  }

  /**
   * Write a 16-bit unsigned integer in big-endian byte order.
   * @param value 16-bit value (0-65535).
   * @returns `this` for chaining.
   */
  putUint16BE(value: number): this {
    this.writeBitsUnsigned(16, value & 0xffff);
    return this;
  }

  /**
   * Write a 32-bit unsigned integer in big-endian byte order.
   * @param value 32-bit value.
   * @returns `this` for chaining.
   */
  putUint32BE(value: number): this {
    this.writeBitsUnsigned(32, value >>> 0);
    return this;
  }

  /**
   * Write an array of bytes.
   * @param bytes Array of byte values (0-255). `null`/`undefined` is a no-op.
   * @returns `this` for chaining.
   */
  putBytes(bytes: number[] | undefined | null): this {
    if (bytes) {
      for (const b of bytes) {
        this.putUint8(b);
      }
    }
    return this;
  }

  // ---------------------------------------------------------------------------
  // Public read methods
  // ---------------------------------------------------------------------------

  /**
   * Read an 8-bit unsigned integer.
   * @returns Byte value (0-255).
   */
  readUint8(): number {
    return this.readBitsUnsigned(8);
  }

  /**
   * Read a 16-bit unsigned integer (big-endian).
   * @returns 16-bit unsigned value.
   */
  readUint16BE(): number {
    return this.readBitsUnsigned(16);
  }

  /**
   * Read a 32-bit unsigned integer (big-endian).
   * @returns 32-bit unsigned value.
   */
  readUint32BE(): number {
    return this.readBitsUnsigned(32);
  }

  /**
   * Read `n` bits as an unsigned integer.
   * @param n Number of bits to read (1-32).
   * @returns Unsigned integer value.
   */
  readBits(n: number): number {
    return this.readBitsUnsigned(n);
  }

  /**
   * Read `n` bits as a signed integer (two's complement).
   * @param n Number of bits to read (1-32).
   * @returns Signed integer value.
   */
  readSigned(n: number): number {
    const raw = this.readBitsUnsigned(n);
    // Check sign bit
    const signBit = 1 << (n - 1);
    if (raw & signBit) {
      // Negative: extend sign
      return raw - (1 << n);
    }
    return raw;
  }

  /**
   * Read `bitLen` bits worth of bytes (bitLen must be a multiple of 8).
   * @param bitLen Number of bits to read (must be divisible by 8).
   * @returns Array of byte values, or `undefined` if `bitLen` is 0 / falsy.
   */
  readByteArray(bitLen: number): number[] | undefined {
    if (!bitLen) {
      return undefined;
    }
    const byteCount = Math.floor(bitLen / 8);
    const result: number[] = [];
    for (let i = 0; i < byteCount; i++) {
      result.push(this.readUint8());
    }
    return result;
  }

  // ---------------------------------------------------------------------------
  // Position helpers
  // ---------------------------------------------------------------------------

  /**
   * Advance the read position by `bitLen` bits.
   * @param bitLen Number of bits to skip.
   */
  addPos(bitLen: number): void {
    this._pos += bitLen;
  }

  /**
   * Set the read position to an absolute bit offset.
   * @param bitLen Absolute bit position.
   */
  setPos(bitLen: number): void {
    this._pos = bitLen;
  }

  // ---------------------------------------------------------------------------
  // Utility
  // ---------------------------------------------------------------------------

  /**
   * Return the written bytes as a `number[]`.
   * @returns Array of byte values (0-255).
   */
  toByteArray(): number[] {
    const byteLen = Math.ceil(this._bitLength / 8);
    const result: number[] = [];
    for (let i = 0; i < byteLen; i++) {
      result.push(this._buf[i]);
    }
    return result;
  }

  /**
   * Reset the buffer, clearing all data.
   */
  clear(): void {
    this._buf.fill(0);
    this._bitLength = 0;
    this._pos = 0;
  }
}
