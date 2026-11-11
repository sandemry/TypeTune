const HISTORY_KEY = 'typetune-history';

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveHistory(result) {
  const history = getHistory();
  const updated = [result, ...history];
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}
