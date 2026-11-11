// Parser format .lrc sederhana -> baris lirik { id, start, end, section, text }
//
//   // komentar (diabaikan)
//   # verse                 <- penanda bagian (verse / chorus), berlaku untuk baris di bawahnya
//   [00:14.50] teks baris   <- [menit:detik] lalu teks
//   [00:20.00]              <- timestamp KOSONG = penanda akhir baris sebelumnya (jeda / instrumental)
//
// `end` sebuah baris = timestamp baris berikutnya, kecuali ada penanda kosong.
const TIME_LINE = /^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/;
const LAST_LINE_SECONDS = 6;

export function parseLrc(raw) {
  const entries = [];
  let section = 'beginning';

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('//')) continue;

    if (line.startsWith('#')) {
      section = line.replace(/^#+\s*/, '').toLowerCase() || section;
      continue;
    }

    const match = line.match(TIME_LINE);
    if (!match) continue;
    const time = Number(match[1]) * 60 + Number(match[2]);
    entries.push({ time, text: match[3].trim(), section });
  }

  const lines = [];
  entries.forEach((entry, i) => {
    if (!entry.text) {
      // penanda akhir untuk baris sebelumnya
      if (lines.length && lines[lines.length - 1].end === null) lines[lines.length - 1].end = entry.time;
      return;
    }
    lines.push({ start: entry.time, end: null, section: entry.section, text: entry.text, _next: entries[i + 1]?.time });
  });

  return lines
    .map((l, i) => ({
      id: i + 1,
      start: l.start,
      end: l.end ?? l._next ?? l.start + LAST_LINE_SECONDS,
      section: l.section,
      text: l.text
    }))
    .filter(l => l.end > l.start);
}

// ============================================================
// MODE OTOMATIS: lirik polos tanpa timestamp
// ============================================================
export function hasTimestamps(raw) {
  return raw.split(/\r?\n/).some(line => TIME_LINE.test(line.trim()));
}

function normalizeSection(name) {
  return name.split(':')[0].replace(/\s*\d+$/, '').trim().toLowerCase();
}

// Format:
//   @intro 14        (opsional) detik lirik pertama mulai
//   @outro 8         (opsional) detik sisa di akhir lagu setelah lirik terakhir
//   [Verse 1] / [Chorus] / # chorus   penanda bagian (opsional)
//   baris kosong     = jeda antar bagian
export function parsePlainLyrics(raw) {
  const items = [];
  let section = 'beginning';
  let pause = false;
  let intro = null;
  let outro = null;

  raw.split(/\r?\n/).forEach(rawLine => {
    const line = rawLine.trim();
    if (line.startsWith('//')) return;
    if (!line) { pause = true; return; }

    const directive = line.match(/^@(intro|outro)\s+(\d+(?:\.\d+)?)/i);
    if (directive) {
      if (directive[1].toLowerCase() === 'intro') intro = Number(directive[2]);
      else outro = Number(directive[2]);
      return;
    }

    const bracket = line.match(/^\[([^\]\d][^\]]*)\]$/);
    if (bracket || line.startsWith('#')) {
      section = normalizeSection(bracket ? bracket[1] : line.replace(/^#+\s*/, '')) || section;
      return;
    }

    items.push({ text: line, section, pause: pause && items.length > 0 });
    pause = false;
  });

  return { items, intro, outro };
}

// Bagi waktu otomatis: baris yang lebih panjang dapat waktu lebih lama,
// baris kosong (jeda antar bagian) dapat jeda tambahan.
export function autoTimeLines({ items, intro, outro }, duration) {
  if (!items.length) return [];
  const introSec = intro ?? Math.min(10, duration * 0.08);
  const outroSec = outro ?? Math.min(8, duration * 0.06);
  const span = Math.max(duration - introSec - outroSec, items.length * 2);

  const weights = items.map(item => Math.max(item.text.length, 12));
  const pauseWeight = (weights.reduce((a, b) => a + b, 0) / weights.length) * 0.8;
  const total = weights.reduce((sum, w, i) => sum + w + (items[i].pause ? pauseWeight : 0), 0);
  const perWeight = span / total;

  let cursor = introSec;
  return items.map((item, i) => {
    if (item.pause) cursor += pauseWeight * perWeight;
    const start = cursor;
    cursor += weights[i] * perWeight;
    return { id: i + 1, start, end: cursor, section: item.section, text: item.text };
  });
}

// "4:02" -> 242
export function parseSongDuration(text) {
  const [m, s] = String(text || '3:00').split(':').map(Number);
  return (m || 0) * 60 + (s || 0);
}
