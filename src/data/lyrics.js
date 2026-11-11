import { autoTimeLines, hasTimestamps, parseLrc, parsePlainLyrics, parseSongDuration } from '../utils/lrc';

// Teks di bawah adalah teks latihan ORISINAL untuk demo (dipakai untuk semua lagu
// selama belum ada lirik khusus). Ganti dengan teks yang kamu punya izin untuk gunakan.
//
// Format tiap baris:
//   start / end : detik di dalam file mp3 (waktu asli lagu, TIDAK terpengaruh kecepatan)
//   text        : teks yang diketik
//   wordTimes   : (opsional) detik mulai tiap kata, supaya highlight karaoke presisi.
//                 Jumlahnya harus sama dengan jumlah kata. Kalau dikosongkan,
//                 waktu tiap kata dibagi otomatis di antara start dan end.
export const demoLyrics = [
  { id: 1, start: 0, end: 8, section: 'beginning', text: 'Purple skies are dancing over me' },
  { id: 2, start: 8, end: 16, section: 'verse', text: 'I write my little dreams in melody' },
  { id: 3, start: 16, end: 24, section: 'verse', text: 'Every little moment feels brand new' },
  { id: 4, start: 24, end: 32, section: 'chorus', text: 'Sing it loud and let the colors shine' },
  { id: 5, start: 32, end: 40, section: 'chorus', text: 'Keep the rhythm moving in your mind' },
  { id: 6, start: 40, end: 48, section: 'chorus', text: 'Type the words and make the moment mine' },
  { id: 7, start: 48, end: 56, section: 'verse', text: 'Little paper stars are falling down' },
  { id: 8, start: 56, end: 64, section: 'verse', text: 'We can turn the quiet into sound' }
];

// ============================================================
// 🎤 LIRIK + TIMESTAMP PER LAGU (opsional)
// Kunci = id lagu di src/data/songs.js. Contoh:
//
//   1: [
//     { id: 1, start: 12.5, end: 18, section: 'verse', text: 'teks baris 1' },
//     { id: 2, start: 18, end: 24, section: 'verse', text: 'teks baris 2',
//       wordTimes: [18, 19, 19.8, 21, 22] },   // opsional, 1 angka per kata
//   ],
//
// Cara yang lebih mudah: pakai file .lrc di src/data/lrc/ (lihat drivers-license.lrc).
// Urutan prioritas: file .lrc -> lyricsBySong -> demoLyrics.
// ============================================================
export const lyricsBySong = {
  // Salin blok di bawah, hapus tanda // di depannya, lalu isi teks & detiknya.
  // Waktu SEBELUM `start` baris pertama dianggap INTRO (musik jalan, game belum jalan).
  //
  // 1: [  // drivers license
  //   { id: 1, start: 14, end: 20, section: 'verse', text: 'isi baris 1' },
  //   { id: 2, start: 20, end: 26, section: 'verse', text: 'isi baris 2' },
  //   { id: 3, start: 40, end: 47, section: 'chorus', text: 'isi baris reff' },
  // ],
  // 2: [ ... ],  // traitor
  // 3: [ ... ],  // deja vu
  // 4: [ ... ],  // good 4 u
  // 5: [ ... ],  // jealousy, jealousy
  // 6: [ ... ],  // vampire
  // 7: [ ... ],  // brutal
  // 8: [ ... ],  // love is embarrassing

  // TODO: ISI LIRIK + TIMESTAMP LAGU KAMU DI SINI
};

// Lirik dari file .lrc di src/data/lrc/ (nama file = nama mp3, mis. drivers-license.lrc).
// File .lrc yang tidak punya baris bertimestamp diabaikan.
const lrcFiles = import.meta.glob('./lrc/*.lrc', { query: '?raw', import: 'default', eager: true });

function slugOf(song) {
  return (song.audio || '').split('/').pop().replace(/\.[^.]+$/, '');
}

// Urutan prioritas:
//  1. File .lrc BERTIMESTAMP  -> waktu persis
//  2. File .lrc POLOS (tanpa timestamp) -> waktu dibagi otomatis sepanjang durasi lagu
//  3. lyricsBySong (manual di kode)
//  4. demoLyrics
export function getLyrics(song, audioDuration) {
  const raw = lrcFiles[`./lrc/${slugOf(song)}.lrc`];
  if (raw) {
    if (hasTimestamps(raw)) {
      const timed = parseLrc(raw);
      if (timed.length) return timed;
    } else {
      const plain = parsePlainLyrics(raw);
      if (plain.items.length) {
        return autoTimeLines(plain, audioDuration || parseSongDuration(song.duration));
      }
    }
  }
  return lyricsBySong[song.id] || demoLyrics;
}
