// The code that reads your Client.txt in the browser.
// It never uploads the file. It keeps only the timestamp and the matched
// zone line, and throws everything else away. You can read this file
// from the "Read the code that runs on this page" link.
//
// Kept text matches:
//   Generating level <number> area "<id>" with seed <number>
//   Tile hash: <number>
//   Doodad hash: <number>
// From each kept line, only the first 19 characters (the time stamp,
// YYYY/MM/DD HH:MM:SS) and the matched text are kept.

export const TIMESTAMP_LENGTH = 19;

export const MATCH_RE =
  /Generating level \d+ area "[^"]+" with seed \d+|Tile hash: \d+|Doodad hash: \d+/;

const AREA_RE = /Generating level \d+ area "([^"]+)" with seed \d+/;
const CHUNK_SIZE = 1024 * 1024;

// Turn one raw log line into the stripped form, or null if it has no match.
export function stripLine(raw) {
  const line = raw.replace(/\r$/, "");
  if (!line) return null;
  const match = MATCH_RE.exec(line);
  if (!match) return null;
  const stamp = line.slice(0, TIMESTAMP_LENGTH);
  // A real log line starts with a 19-character time stamp. If it doesn't,
  // we still keep a stamp only when the first 19 characters look like one.
  if (!/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/.test(stamp)) return null;
  return stamp + " " + match[0];
}

export function areaIdFromLine(line) {
  const m = AREA_RE.exec(line);
  return m ? m[1] : null;
}

// Path of Exile 2 area ids start with G and a number (G1_5, G1_town).
// Path of Exile 1 area ids look like 1_1_2 or MapWorlds...
export function guessGame(areaIds) {
  let poe1 = false;
  let poe2 = false;
  for (const id of areaIds) {
    if (/^G\d/.test(id)) poe2 = true;
    else if (/^\d+_\d+/.test(id) || /^MapWorlds/i.test(id)) poe1 = true;
  }
  if (poe1 && poe2) return "1 and 2";
  if (poe2) return "2";
  if (poe1) return "1";
  return null;
}

function looksBinary(bytes) {
  const n = Math.min(bytes.length, 4096);
  if (n === 0) return false;
  let nul = 0;
  for (let i = 0; i < n; i++) if (bytes[i] === 0) nul++;
  return nul > 0;
}

export function isLikelyWrongFile(file, firstChunk) {
  const type = (file.type || "").toLowerCase();
  if (type.startsWith("image/") || type.startsWith("audio/") || type.startsWith("video/") || type === "application/pdf" || type === "application/zip") {
    return true;
  }
  if (firstChunk && looksBinary(firstChunk)) return true;
  return false;
}

export async function processFile(file, hooks = {}) {
  const onProgress = hooks.onProgress || (() => {});
  const readBytes = file.size;
  const first = new Uint8Array(await file.slice(0, Math.min(CHUNK_SIZE, file.size || 0)).arrayBuffer());
  if (isLikelyWrongFile(file, first)) {
    return { wrongFile: true, lines: [], areaIds: [], readBytes, sendBytes: 0 };
  }

  const decoder = new TextDecoder("utf-8");
  const lines = [];
  const areaIds = [];
  let offset = 0;
  let carry = "";

  while (offset < file.size) {
    const end = Math.min(offset + CHUNK_SIZE, file.size);
    const chunk = new Uint8Array(await file.slice(offset, end).arrayBuffer());
    const text = carry + decoder.decode(chunk, { stream: end < file.size });
    const parts = text.split("\n");
    carry = parts.pop() ?? "";
    for (const raw of parts) {
      const kept = stripLine(raw);
      if (!kept) continue;
      lines.push(kept);
      const id = areaIdFromLine(kept);
      if (id) areaIds.push(id);
    }
    offset = end;
    onProgress(offset, file.size);
  }
  if (carry) {
    const kept = stripLine(carry);
    if (kept) {
      lines.push(kept);
      const id = areaIdFromLine(kept);
      if (id) areaIds.push(id);
    }
  }

  const body = lines.join("\n") + (lines.length ? "\n" : "");
  const sendBytes = new TextEncoder().encode(body).length;
  const stamps = lines.map((l) => l.slice(0, TIMESTAMP_LENGTH));
  const dateRange = stamps.length ? { from: stamps[0], to: stamps[stamps.length - 1] } : null;

  return {
    wrongFile: false,
    lines,
    areaIds,
    game: guessGame(areaIds),
    dateRange,
    readBytes,
    sendBytes,
    body,
  };
}

export function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) {
    const kb = n / 1024;
    return (kb < 10 ? kb.toFixed(1) : Math.round(kb)) + " KB";
  }
  const mb = n / (1024 * 1024);
  return (mb < 10 ? mb.toFixed(1) : Math.round(mb)) + " MB";
}
