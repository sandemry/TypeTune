// Helper murni (pure functions) untuk game. Tidak ada state di sini.

/* ---------- Speed ---------- */
// ✏️ [EDIT-ME] Rentang slider kecepatan. Default: 0.5x sampai 2x, loncat 0.25.
export const SPEED_MIN = 0.5;
export const SPEED_MAX = 2;
export const SPEED_STEP = 0.25;

export const SPEED_STOPS = Array.from(
  { length: Math.round((SPEED_MAX - SPEED_MIN) / SPEED_STEP) + 1 },
  (_, i) => SPEED_MIN + i * SPEED_STEP
);

// ✏️ [EDIT-ME] Teks "vibe" yang muncul di bawah angka speed.
const SPEED_VIBES = {
  0.5: "slowmo, soft launch",
  0.75: "chill mode",
  1: "original tempo, no cap",
  1.25: "lowkey spicy",
  1.5: "fast fr",
  1.75: "unhinged",
  2: "gremlin mode"
};

export function clampSpeed(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  const snapped = Math.round(n / SPEED_STEP) * SPEED_STEP;
  return Math.min(SPEED_MAX, Math.max(SPEED_MIN, snapped));
}

export const formatSpeed = (value) => `${Number(value)}x`;
export const speedVibe = (value) => SPEED_VIBES[value] ?? "custom vibe";

/* ---------- Kata ---------- */
// "Don't," == "dont" == "DON’T". Huruf besar, tanda baca, dan aksen diabaikan.
export function normalizeWord(word) {
  return String(word)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function isCorrectWord(typed, target) {
  const a = normalizeWord(typed);
  const b = normalizeWord(target);
  // Target yang isinya cuma simbol (mis. "&") dibandingkan apa adanya.
  if (!b) return String(typed).trim() === String(target).trim();
  return a === b;
}

/* ---------- Statistik ---------- */
export function calculateAccuracy(typedWords) {
  if (!typedWords.length) return 100;
  const correct = typedWords.filter((item) => item.correct).length;
  return Math.round((correct / typedWords.length) * 100);
}

// Minimal 3 detik supaya WPM tidak meledak di awal permainan.
export function calculateWpm(completedWords, elapsedSeconds) {
  if (!completedWords) return 0;
  const seconds = Math.max(3, elapsedSeconds);
  return Math.round((completedWords / seconds) * 60);
}

export function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  return `${String(minutes).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
