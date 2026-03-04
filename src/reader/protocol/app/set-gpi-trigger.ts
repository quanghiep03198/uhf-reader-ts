import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';
import { hexToBytes } from '../../utils/hex-utils.js';

const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Port parameter reader hardware is not supported.',
  2: 'Parameters are missing.',
};

export interface GpiTriggerOptions {
  /** Over delay time in ms. */
  overDelayTime?: number;
  /** Level upload switch. */
  levelUploadSwitch?: number;
}

export class MsgAppSetGpiTrigger extends Message {
  /** GPI port number. */
  gpiPort: number;
  /** Trigger start level. */
  triggerStart: number;
  /** Hex string of the trigger command. */
  hexTriggerCommand: string;
  /** Trigger over level. */
  triggerOver: number;
  /** Over delay time. */
  overDelayTime: number | undefined;
  /** Level upload switch. */
  levelUploadSwitch: number | undefined;

  constructor(gpiPort: number, triggerStart: number, hexTriggerCommand: string, triggerOver: number, opts?: GpiTriggerOptions) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_SetGpiTrigger;
    this.gpiPort = gpiPort;
    this.triggerStart = triggerStart;
    this.hexTriggerCommand = hexTriggerCommand;
    this.triggerOver = triggerOver;
    this.overDelayTime = opts?.overDelayTime;
    this.levelUploadSwitch = opts?.levelUploadSwitch;
  }

  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint8(this.gpiPort);
    buffer.putUint8(this.triggerStart);
    if (this.hexTriggerCommand) {
      const cmdBytes = hexToBytes(this.hexTriggerCommand);
      buffer.putUint16BE(cmdBytes.length);
      buffer.putBytes(cmdBytes);
    } else {
      buffer.putUint16BE(0);
    }
    buffer.putUint8(this.triggerOver);
    if (this.overDelayTime !== undefined) {
      buffer.putUint8(0x01);
      buffer.putUint16BE(this.overDelayTime);
    }
    if (this.levelUploadSwitch !== undefined) {
      buffer.putUint8(0x02);
      buffer.putUint8(this.levelUploadSwitch);
    }
    this.cData = buffer.toByteArray();
    this.dataLen = buffer.bitLength / 8;
  }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    this.rtCode = this.cData[0];
    this.rtMsg = RT_MESSAGES[this.rtCode];
  }
}
