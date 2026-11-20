<<<<<<< HEAD
# TypeTune
Nyanyi bareng Olivia Rodrigo sambil latihan ngetik
=======
# typetune (Olivia Rodrigo Edition)

Game ngetik lirik: setiap kata yang kamu "lock" membuat lagu maju. React + Vite + React Router.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build produksi
```

## ✏️ Tempat yang boleh kamu ubah

Cari tanda **`✏️ [EDIT-ME]`** di seluruh project (Ctrl+Shift+F di VS Code).

| Mau ubah apa | File | Bagian |
|---|---|---|
| **Tambah / ganti mp3** | `public/audio/` + `src/data/songs.js` | taruh mp3 di folder, isi `audioUrl: "/audio/nama.mp3"` |
| **Atur intro, jeda, outro** | `src/data/songs.js` | `intro(0, 8)`, `instrumental("Bridge", 40, 48)`, `outro(120, 130)` (angka = detik di mp3) |
| **Isi lirik** | `src/data/songs.js` | `line("teks lirik", mulai, selesai)`, satu baris per `line` |
| Tambah lagu baru | `src/data/songs.js` | salin satu objek lagu di array `songs` |
| Cover lagu | `public/covers/` + `songs.js` | isi `cover: "/covers/nama.jpg"` (kosong = cover ransom-note otomatis) |
| Warna & font | `src/styles/global.css` | blok `:root` paling atas (6 warna palet + 2 font) |
| Rentang slider speed & teks "vibe" | `src/utils/gameUtils.js` | `SPEED_MIN`, `SPEED_MAX`, `SPEED_STEP`, `SPEED_VIBES` |
| Pilihan durasi | `src/components/DurationPicker.jsx` | array `DURATIONS` |

### Contoh satu lagu

```js
{
  id: "my-song",
  title: "my song",
  album: "SOUR",
  year: 2021,
  level: "Easy",
  mood: "Pop",
  durationLabel: "3:10",
  accent: "pink",                    // lavender | pink | orange | blue | violet | lime (semuanya gradasi dari palet)
  audioUrl: "/audio/my-song.mp3",
  cover: "/covers/my-song.jpg",
  timeline: [
    intro(0, 8),                          // intro auto play
    line("lirik baris pertama", 8, 14),   // kamu ngetik, audio 8-14 dtk
    line("lirik baris kedua", 14, 21),
    instrumental("Bridge", 21, 29),       // jeda auto play
    line("lirik baris ketiga", 29, 36),
    outro(36, 44)
  ]
}
```

Tips: `end` segmen sebelumnya sebaiknya sama dengan `start` segmen berikutnya supaya audio nyambung mulus.
Kalau ada angka yang salah (end <= start, tumpang tindih, lirik kosong), console browser (F12) memberi peringatan saat `npm run dev`.
Tanpa mp3 pun game tetap jalan (senyap), jadi aman untuk testing. Pakai audio dan lirik yang kamu punya izinnya; lirik di repo ini hanya teks contoh.

## Dua area, dua tema

| Area | Route | File layout | Karakter |
|---|---|---|---|
| Cover, landing, daftar lagu, 404 | `/`, `/library` | `layouts/PublicLayout.jsx` | Langit senja (Deep Purple ke Maize), piringan hitam sebagai matahari, ladang lavender, bagian terang berlatar krem |
| Setup, bermain, hasil | `/play/:id`, `/result` | `layouts/PlayLayout.jsx` | Panggung gelap tanpa navbar dan footer, fokus ke kata yang diketik |

Semua CSS ada di `src/styles/global.css`, dibagi per area (`.pub`, `.play`).

## Cara kerja audio dan speed

- **Intro / instrumental**: audio jalan otomatis sampai akhir segmen.
- **Lirik**: tiap baris dibagi rata per kata. Audio hanya diputar sampai potongan kata yang sudah kamu lock, lalu berhenti menunggu kata berikutnya.
- **Slider speed** (0.5x sampai 2x, loncat 0.25): mengatur `playbackRate` audio (pitch tetap) dan kecepatan jalannya segmen instrumental. Bisa diganti di layar setup maupun saat bermain. Pilihan terakhir tersimpan.
- Esc = pause/resume. Tab yang disembunyikan otomatis pause.

## Struktur

```text
src/
├── data/songs.js            ← ✏️ lagu, mp3, intro, lirik
├── utils/
│   ├── timeline.js          builder intro()/line()/instrumental() + validasi
│   ├── gameUtils.js         speed, normalisasi kata, WPM, akurasi
│   └── storage.js           localStorage/sessionStorage yang aman
├── hooks/useTypingGame.js   reducer + jam game + sinkron audio
├── layouts/                 PublicLayout, PlayLayout
├── components/              Navbar, SongCard, SpeedSlider, TypingPanel, RansomWord, ...
├── pages/                   Home, Library, Game, Result, NotFound
└── styles/global.css        ← ✏️ warna & font di bagian atas
```

## Bug yang sudah diperbaiki

- Audio tetap bunyi saat game di-pause, dan instrumental mengulang dari awal setelah resume. Sekarang jam game dan audio dikendalikan satu loop.
- Hasil tersimpan dobel di riwayat (React StrictMode menjalankan effect dua kali). Sekarang disimpan sekali di `Game.jsx`.
- `ProtectedRoute` ada tapi tidak dipakai, jadi `/result` bisa dibuka tanpa sesi. Sekarang terpasang.
- Kata dengan tanda baca atau huruf besar dianggap salah ("Don't" vs "dont"). Sekarang dinormalisasi.
- Timer `Date.now()` meleset setelah pause. Sekarang berbasis akumulasi delta, plus auto pause saat tab disembunyikan.
- WPM melonjak di detik pertama (sekarang minimal 3 detik). `JSON.parse` storage bisa crash (sekarang try/catch).
- State `showPause` tidak terpakai, jumlah "06 tracks" ditulis manual, segmen lirik kosong bisa bikin game macet (sekarang dilewati).
- Logika perpindahan segmen dipindah ke reducer murni supaya tidak ada stale closure.
>>>>>>> de09bb7 (Upload project)
