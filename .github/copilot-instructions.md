# Copilot Instructions — UHF RFID Reader: Python → TypeScript Conversion

## Project Goal

Convert the Python UHF RFID reader library in `python/reader/` to a fully typed TypeScript library in `src/` (same level as `python/`). The TypeScript version must be a **1:1 functional equivalent** — same protocol, same message structure, same communication patterns — written idiomatically in TypeScript.

## Critical Rules

- **ALWAYS read the corresponding Python source file** before writing any TypeScript file. The Python code in `python/reader/` is the single source of truth.
- **NEVER modify** any file inside `python/`. It is a read-only reference.
- **NEVER use `any`**. Use `unknown` with type guards instead.
- **All public methods/properties MUST have JSDoc.**
- Use **async/await** for all I/O — do NOT emulate Python's threading model.
- Throw **typed custom errors** — never silently catch and ignore exceptions like the Python code does.

## Source Python Structure

```
python/reader/
├── communication/        # Transport layer
│   ├── interface.py      # Base class: CommunicationInter (ring buffer, message parsing loop)
│   ├── serial_client.py  # Serial port transport (pyserial)
│   ├── tcp_client.py     # TCP socket client transport
│   ├── tcp_server.py     # TCP server (accepts reader connections)
│   ├── gclient.py        # GClient: main user API (sync/async msg, callback dispatch)
│   └── gserver.py        # GServer: TCP server that auto-creates GClient per connection
├── protocol/             # Message encode/decode
│   ├── message.py        # Message: frame parse, serialize, CRC16-XMODEM, toKey()
│   ├── parameter.py      # Parameter: base class (toBytes, bytesToClass)
│   ├── enumg.py          # EnumG: all message IDs, antenna numbers, lock modes, etc.
│   ├── app_*.py          # ~45 app-level command/response classes
│   ├── base_*.py         # ~30 baseband/RF command classes
│   ├── log_*.py          # ~8 push notification classes (tag info, over, gpi)
│   ├── param_*.py        # ~8 parameter sub-structures (filter, readTid, etc.)
│   ├── test_*.py         # ~17 factory test command classes
│   ├── upgrade_*.py      # 2 firmware upgrade classes
│   └── action_param_*.py # 2 action result classes
└── utils/                # Utilities
    ├── byteBuffer.py     # DynamicBuffer (extends bitstring.BitStream) — bit-level read/write
    ├── ring_buffer.py    # RingBuffer — circular buffer for incoming data (bit-level tracking)
    ├── HexUtils.py       # hexToBytes, bytesToHex, hexToInt, listToAscii
    ├── decodeUtils.py    # Decode helpers
    ├── pcUtils.py        # PC (Protocol Control) word parsing
    ├── serial_utils.py   # Serial port discovery
    └── dateUtils.py      # Time formatting (secondToDhms, etc.)
```

## Target TypeScript Structure

```
src/
├── index.ts                              # Barrel re-export
├── reader/
│   ├── index.ts
│   ├── communication/
│   │   ├── index.ts
│   │   ├── communication-interface.ts    ← interface.py
│   │   ├── serial-client.ts             ← serial_client.py
│   │   ├── tcp-client.ts                ← tcp_client.py
│   │   ├── tcp-server.ts                ← tcp_server.py
│   │   ├── gclient.ts                   ← gclient.py
│   │   └── gserver.ts                   ← gserver.py
│   ├── protocol/
│   │   ├── index.ts
│   │   ├── message.ts                   ← message.py
│   │   ├── parameter.ts                 ← parameter.py
│   │   ├── enum-g.ts                    ← enumg.py
│   │   ├── app/                         ← app_*.py (one TS file per Python file)
│   │   ├── base/                        ← base_*.py
│   │   ├── log/                         ← log_*.py
│   │   ├── param/                       ← param_*.py
│   │   ├── test/                        ← test_*.py
│   │   └── upgrade/                     ← upgrade_*.py
│   └── utils/
│       ├── index.ts
│       ├── dynamic-buffer.ts            ← byteBuffer.py
│       ├── ring-buffer.ts               ← ring_buffer.py
│       ├── hex-utils.ts                 ← HexUtils.py
│       ├── decode-utils.ts              ← decodeUtils.py
│       ├── pc-utils.ts                  ← pcUtils.py
│       ├── serial-utils.ts              ← serial_utils.py
│       └── date-utils.ts               ← dateUtils.py
tests/
├── utils/                               # Unit tests for buffer, hex, CRC
├── protocol/                            # Message parse/serialize tests
└── communication/                       # GClient integration tests (mocked)
```

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.x, `strict: true`
- **Serial**: `serialport` npm package (replaces Python `pyserial`)
- **TCP**: Node.js built-in `net` module (replaces Python `socket`)
- **Buffer**: Node.js built-in `Buffer` (replaces Python `bitstring`)
- **Test**: Vitest
- **Build**: `tsc` → `dist/`

## Protocol Specification

