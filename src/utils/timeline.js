// Pembuat "timeline" lagu. Dipakai di src/data/songs.js.
//
// Satu lagu = urutan segmen. Ada dua jenis:
//   instrumental(label, start, end)   -> auto play, kamu tidak perlu ngetik
//   line(teks, start, end, label)     -> kamu ngetik satu baris penuh; audio baris itu
//                                        main saat barisnya tampil
// start & end = detik di dalam file mp3.

export const tokenize = (text) => String(text).trim().split(/\s+/).filter(Boolean);

export function instrumental(label, start, end) {
  return { type: "instrumental", label, start, end, duration: end - start };
}

export const intro = (start, end, label = "Intro") => instrumental(label, start, end);
export const outro = (start, end, label = "Outro") => instrumental(label, start, end);

export function line(text, start, end, label = "Lyrics") {
  return { type: "lyrics", label, text, words: tokenize(text), start, end, duration: end - start };
}

// Bikin banyak baris sekaligus dari teks lirik (satu baris teks = satu baris game).
//
// Format tiap baris di file .txt:
//   [00:08.47] teks lirik  -> baris ini MULAI di menit:detik itu (boleh [0:08], [00:08.47] atau [8.5])
//   teks lirik             -> tanpa waktu: dibagi otomatis di antara baris yang punya waktu
// Baris berakhir saat baris berikutnya mulai. Baris terakhir berakhir di `end`.
// Baris kosong dan baris berawalan "#" diabaikan.
// Baris "[Chorus]" (kurung siku saja, tanpa teks) mengganti label untuk baris sesudahnya.

// "00:08.47" -> 8.47 | "1:05" -> 65 | "8.5" -> 8.5
const parseStamp = (str) => {
  const parts = str.split(":").map(Number);
  if (parts.some((n) => !Number.isFinite(n))) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return null;
};

export function linesFromText(text, start, end, label = "Lyrics") {
  let current = label;
  const items = [];

  String(text).split(/\r?\n/).forEach((raw) => {
    const t = raw.trim();
    if (!t || t.startsWith("#")) return;

    // [mm:ss.xx] teks lirik
    const stamped = t.match(/^\[(\d+(?::\d+)?(?:\.\d+)?)\]\s*(.+)$/);
    if (stamped) {
      items.push({ t: stamped[2].trim(), label: current, at: parseStamp(stamped[1]) });
      return;
    }

    // [Chorus] (label bagian)
    const tag = t.match(/^\[(.+)\]$/);
    if (tag) { current = tag[1]; return; }

    items.push({ t, label: current, at: null });
  });

  if (!items.length) return [];

  // Baris pertama tanpa waktu = mulai di `start`.
  if (items[0].at === null) items[0].at = start;
  const starts = items.map((it) => it.at);

  // Baris tanpa waktu dibagi sebanding panjang teks, di antara dua baris yang punya waktu.
  let a = 0;
  while (a < items.length) {
    let b = a + 1;
    while (b < items.length && starts[b] === null) b += 1;
    const t0 = starts[a];
    const t1 = b < items.length ? starts[b] : end;
    const total = items.slice(a, b).reduce((sum, it) => sum + it.t.length, 0) || 1;
    let acc = 0;
    for (let i = a; i < b; i += 1) {
      starts[i] = t0 + ((t1 - t0) * acc) / total;
      acc += items[i].t.length;
    }
    a = b;
  }

  return items.map((it, i) => {
    const from = starts[i];
    const to = i < items.length - 1 ? starts[i + 1] : end;
    return line(it.t, Number(from.toFixed(2)), Number(to.toFixed(2)), it.label);
  });
}

export const countWords = (timeline) =>
  timeline.reduce((sum, seg) => sum + (seg.type === "lyrics" ? seg.words.length : 0), 0);

// Mengembalikan daftar masalah supaya typo di timeline langsung ketahuan di console.
export function validateTimeline(timeline, songId = "song") {
  const problems = [];
  if (!Array.isArray(timeline) || !timeline.length) {
    return [`[${songId}] timeline kosong`];
  }
  let prevEnd = null;
  timeline.forEach((seg, i) => {
    const where = `[${songId}] segmen #${i + 1} (${seg.label})`;
    if (!(seg.end > seg.start)) problems.push(`${where}: end harus lebih besar dari start`);
    if (seg.type === "lyrics" && !seg.words.length) problems.push(`${where}: teks lirik kosong`);
    if (prevEnd !== null && seg.start < prevEnd - 0.001) {
      problems.push(`${where}: start (${seg.start}s) tumpang tindih dengan segmen sebelumnya (${prevEnd}s)`);
    }
    prevEnd = seg.end;
  });
  if (!countWords(timeline)) problems.push(`[${songId}] tidak ada baris lirik sama sekali`);
  return problems;
}