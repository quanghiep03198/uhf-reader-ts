import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

export class MsgAppHeartbeat extends Message {
  /** Serial number for the heartbeat. */
  serialNumber: number;

  constructor(serialNumber: number) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_Heartbeat;
    this.serialNumber = serialNumber;
  }

  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint32BE(this.serialNumber);
    this.cData = buffer.toByteArray();
    this.dataLen = buffer.bitLength / 8;
  }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);
    this.serialNumber = buffer.readUint32BE();
    this.rtCode = 0;
  }
}
