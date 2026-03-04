/**
 * Set TCP mode command / response.
 *
 * Mirrors Python `app_set_tpcMode.py`.
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Server IP parameter error.',
};

/** Options for configuring TCP mode. */
export interface TcpModeOptions {
  serverPort?: number;
  clientIp?: string;
  clientPort?: number;
}

/**
 * Configures the reader's TCP mode (server or client) and
 * associated connection parameters.
 */
export class MsgAppSetTcpMode extends Message {
  /** TCP mode (0 = server, 1 = client). */
  tcpMode: number;
  /** Server port (server mode). */
  serverPort: number | undefined;
  /** Client target IP (client mode). */
  clientIp: string | undefined;
  /** Client target port (client mode). */
  clientPort: number | undefined;

  constructor(tcpMode: number, opts?: TcpModeOptions) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_SetTcpMode;
    this.tcpMode = tcpMode;
    this.serverPort = opts?.serverPort;
    this.clientIp = opts?.clientIp;
    this.clientPort = opts?.clientPort;
  }

  /** @inheritdoc */
  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint8(this.tcpMode);
    if (this.tcpMode === 0) {
      if (this.serverPort !== undefined) {
        buffer.putUint8(0x01);
        buffer.putUint16BE(this.serverPort);
      }
    } else {
      if (this.clientIp !== undefined) {
        buffer.putUint8(0x02);
        for (const octet of this.clientIp.split('.')) {
          buffer.putUint8(Number(octet));
        }
      }
      if (this.clientPort !== undefined) {
        buffer.putUint8(0x03);
        buffer.putUint16BE(this.clientPort);
      }
    }
    this.cData = buffer.toByteArray();
    this.dataLen = buffer.bitLength / 8;
  }

  /** @inheritdoc */
  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    this.rtCode = this.cData[0];
    this.rtMsg = RT_MESSAGES[this.rtCode];
  }
}
