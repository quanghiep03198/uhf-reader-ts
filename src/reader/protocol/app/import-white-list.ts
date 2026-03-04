import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Fail.',
};

export class MsgAppImportWhiteList extends Message {
  /** Packet number. */
  packetNumber: number;
  /** Packet content bytes. */
  packetContent: number[] = [];

  constructor(packetNumber: number) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_ImportWhiteList;
    this.packetNumber = packetNumber;
  }

  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint32BE(this.packetNumber);
    if (this.packetContent.length > 0) {
      buffer.putUint16BE(this.packetContent.length);
      buffer.putBytes(this.packetContent);
    } else {
      buffer.putUint16BE(0);
    }
    this.cData = buffer.toByteArray();
    this.dataLen = buffer.bitLength / 8;
  }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);
    this.packetNumber = buffer.readUint32BE();
    const result = buffer.readUint8();
    this.rtCode = result;
    this.rtMsg = RT_MESSAGES[this.rtCode];
  }
}