### Frame Format

```
| Head (1B) | PType (1B) | PVersion (1B) | MsgType (1B)     | MsgId (1B) | [RS485Addr (1B)] | DataLen (2B) | Data (NB)  | CRC16 (2B)   |
| 0x5A      | 0x00       | 0x01          | bit-field below  | per EnumG  | if RS485         | uint16 BE    | variable   | CRC16-XMODEM |
```

### MsgType Byte (bit-field, 8 bits total)

- Bits 6-7 → `mt_14_15` (2 bits): always `00`
- Bit 5 → `mt_13` (1 bit): RS485 flag (`1` = RS485 mode, adds address byte after MsgId)
- Bit 4 → `mt_12` (1 bit): direction (`0` = command/response, `1` = log/push notification)
- Bits 0-3 → `mt_8_11` (4 bits): message category (`1`=App, `2`=Base, `4`=Update, `5`=Test)

### CRC16-XMODEM

- Polynomial `0x1021`, initial value `0x0000`
- Input: all bytes EXCEPT the head byte (0x5A) and the 2 CRC bytes themselves
- Reference implementation: `Message.crc16_Xmodem()` in `python/reader/protocol/message.py`

### Message Matching

- Request→Response correlation key: `String(mt_8_11) + String(msgId)`
- `GClient.__msgDic` stores pending requests keyed by this value

### Message Flows

1. **Synchronous** (`sendSynMsg`): Send → wait with timeout → receive matching response → unpack
2. **Asynchronous** (`senUnSynMsg`): Fire-and-forget
3. **Push/Notification** (`mt_12 == 1`): Dispatched to callbacks (epcInfo, epcOver, 6bInfo, gbInfo, gpiStart, etc.)

## Conversion Rules

### DynamicBuffer (`byteBuffer.py` → `dynamic-buffer.ts`)

**Most critical class.** Python extends `bitstring.BitStream` for bit-level I/O. TypeScript must implement equivalent with Node.js `Buffer`:

| Python Method              | TypeScript Method          | Description                     |
| -------------------------- | -------------------------- | ------------------------------- |
| `putInt(value)`            | `putUint8(value)`          | Write 1 byte unsigned           |
| `putShort(value)`          | `putUint16BE(value)`       | Write 2 bytes big-endian        |
| `putLong(value)`           | `putUint32BE(value)`       | Write 4 bytes big-endian        |
| `putString(bitLen, value)` | `putBits(bitLen, value)`   | Write N bits from value         |
| `putSigned(bitLen, value)` | `putSigned(bitLen, value)` | Write N bits signed             |
| `putBytes(bytes)`          | `putBytes(bytes)`          | Write byte array                |
| `readInt()`                | `readUint8()`              | Read 1 byte unsigned            |
| `readShort()`              | `readUint16BE()`           | Read 2 bytes big-endian         |
| `readLong()`               | `readUint32BE()`           | Read 4 bytes big-endian         |
| `readBitLen(n)`            | `readBits(n)`              | Read N bits as unsigned int     |
| `readSigned(n)`            | `readSigned(n)`            | Read N bits as signed int       |
| `readBytes(bitLen)`        | `readByteArray(bitLen)`    | Read bitLen/8 bytes → number[]  |
| `.hex`                     | `.hex`                     | Get hex string of entire buffer |
| `.tobytes()`               | `.toByteArray()`           | Get number[] (byte values)      |
| `.len`                     | `.bitLength`               | Total bits written              |
| `.pos`                     | `.pos`                     | Current bit position for reads  |

### Message (`message.py` → `message.ts`)

Keep all fields: `head`, `pType`, `pVersion`, `mt_14_15`, `mt_13`, `mt_12`, `mt_8_11`, `msgId`, `rs485Address`, `dataLen`, `cData`, `crc`, `crcData`, `rtCode`, `rtMsg`.

| Python                        | TypeScript                                             |
| ----------------------------- | ------------------------------------------------------ |
| `msg.new(hexStr)`             | `Message.parse(hexStr): Message` (static)              |
| `msg.toByte(is485)`           | `msg.toBytes(is485): number[]`                         |
| `msg.pack()`                  | `msg.pack(): void` (override in subclass)              |
| `msg.unPack()`                | `msg.unPack(): void` (override in subclass)            |
| `msg.toKey()`                 | `msg.toKey(): string`                                  |
| `msg.checkCrc()`              | `msg.checkCrc(): boolean`                              |
| `Message.crc16_Xmodem(bytes)` | `Message.crc16Xmodem(data: number[]): number` (static) |

### GClient (`gclient.py` → `gclient.ts`)

