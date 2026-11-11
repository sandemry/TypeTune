# TypeTune

Starter project React + JavaScript + Vite dengan tema Purple Scrapbook Pop.

## Menjalankan project

1. Ekstrak folder `typetune`.
2. Buka folder `typetune` di VS Code.
3. Buka Terminal > New Terminal.
4. Jalankan:

```bash
npm install
npm run dev
```

5. Buka alamat lokal yang muncul di terminal (biasanya http://localhost:5173).

## Jika project React + Vite sudah ada

Tidak perlu membuat project baru. Salin folder `src` dari starter ini ke project kamu (sesuaikan jika sudah punya file dengan nama sama), lalu jalankan:

```bash
npm install
npm install react-router-dom
npm run dev
```

## Catatan fitur

- Data katalog lagu sudah berisi 8 judul yang dipilih.
- **Musik diputar otomatis dari sistem.** Taruh mp3 di `public/songs/` (lihat tanda `TODO: MASUKKAN MP3` di `src/data/songs.js`). Pengguna tidak perlu memilih file.
- Kecepatan: 0.5×, 0.75×, 1×, 1.25×, 1.5× (halaman Game Settings). Highlight lirik ikut sinkron karena memakai waktu asli lagu.
- Lirik gaya karaoke: kata disorot mengikuti musik. Atur timestamp di `src/data/lyrics.js` (`start`, `end`, dan opsional `wordTimes`).
- Contoh teks latihan di `src/data/lyrics.js` adalah teks orisinal untuk demo, bukan lirik lagu Olivia Rodrigo. Isi lirik per lagu di `lyricsBySong`.
- Jika mp3 belum ada, game tetap jalan tanpa suara dengan jam cadangan.
- Riwayat disimpan di `localStorage` browser, bukan database.
