/**
 * GJB inventory-over push notification.
 *
 * Mirrors Python `log_base_gjb_over.py`.  Sent by the reader when a GJB
 * inventory round finishes.
 *
 * Note: The Python source uses `BaseLogMid_GJb` (0x40) for msgId, but the
 * enum defines a dedicated `BaseLogMid_GJbOver` (0x41).  We use the
 * dedicated over enum value to match the convention of all other over classes.
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
 * Log message indicating a GJB inventory round has ended.
 */
export class LogBaseGJbOver extends Message {
  /** Reader serial number (set externally after reception). */
  readerSerialNumber: string | undefined = undefined;
  /** Reader name (set externally after reception). */
  readerName: string | undefined = undefined;

  constructor() {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_Base;
    this.msgId = EnumG.BaseLogMid_GJbOver;
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
