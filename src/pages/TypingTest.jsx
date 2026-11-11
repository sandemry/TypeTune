import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { getLyrics } from '../data/lyrics';
import { calculateAccuracy, calculateWpm, formatTime } from '../utils/typingCalculator';
import { getWordTimings, normalizeWord, wordProgress } from '../utils/karaoke';
import { saveHistory } from '../utils/storage';

// Intro (musik sebelum baris lirik pertama) tetap diputar, tapi timer & game BELUM jalan.
// Ubah ke true kalau mau intro dilewati sama sekali (musik langsung mulai di baris pertama).
const SKIP_INTRO = false;

export default function TypingTest() {
  const navigate = useNavigate();
  const { selectedSong, settings, setLatestResult } = useGame();
  const audioRef = useRef(null);
  const inputRef = useRef(null);

  // ---------- Lirik yang dipakai (sesuai lagu & bagian yang dipilih) ----------
  const [audioDuration, setAudioDuration] = useState(0); // dipakai untuk membagi waktu lirik otomatis
  const lyrics = useMemo(() => getLyrics(selectedSong, audioDuration), [selectedSong, audioDuration]);

  const startAt = useMemo(() => {
    if (settings.section === 'custom') return settings.customStart;
    if (settings.section === 'beginning') return SKIP_INTRO ? (lyrics[0]?.start ?? 0) : 0;
    return lyrics.find(l => l.section === settings.section)?.start ?? 0;
  }, [lyrics, settings]);

  const endAt = settings.section === 'custom' ? settings.customEnd : Infinity;

  const lines = useMemo(() => lyrics
    .filter(l => l.start >= startAt && l.end <= endAt)
    .map(l => ({ ...l, words: getWordTimings(l) })), [lyrics, startAt, endAt]);

  // ---------- State tampilan ----------
  const [now, setNow] = useState(null); // waktu lagu (detik) untuk highlight
  const [activeIdx, setActiveIdx] = useState(-1);
  const [wordResults, setWordResults] = useState([]); // 'ok' | 'bad' per kata di baris aktif
  const [typed, setTyped] = useState('');
  const [stats, setStats] = useState({ correct: 0, total: 0, errors: 0, misses: 0 });
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [gameRunning, setGameRunning] = useState(false); // false selama intro
  const [silentMode, setSilentMode] = useState(false); // true jika mp3 tidak ditemukan

  // ---------- Ref (nilai terbaru untuk loop animasi) ----------
  const statsRef = useRef(stats);
  const elapsedRef = useRef(0);
  const playingRef = useRef(false);
  const gameRunningRef = useRef(false);
  const finishedRef = useRef(false);
  const startedRef = useRef(false);
  const silentRef = useRef(false);
  const lineIdxRef = useRef(-1);
  const wordIdxRef = useRef(0);
  const lineDoneRef = useRef(false);
  const clockRef = useRef({ base: 0, startedAt: 0 }); // dipakai hanya saat silentMode
  const tickRef = useRef(() => {});

  function updateStats(fn) {
    statsRef.current = fn(statsRef.current);
    setStats(statsRef.current);
  }

  // ---------- Waktu lagu: dari audio, atau jam cadangan jika mp3 belum ada ----------
  function getTime() {
    if (silentRef.current) {
      const c = clockRef.current;
      if (!playingRef.current) return c.base;
      return c.base + ((performance.now() - c.startedAt) / 1000) * settings.speed;
    }
    return audioRef.current?.currentTime ?? 0;
  }

  function enableSilentMode() {
    if (silentRef.current) return;
    silentRef.current = true;
    setSilentMode(true);
  }

  function applyPlaybackRate() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.defaultPlaybackRate = settings.speed;
    audio.playbackRate = settings.speed; // 0.5 / 0.75 / 1 / 1.25 / 1.5
  }

  useEffect(() => { applyPlaybackRate(); }, [settings.speed]);
  useEffect(() => { if (!selectedSong.audio) enableSilentMode(); }, [selectedSong]);
  useEffect(() => () => audioRef.current?.pause(), []);
  useEffect(() => { if (playing && gameRunning) inputRef.current?.focus(); }, [playing, gameRunning]);

  // ---------- Selesai ----------
  function finishGame(reason) {
    if (finishedRef.current) return;
    finishedRef.current = true;
    playingRef.current = false;
    setPlaying(false);
    audioRef.current?.pause();
    const s = statsRef.current;
    const seconds = Math.max(elapsedRef.current, 1);
    const result = {
      id: Date.now(),
      song: selectedSong.title,
      wpm: calculateWpm(s.correct * 5, seconds),
      accuracy: calculateAccuracy(s.correct, s.total),
      errors: s.errors,
      misses: s.misses,
      duration: elapsedRef.current,
      status: reason === 'eliminated' ? 'Gugur' : 'Selesai',
      date: new Date().toLocaleString('id-ID')
    };
    setLatestResult(result);
    saveHistory(result);
    navigate('/result');
  }

  // ---------- Timer permainan (hanya jalan saat lagu diputar) ----------
  useEffect(() => {
    if (!playing || !gameRunning) return; // timer tidak jalan saat intro / pause
    const id = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
      if (settings.duration !== 'full' && elapsedRef.current >= Number(settings.duration) * 60) {
        finishGame('time-up');
      }
    }, 1000);
    return () => clearInterval(id);
  }, [playing, gameRunning, settings.duration]);

  // ---------- Loop karaoke: dipanggil tiap frame saat lagu diputar ----------
  tickRef.current = () => {
    if (!playingRef.current || finishedRef.current) return;
    const t = getTime();
    setNow(t);

    // Game baru dimulai saat baris lirik pertama tiba (sebelum itu = intro)
    if (!gameRunningRef.current && lines.length && t >= lines[0].start) {
      gameRunningRef.current = true;
      setGameRunning(true);
    }

    const idx = lines.findIndex(l => t >= l.start && t < l.end);
    if (idx !== lineIdxRef.current) {
      // Baris sebelumnya selesai dinyanyikan: kalau belum selesai diketik -> miss
      if (lineIdxRef.current >= 0 && !lineDoneRef.current) {
        updateStats(s => ({ ...s, misses: s.misses + 1 }));
        if (statsRef.current.misses >= settings.missLimit) {
          finishGame('eliminated');
          return;
        }
      }
      lineIdxRef.current = idx;
      wordIdxRef.current = 0;
      lineDoneRef.current = false;
      setActiveIdx(idx);
      setWordResults([]);
    }

    const lastEnd = lines.length ? lines[lines.length - 1].end : 0;
    if (t >= lastEnd || t >= endAt) finishGame('completed');
  };

  useEffect(() => {
    if (!playing) return;
    let raf;
    const loop = () => {
      tickRef.current();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  // ---------- Kontrol putar ----------
  async function play() {
    const audio = audioRef.current;
    applyPlaybackRate();

    if (!startedRef.current) {
      startedRef.current = true;
      clockRef.current.base = startAt;
      if (audio && !silentRef.current) {
        try { audio.currentTime = startAt; } catch { /* diabaikan */ }
      }
    }
    if (audio && !silentRef.current) {
      try { await audio.play(); } catch { enableSilentMode(); }
    }
    if (silentRef.current) clockRef.current.startedAt = performance.now();
    playingRef.current = true;
    setPlaying(true);
  }

  function pause() {
    if (silentRef.current) clockRef.current.base = getTime();
    else audioRef.current?.pause();
    playingRef.current = false;
    setPlaying(false);
  }

  // ---------- Mengetik ----------
  function submitWord(event) {
    if (event.key !== ' ') return;
    event.preventDefault();
    const answer = typed.trim();
    const line = lines[lineIdxRef.current];
    if (!answer || !playingRef.current || !line || lineDoneRef.current) return;

    const target = line.words[wordIdxRef.current].text;
    const ok = normalizeWord(answer) === normalizeWord(target);
    updateStats(s => ({
      ...s,
      total: s.total + 1,
      correct: s.correct + (ok ? 1 : 0),
      errors: s.errors + (ok ? 0 : 1)
    }));
    setWordResults(r => [...r, ok ? 'ok' : 'bad']);
    wordIdxRef.current += 1;
    if (wordIdxRef.current >= line.words.length) lineDoneRef.current = true;
    setTyped('');
  }

  // ---------- Tampilan ----------
  const t = now ?? startAt;
  const focusIdx = activeIdx >= 0 ? activeIdx : lines.findIndex(l => l.start > t);
  const focusLine = focusIdx >= 0 ? lines[focusIdx] : null;
  const prevLine = focusIdx > 0 ? lines[focusIdx - 1] : null;
  const nextLines = focusIdx >= 0 ? lines.slice(focusIdx + 1, focusIdx + 3) : [];
  const lineIsActive = activeIdx >= 0 && focusIdx === activeIdx;
  const lineDone = lineIsActive && wordResults.length >= (focusLine?.words.length ?? 0);

  return (
    <section className="typing-page">
      <div className="section-heading">
        <p className="eyebrow">NOW PLAYING · {settings.speed}× SPEED</p>
        <h1>{selectedSong.title} <span>♫</span></h1>
        <p>Ketik kata yang sedang disorot, lalu tekan Space untuk mengunci.</p>
      </div>
      <div className="typing-stats">
        <div><strong>{calculateWpm(stats.correct * 5, Math.max(elapsed, 1))}</strong><small>WPM</small></div>
        <div><strong>{calculateAccuracy(stats.correct, stats.total)}%</strong><small>Accuracy</small></div>
        <div><strong>{stats.errors}</strong><small>Errors</small></div>
        <div><strong>{stats.misses}/{settings.missLimit}</strong><small>Missed lines</small></div>
        <div><strong>{formatTime(elapsed)}</strong><small>Time</small></div>
      </div>
      <div className="scrapbook-card lyric-card">
        <div className="lyric-top">
          <span>✦ your lyric notebook</span>
          <span>LINE {Math.max(focusIdx + 1, 0)}/{lines.length}</span>
        </div>

        <div className="karaoke">
          <p className="k-side">{prevLine?.text || '\u00A0'}</p>
          <p className="k-current">
            {focusLine ? focusLine.words.map((word, i) => {
              const result = lineIsActive ? wordResults[i] : undefined;
              const isNext = lineIsActive && !lineDone && i === wordResults.length;
              const singing = lineIsActive && t >= word.start && t < word.end;
              return (
                <span key={i}
                  className={`k-word${result ? ` ${result}` : ''}${isNext ? ' k-next' : ''}${singing ? ' singing' : ''}`}
                  style={{ '--p': lineIsActive ? wordProgress(word, t) : 0 }}>
                  {word.text}
                </span>
              );
            }) : <span className="k-empty">{startedRef.current ? 'The lyrics are finished! ✿' : 'Tekan ▶ Start untuk mulai'}</span>}
          </p>
          <p className="k-status">
            {!gameRunning && focusLine && startedRef.current && `♪ intro… lirik mulai ${Math.max(1, Math.ceil((focusLine.start - t) / settings.speed))} dtk lagi`}
            {gameRunning && !lineIsActive && focusLine && '♪ get ready…'}
            {lineDone && '✓ baris selesai, tunggu baris berikutnya'}
            {'\u00A0'}
          </p>
          {nextLines.map(l => <p key={l.id} className="k-side">{l.text}</p>)}
        </div>

        <input ref={inputRef} className="typing-input" value={typed} onChange={e => setTyped(e.target.value)}
          onKeyDown={submitWord} disabled={!playing || !gameRunning} autoComplete="off" autoCapitalize="off" spellCheck={false}
          placeholder={!playing ? 'Tekan ▶ Start dulu' : !gameRunning ? '♪ Intro… tunggu lirik pertama' : 'Ketik kata berikutnya, lalu tekan Space...'} />
        <div className="typing-actions">
          {playing
            ? <button className="button" onClick={pause}>⏸ Pause</button>
            : <button className="button" onClick={play}>▶ {startedRef.current ? 'Resume' : 'Start'}</button>}
          <button className="button button-light" onClick={() => finishGame('completed')}>Finish test</button>
        </div>

        {/* Audio dimuat otomatis dari songs.js (field `audio`). Pengguna tidak perlu memilih file. */}
        <audio ref={audioRef} src={selectedSong.audio} preload="auto"
          onLoadedMetadata={e => {
            applyPlaybackRate();
            if (Number.isFinite(e.target.duration) && !startedRef.current) setAudioDuration(e.target.duration);
          }}
          onError={enableSilentMode}
          onEnded={() => finishGame('completed')} />

        {silentMode && (
          <p className="audio-warning">
            🎵 File MP3 belum ditemukan di <code>public{selectedSong.audio}</code>. Game tetap bisa dicoba tanpa suara.
            Masukkan file mp3 ke folder <code>public/songs/</code> lalu refresh halaman.
          </p>
        )}
      </div>
    </section>
  );
}
