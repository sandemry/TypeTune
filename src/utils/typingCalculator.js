export function calculateAccuracy(correct, total) {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

export function calculateWpm(correctCharacters, elapsedSeconds) {
  if (elapsedSeconds <= 0) return 0;
  return Math.round((correctCharacters / 5) / (elapsedSeconds / 60));
}

export function formatTime(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = String(Math.floor(safe / 60)).padStart(2, '0');
  const seconds = String(safe % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}
