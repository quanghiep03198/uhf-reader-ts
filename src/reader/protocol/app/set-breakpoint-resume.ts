import { Message } from '../message.js';
import { EnumG } from '../enum-g.js';
import { DynamicBuffer } from '../../utils/dynamic-buffer.js';

const RT_MESSAGES: Record<number, string> = {
  0: 'Success',
  1: 'Set Fail.',
};

export class MsgAppSetBreakpointResume extends Message {
  /** Breakpoint resume switch (0 = off, 1 = on). */
  breakpointSwitch: number;

  constructor(breakpointSwitch: number) {
    super();
    this.mt_8_11 = EnumG.Msg_Type_Bit_App;
    this.msgId = EnumG.AppMid_SetBreakpointResume;
    this.breakpointSwitch = breakpointSwitch;
  }

  override pack(): void {
    const buffer = new DynamicBuffer();
    buffer.putUint8(this.breakpointSwitch);
    this.cData = buffer.toByteArray();
    this.dataLen = buffer.bitLength / 8;
  }

  override unPack(): void {
    if (!this.cData || this.cData.length === 0) return;
    this.rtCode = this.cData[0];
    this.rtMsg = RT_MESSAGES[this.rtCode];
  }
}
