/**
 * EPC inventory-over push notification.
 *
 * Mirrors Python `log_base_epc_over.py`.  Sent by the reader when an
 * EPC inventory round finishes (complete, stopped, or hardware error).
 */

import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';

/** Completion reason descriptions indexed by code. */
const OVER_MESSAGES: Record<number, string> = {
  0: 'Single operation complete.',
  1: 'Receive stop instruction.',
  2: 'A hardware failure causes an interrupt.',
};

/**
 * Log message indicating an EPC inventory round has ended.
 */
export class LogBaseEpcOver extends Message {
  /** Reader serial number (set externally after reception). */
  readerSerialNumber: string | undefined = undefined;
  /** Reader name (set externally after reception). */
  readerName: string | undefined = undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseLogMid_EpcOver;
  }

  /** @inheritdoc */
  pack(): void {
    super.pack();
  }

  /**
   * Deserialise the data payload.
   *
   * The single data byte is the completion reason code.
   */
  unPack(): void {
    if (!this.cData || this.cData.length === 0) return;

    this.rtCode = this.cData[0];
    if (this.rtCode in OVER_MESSAGES) {
      this.rtMsg = OVER_MESSAGES[this.rtCode];
    }
  }
}
