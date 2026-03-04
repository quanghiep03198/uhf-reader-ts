import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { bytesToHex } from '../../utils/hex-utils.js';

export class MsgAppGetGpiTrigger extends Message {
  /** GPI port number. */
  gpiPort: number;
  /** Trigger start level. */
  triggerStart: number | undefined = undefined;
  /** Hex string of the trigger command. */
  hexTriggerCommand: string | undefined = undefined;
  /** Trigger over level. */
  triggerOver: number | undefined = undefined;
  /** Over delay time. */
  overDelayTime: number | undefined = undefined;
  /** Level upload switch. */
  levelUploadSwitch: number | undefined = undefined;

  constructor(gpiPort: number) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_GetGpiTrigger;
    this.gpiPort = gpiPort;
  }

  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint8(this.gpiPort);
    this.cData = buffer.toByteArray();
    this.dataLen = buffer.bitLength / 8;
  }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    const hex = bytesToHex(this.cData);
    const buffer = new DynamicBuffer('0x' + hex);
    this.triggerStart = buffer.readUint8();
    const cmdLen = buffer.readUint16BE();
    if (cmdLen) {
      const cmdBytes = buffer.readByteArray(cmdLen * 8);
      if (cmdBytes) this.hexTriggerCommand = bytesToHex(cmdBytes);
    }
    this.triggerOver = buffer.readUint8();
    this.overDelayTime = buffer.readUint16BE();
    this.levelUploadSwitch = buffer.readUint8();
    this.rtCode = 0;
  }

  toString(): string {
    return `(${this.gpiPort}, ${this.triggerStart}, ${this.hexTriggerCommand}, ${this.triggerOver}, ${this.overDelayTime}, ${this.levelUploadSwitch})`;
  }
}
