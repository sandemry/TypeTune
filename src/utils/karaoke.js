// Membagi waktu tiap kata dalam satu baris lirik.
// Kalau baris punya `wordTimes` dipakai itu, kalau tidak dibagi otomatis
// berdasarkan panjang kata.
export function getWordTimings(line) {
  const words = line.text.split(' ').filter(Boolean);

  if (Array.isArray(line.wordTimes) && line.wordTimes.length === words.length) {
    return words.map((text, i) => ({
      text,
      start: line.wordTimes[i],
      end: line.wordTimes[i + 1] ?? line.end
    }));
  }

  const weights = words.map(word => word.length + 1);
  const total = weights.reduce((sum, w) => sum + w, 0);
  const span = line.end - line.start;
  let acc = 0;
  return words.map((text, i) => {
    const start = line.start + (acc / total) * span;
    acc += weights[i];
    const end = line.start + (acc / total) * span;
    return { text, start, end };
  });
}

// Persentase (0-100) seberapa jauh kata sudah "dinyanyikan" pada waktu t.
export function wordProgress(word, t) {
  if (t <= word.start) return 0;
  if (t >= word.end) return 100;
  return ((t - word.start) / (word.end - word.start)) * 100;
}

// Samakan kata (abaikan huruf besar/kecil & tanda baca) saat dicek.
export function normalizeWord(text) {
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^\p{L}\p{N}']/gu, '');
}
