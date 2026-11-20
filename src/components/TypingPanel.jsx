import { useEffect, useRef } from "react";
import { Keyboard } from "lucide-react";

const FEEDBACK = {
  correct: "Clean line. Next one's up.",
  wrong: "Some misses, but the song keeps moving.",
  idle: "Type the whole line. Enter skips to the next."
};

export default function TypingPanel({
  words,
  wordStatuses,
  lineNumber,
  totalLines,
  nextLine,
  inputValue,
  onInputChange,
  onSubmit,
  disabled,
  paused,
  lastResult
}) {
  const inputRef = useRef(null);
  const lineKey = words.join(" ");

  // Fokus balik ke input tiap baris berganti atau game di-resume.
  useEffect(() => {
    if (!disabled) inputRef.current?.focus({ preventScroll: true });
  }, [disabled, lineKey]);

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <section className="typing-panel">
      <div className="typing-panel-heading">
        <span><Keyboard size={16} /> Your turn</span>
        <span className="lock-hint">Line {lineNumber} of {totalLines}</span>
      </div>

      <p className="lyric-line lyric-line-lg" aria-label="Current lyric line">
        {words.map((word, i) => (
          <span key={`${lineKey}-${i}`} className={`lw lw-${wordStatuses[i] || "next"}`}>{word}</span>
        ))}
      </p>

      <label className="sr-only" htmlFor="typing-input">Type the whole lyric line</label>
      <input
        ref={inputRef}
        id="typing-input"
        className="typing-input"
        value={inputValue}
        onChange={(event) => onInputChange(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
        placeholder={paused ? "Paused" : "Type the line here"}
      />

      <div className={`typing-feedback fb-${lastResult || "idle"}`} aria-live="polite">
        {paused ? "Paused. Hit resume when you're back." : FEEDBACK[lastResult] || FEEDBACK.idle}
      </div>

      {nextLine && (
        <p className="next-line"><span>Next up</span>{nextLine}</p>
      )}

      <button className="btn btn-primary btn-block" onClick={onSubmit} disabled={disabled || !inputValue.trim()}>
        Next line <span aria-hidden="true">↵</span>
      </button>
    </section>
  );
}
