/**
 * Get TCP mode command / response.
 *
 * Mirrors Python `app_get_tcpMode.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

/**
 * Retrieves the reader's TCP mode configuration including
 * mode, server port, client IP, and client port.
 */
export class MsgAppGetTcpMode extends Message {
  /** TCP mode (0 = server, 1 = client). */
  tcpMode: number | undefined = undefined;
  /** Server port. */
  serverPort: number | undefined = undefined;
  /** Client target IP. */
  clientIp: string | undefined = undefined;
  /** Client target port. */
  clientPort: number | undefined = undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_GetTcpMode;
  }

  /** @inheritdoc */
  override pack(): void {
    super.pack();
  }

  /**
   * Deserialise the data payload.
   *
   * Layout: tcpMode (uint8) + serverPort (uint16) +
   * clientIp (4×uint8) + clientPort (uint16).
   */
  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);
    this.tcpMode = buffer.readUint8();
    this.serverPort = buffer.readUint16BE();
    this.clientIp =
      buffer.readUint8() + '.' + buffer.readUint8() + '.' +
      buffer.readUint8() + '.' + buffer.readUint8();
    this.clientPort = buffer.readUint16BE();
    this.rtCode = 0;
  }

  /**
   * @returns Tuple-like string of TCP mode settings.
   */
  toString(): string {
    return `(${this.tcpMode}, ${this.serverPort}, ${this.clientIp}, ${this.clientPort})`;
  }
}
