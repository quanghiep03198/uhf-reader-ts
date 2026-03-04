import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

export class MsgAppGetWhiteList extends Message {
  /** Packet number. */
  packetNumber: number;
  /** Packet content bytes. */
  packetContent: number[] = [];

  constructor(packetNumber: number) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_GetWhiteList;
    this.packetNumber = packetNumber;
  }

  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint32BE(this.packetNumber);
    this.cData = buffer.toByteArray();
    this.dataLen = buffer.bitLength / 8;
  }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);
    this.packetNumber = buffer.readUint32BE();
    const pnLen = buffer.readUint16BE();
    if (pnLen) {
      this.packetContent = buffer.readByteArray(pnLen * 8) ?? [];
    }
    this.rtCode = 0;
  }

  toString(): string {
    return `(${this.packetNumber}, [${this.packetContent.join(', ')}])`;
  }
}
