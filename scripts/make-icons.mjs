import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, "..", "public");
mkdirSync(PUBLIC_DIR, { recursive: true });

const BG = [0x1a, 0x73, 0xe8];
const FG = [0xff, 0xff, 0xff];

const GLYPH_6 = [
  "..#####..",
  ".##...##.",
  "##.......",
  "##.......",
  "##.####..",
  "###...##.",
  "##....##.",
  "##....##.",
  "##....##.",
  ".##..##..",
  "..####...",
];

function crc32(buf) {
  let c;
  if (!crc32.table) {
    crc32.table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      crc32.table[n] = c >>> 0;
    }
  }
  c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crc32.table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function makePNG(size) {
  const width = size;
  const height = size;

  const glyphRows = GLYPH_6.length;
  const glyphCols = GLYPH_6[0].length;
  const cell = Math.max(1, Math.floor(Math.min(width, height) * 0.7 / glyphCols));
  const glyphW = cell * glyphCols;
  const glyphH = cell * glyphRows;
  const offsetX = Math.floor((width - glyphW) / 2);
  const offsetY = Math.floor((height - glyphH) / 2);

  function pixelAt(x, y) {
    const gx = Math.floor((x - offsetX) / cell);
    const gy = Math.floor((y - offsetY) / cell);
    if (gx < 0 || gy < 0 || gx >= glyphCols || gy >= glyphRows) return BG;
    return GLYPH_6[gy][gx] === "#" ? FG : BG;
  }

  const stride = 1 + width * 3;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0;
    for (let x = 0; x < width; x++) {
      const p = pixelAt(x, y);
      const off = y * stride + 1 + x * 3;
      raw[off] = p[0];
      raw[off + 1] = p[1];
      raw[off + 2] = p[2];
    }
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const idat = deflateSync(raw);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

for (const size of [16, 48, 128]) {
  const buf = makePNG(size);
  const out = resolve(PUBLIC_DIR, `icon-${size}.png`);
  writeFileSync(out, buf);
  console.log(`wrote ${out} (${buf.length} bytes)`);
}
