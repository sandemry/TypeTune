// Semua akses localStorage / sessionStorage lewat sini.
// Dibungkus try/catch karena storage bisa dimatikan (mode private, kuota penuh, dll).

const LAST_RESULT_KEY = "typetune-last-result";
const HISTORY_KEY = "typetune-history";
const SPEED_KEY = "typetune-speed";
const HISTORY_LIMIT = 10;

function read(store, key, fallback) {
  try {
    const raw = store.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(store, key, value) {
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    /* storage penuh/dimatikan: abaikan, game tetap jalan */
  }
}

export function saveResult(result) {
  const { typedWords, ...summary } = result; // history tidak perlu detail tiap kata
  const entry = { ...summary, playedAt: Date.now() };
  write(sessionStorage, LAST_RESULT_KEY, entry);
  const history = read(localStorage, HISTORY_KEY, []);
  write(localStorage, HISTORY_KEY, [entry, ...history].slice(0, HISTORY_LIMIT));
}

export const loadLastResult = () => read(sessionStorage, LAST_RESULT_KEY, null);
export const loadHistory = () => read(localStorage, HISTORY_KEY, []);
export const loadSpeed = () => Number(read(localStorage, SPEED_KEY, 1)) || 1;
export const saveSpeed = (speed) => write(localStorage, SPEED_KEY, speed);
