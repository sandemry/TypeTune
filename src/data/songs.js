// ============================================================================
//  ✏️  TEMPAT UTAMA UNTUK MENGUBAH LAGU  (cari tanda "✏️ [EDIT-ME]")
// ============================================================================
//  Cara nambah lagu / mp3 / intro / lirik:
//
//  1. MP3     : taruh file di  public/audio/  (mis. public/audio/my-song.mp3)
//               lalu isi  audioUrl: "/audio/my-song.mp3"
//  2. COVER   : (opsional) taruh gambar di public/covers/ lalu isi
//               cover: "/covers/my-song.jpg"
//  3. TIMELINE: urutan bagian lagu, angka = DETIK di dalam file mp3.
//
//        intro(0, 8)                          -> intro 0-8 dtk, auto play
//        line("lirik baris pertama", 8, 14)   -> kamu ngetik, audio 8-14 dtk
//        instrumental("Bridge", 40, 48)       -> jeda instrumental
//        outro(120, 130)                      -> penutup, auto play
//
//     Tips: end segmen sebelumnya = start segmen berikutnya supaya audio
//     nyambung mulus. Kalau ada typo angka, console browser (F12) akan kasih
//     peringatan.
//
//  4. Tanpa mp3 pun game tetap jalan (mode senyap), jadi aman buat testing.
//
//  Catatan hak cipta: pakai audio & lirik yang kamu punya izinnya.
//  Lirik di bawah cuma teks contoh buatan sendiri.
// ============================================================================

import { instrumental, intro, line, linesFromText, outro, validateTimeline } from "../utils/timeline";
// Lirik ditaruh di file .txt terpisah (satu baris teks = satu baris di game).
import driversLicenseLyrics from "./lyrics/drivers-license.txt?raw";

// ✏️ [EDIT-ME] Timeline contoh. Dipakai semua lagu sampai kamu ganti sendiri.
function demoTimeline() {
  return [
    intro(0, 5),
    line("this is a placeholder line so type it to move the song", 5, 13, "Verse"),
    instrumental("Vibe break", 13, 17),
    line("swap me for your own lyrics whenever you are ready", 17, 25, "Chorus"),
    outro(25, 30)
  ];
}

// ✏️ [EDIT-ME] drivers license: intro 8 detik, lalu lirik dari src/data/lyrics/drivers-license.txt.
// Waktu tiap baris dibagi otomatis di antara 8 dtk sampai 236 dtk (sebanding panjang baris),
// lalu outro 236-242 dtk. Kalau sinkron dengan mp3 kurang pas, ubah angka di bawah
// atau tulis manual per baris pakai line("teks", mulai, selesai).
function driversLicenseTimeline() {
  return [
    intro(0, 8),
    ...linesFromText(driversLicenseLyrics, 8, 236),
    outro(236, 242)
  ];
}

// ✏️ [EDIT-ME] Daftar lagu. Tambah objek baru untuk lagu baru.
// accent (warna kartu): lavender | pink | orange | blue | violet | lime
export const songs = [
  {
    id: "drivers-license",
    title: "drivers license",
    album: "SOUR",
    year: 2021,
    level: "Easy",
    mood: "Heartbreak",
    durationLabel: "4:02",
    accent: "lavender",
    audioUrl: "/audio/drivers-license.mp3",            // ✏️ [EDIT-ME] contoh: "/audio/drivers-license.mp3"
    cover: "",               // ✏️ [EDIT-ME] contoh: "/covers/drivers-license.jpg"
    timeline: driversLicenseTimeline()
  },
  {
    id: "the-cure",
    title: "the cure",
    album: "Single",
    year: 2021,
    level: "Medium",
    mood: "Soft pop",
    durationLabel: "-",
    accent: "pink",
    audioUrl: "",
    cover: "",
    timeline: demoTimeline()
  },
  {
    id: "brutal",
    title: "brutal",
    album: "SOUR",
    year: 2021,
    level: "Hard",
    mood: "Pop rock",
    durationLabel: "2:23",
    accent: "orange",
    audioUrl: "",
    cover: "",
    timeline: demoTimeline()
  },
  {
    id: "jealousy-jealousy",
    title: "jealousy, jealousy",
    album: "SOUR",
    year: 2021,
    level: "Hard",
    mood: "Pop rock",
    durationLabel: "2:57",
    accent: "lime",
    audioUrl: "",
    cover: "",
    timeline: demoTimeline()
  },
  {
    id: "so-american",
    title: "so american",
    album: "GUTS (spilled)",
    year: 2024,
    level: "Medium",
    mood: "Pop",
    durationLabel: "2:49",
    accent: "blue",
    audioUrl: "",
    cover: "",
    timeline: demoTimeline()
  },
  {
    id: "drop-dead",
    title: "drop dead",
    album: "Single",
    year: 2026,
    level: "Medium",
    mood: "Pop",
    durationLabel: "-",
    accent: "violet",
    audioUrl: "",
    cover: "",
    timeline: demoTimeline()
  }
];

export function getSongById(songId) {
  return songs.find((song) => song.id === songId);
}

// Cek timeline sekali saat dev server jalan.
if (import.meta.env.DEV) {
  songs.forEach((song) => {
    validateTimeline(song.timeline, song.id).forEach((msg) => console.warn(`[typetune] ${msg}`));
  });
}
