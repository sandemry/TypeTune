// Helper untuk halaman /sync (tap-sync lirik).

// Paste lirik -> daftar baris teks + penanda bagian.
// Header gaya Genius seperti "[Chorus]" / "[Verse 1]" otomatis jadi "# chorus" / "# verse".
export function parseLyricsInput(text) {
  const textLines = [];
  const sectionBefore = {};
  let pending = [];

  text.split(/\r?\n/).forEach(raw => {
    const line = raw.trim();
    if (!line || line.startsWith('//')) return;

    const bracket = line.match(/^\[([^\]\d][^\]]*)\]$/); // [Chorus], bukan [00:12]
    if (bracket || line.startsWith('#')) {
      const name = (bracket ? bracket[1] : line.replace(/^#+\s*/, ''))
        .split(':')[0].replace(/\s*\d+$/, '').trim().toLowerCase();
      if (name) pending.push(`# ${name}`);
      return;
    }

    sectionBefore[textLines.length] = pending;
    pending = [];
    textLines.push(line);
  });

  return { textLines, sectionBefore };
}

// 65.5 -> "01:05.50"
export function formatLrcTime(seconds) {
  const cs = Math.round(Math.max(0, seconds) * 100);
  const m = Math.floor(cs / 6000);
  const s = ((cs % 6000) / 100).toFixed(2).padStart(5, '0');
  return `${String(m).padStart(2, '0')}:${s}`;
}

// events: [{kind:'line', idx, time} | {kind:'gap', time}]
export function buildLrc(textLines, sectionBefore, events) {
  const out = [];
  events.forEach(e => {
    if (e.kind === 'line') {
      (sectionBefore[e.idx] || []).forEach(s => out.push(s));
      out.push(`[${formatLrcTime(e.time)}] ${textLines[e.idx]}`);
    } else {
      out.push(`[${formatLrcTime(e.time)}]`);
    }
  });
  return out.join('\n');
}