| Python                         | TypeScript                                                      |
| ------------------------------ | --------------------------------------------------------------- |
| `openTcp(param)`               | `async openTcp(host, port, opts?)`                              |
| `openSerial(param)`            | `async openSerial(port, baudRate, opts?)`                       |
| `openSerial485(param)`         | `async openSerial485(port, baudRate, addr, opts?)`              |
| `sendSynMsg(msg, timeout)`     | `async sendSynMsg(msg, timeout?): Promise<number \| undefined>` |
| `senUnSynMsg(msg)`             | `sendAsyncMsg(msg): void`                                       |
| `callEpcInfo = callback`       | `on('epcInfo', handler)` (EventEmitter pattern)                 |
| `callEpcOver = callback`       | `on('epcOver', handler)`                                        |
| `callTcpDisconnect = callback` | `on('disconnected', handler)`                                   |
| `__msgDic` (dict)              | `Map<string, { resolve, timer }>` (Promise-based)               |

### Protocol Message Classes (`app_*.py`, `base_*.py`, etc.)

Each Python file → one TypeScript file that:

- `extends Message`
- Sets `mt_8_11` and `msgId` from `EnumG` in constructor
- Overrides `pack()` → serialize params into `cData` via `DynamicBuffer`
- Overrides `unPack()` → deserialize `cData` into typed properties

### EnumG (`enumg.py` → `enum-g.ts`)

Convert to TypeScript `const enum` or `enum`. Keep exact names and values. Group with comments.

### Parameter (`parameter.py` → `parameter.ts`)

Abstract base: `toBytes(): number[]` and `fromBytes(data: number[]): void`

## Naming Conventions

| Element        | Convention                       | Example                      |
| -------------- | -------------------------------- | ---------------------------- |
| Files          | `kebab-case.ts`                  | `inventory-epc.ts`           |
| Classes        | `PascalCase` (preserve original) | `MsgBaseInventoryEpc`        |
| Enum           | `EnumG` with original names      | `EnumG.BaseMid_InventoryEpc` |
| Interfaces     | `PascalCase`, no `I` prefix      | `TagInfo`, `ReaderConfig`    |
| Private fields | `private` keyword                | `private msgDic: Map<...>`   |
| Constants      | `UPPER_SNAKE_CASE`               | `FRAME_HEADER = 0x5A`        |

## Code Style

- TypeScript `strict: true` — never disable any strict option
- No `any` — use `unknown` + type guard
- All public APIs have JSDoc with `@param` and `@returns`
- Use `Buffer` for binary; `number[]` for `cData` compatibility
- All I/O is `async/await`
- Timeouts: default 3000ms for sync commands, 5000ms for TCP receive (configurable)
- Throw typed errors from custom error classes, never swallow exceptions
- Use explicit imports (no `import *`) to avoid circular dependency issues

## Conversion Priority

Complete files in this order:

1. **Utils foundation**: `dynamic-buffer.ts`, `ring-buffer.ts`, `hex-utils.ts`, `date-utils.ts`, `pc-utils.ts`
2. **Enums**: `enum-g.ts`
3. **Message core**: `message.ts` (with CRC16), `parameter.ts`
4. **Simple commands**: `base/stop.ts`, `app/get-reader-info.ts`
5. **Complex responses**: `log/base-epc-info.ts` (TLV-like parsing)
6. **Communication**: `communication-interface.ts` → `serial-client.ts` → `tcp-client.ts`
7. **Client API**: `gclient.ts`, `gserver.ts`, `tcp-server.ts`
8. **All remaining protocol messages**: `app/`, `base/`, `log/`, `param/`, `test/`, `upgrade/`
9. **Tests**: utils → protocol → communication
10. **Barrel exports**: all `index.ts` files

## Build Commands

```bash
npm install          # Install dependencies
npm run build        # tsc → dist/
npm run test         # Vitest (all tests)
npm run test:unit    # Unit tests only
npm run lint         # ESLint
```

## Critical Gotchas

1. **Bit-level buffer**: `DynamicBuffer` must support arbitrary bit widths (not just byte-aligned). MsgType byte is parsed as 2+1+1+4 bits.
2. **RingBuffer uses bit counts**: `dataCount`, `dataHead`, `dataEnd` are all in **bits**, not bytes. Keep this convention.
3. **CRC16 must match exactly**: Test with Python vector `crc16_Xmodem([0, 1, 17, 18, 0, 4, 0, 0, 1, 82])` and verify identical output.
4. **`cData` is `number[]`**: Values 0-255 (byte array), same as Python `list[int]`.
5. **`mt_8_11` is 4 bits**: Packed into MsgType byte. Bit manipulation must be exact.
6. **Python uses `threading.Condition` for sync**: TypeScript replacement is `Promise` + `setTimeout`.
7. **Circular imports**: Python uses `from uhf.reader.protocol import *` everywhere. In TypeScript, use specific file imports.
8. **`python/` is read-only**: Never create, modify, or delete files in the `python/` directory.

## Testing Requirements

- Unit test every utils function with known Python input→output pairs
- CRC16 test vectors from Python source
- DynamicBuffer: write → read round-trip for all data types
- Message: `parse()` → `toBytes()` round-trip with real hex frames
- Mock `serialport` for communication tests — do not require physical hardware
