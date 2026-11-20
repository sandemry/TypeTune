import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  calculateAccuracy,
  calculateWpm,
  formatTime,
  isCorrectWord,
  normalizeWord
} from "../utils/gameUtils";
import { countWords } from "../utils/timeline";

/* ------------------------------------------------------------------ */
/*  Reducer: semua perpindahan segmen/baris ada di sini (pure, mudah dites) */
/* ------------------------------------------------------------------ */

// Cari segmen berikutnya yang bisa dimainkan (instrumental, atau lirik yang punya kata).
export function nextPlayableIndex(segments, from) {
  for (let i = from; i < segments.length; i += 1) {
    const seg = segments[i];
    if (seg.type === "instrumental" || seg.words?.length) return i;
  }
  return -1;
}

// Pecah input jadi kata-kata (spasi ganda diabaikan).
const splitTyped = (text) => String(text).trim().split(/\s+/).filter(Boolean);

// Baris dianggap habis diketik kalau kata terakhir sudah sepanjang targetnya
// (atau kamu menekan spasi setelahnya). Benar atau salah, tetap lanjut.
export function isLineComplete(typed, words) {
  const tokens = splitTyped(typed);
  if (!tokens.length || !words.length) return false;
  if (tokens.length > words.length) return true;
  if (tokens.length < words.length) return false;
  const last = tokens[tokens.length - 1];
  const target = words[words.length - 1];
  const need = Math.max(1, normalizeWord(target).length);
  const have = Math.max(1, normalizeWord(last).length);
  return have >= need || /\s$/.test(typed);
}

export function createInitialState(segments) {
  const first = nextPlayableIndex(segments, 0);
  return {
    segments,
    segmentIndex: Math.max(first, 0),
    typedWords: [],
    lastLine: [], // status tiap kata di baris yang barusan selesai
    lastResult: "",
    finished: first === -1
  };
}

export function gameReducer(state, action) {
  switch (action.type) {
    case "submit": {
      // Satu baris selesai. Salah pun tetap pindah ke baris lirik berikutnya.
      if (state.finished) return state;
      const seg = state.segments[state.segmentIndex];
      if (!seg || seg.type !== "lyrics") return state;

      const tokens = splitTyped(action.typed);
      const results = seg.words.map((target, i) => {
        const typed = tokens[i] ?? "";
        return { target, typed, correct: typed !== "" && isCorrectWord(typed, target) };
      });
      const typedWords = [...state.typedWords, ...results];
      const lastLine = results.map((r) => (r.correct ? "correct" : "wrong"));
      const lastResult = results.every((r) => r.correct) ? "correct" : "wrong";

      const next = nextPlayableIndex(state.segments, state.segmentIndex + 1);
      if (next === -1) return { ...state, typedWords, lastLine, lastResult, finished: true };
      return { ...state, typedWords, lastLine, lastResult, segmentIndex: next };
    }

    case "advance": {
      // `from` mencegah dobel-advance kalau timer kebetulan nembak dua kali.
      if (state.finished || state.segmentIndex !== action.from) return state;
      const next = nextPlayableIndex(state.segments, state.segmentIndex + 1);
      if (next === -1) return { ...state, finished: true };
      return { ...state, segmentIndex: next };
    }

    case "finish":
      return state.finished ? state : { ...state, finished: true };

    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/*  Hook utama                                                          */
/* ------------------------------------------------------------------ */

const TICK_MS = 100;

export default function useTypingGame(song, duration, speed) {
  const [state, dispatch] = useReducer(gameReducer, song.timeline, createInitialState);
  const [inputValue, setInputValue] = useState("");
  const [elapsed, setElapsed] = useState(0); // detik utuh, untuk UI
  const [isPaused, setIsPaused] = useState(false);
  const [audioStatus, setAudioStatus] = useState(song.audioUrl ? "loading" : "none");

  // Ref = nilai terbaru yang dibutuhkan timer tanpa bikin interval dibuat ulang.
  const stateRef = useRef(state);
  const pausedRef = useRef(isPaused);
  const speedRef = useRef(speed);
  stateRef.current = state;
  pausedRef.current = isPaused;
  speedRef.current = speed;

  const audioRef = useRef(null);
  const audioFailedRef = useRef(false);
  const elapsedRef = useRef(0);      // detik game (float)
  const segClockRef = useRef(0);     // detik "musik" yang sudah lewat di segmen instrumental

  const timeLimit = duration === "full" ? null : Number(duration);
  const segment = state.segments[state.segmentIndex];
  const isLyrics = segment?.type === "lyrics";
  const words = isLyrics ? segment.words : [];

  /* ---- 1. Audio element ---- */
  useEffect(() => {
    if (!song.audioUrl) return undefined;
    const audio = new Audio();
    audio.preload = "auto";
    audio.preservesPitch = true;
    audio.src = song.audioUrl;
    audioFailedRef.current = false;

    const onReady = () => setAudioStatus("ready");
    const onError = () => {
      audioFailedRef.current = true;
      setAudioStatus("error");
    };
    audio.addEventListener("canplay", onReady);
    audio.addEventListener("error", onError);
    audioRef.current = audio;

    return () => {
      audio.removeEventListener("canplay", onReady);
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
  }, [song.audioUrl]);

  /* ---- 2. Audio "dirigen": main sampai titik yang sudah boleh didengar ---- */
  const driveAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audioFailedRef.current) return;

    const st = stateRef.current;
    const seg = st.segments[st.segmentIndex];
    if (pausedRef.current || st.finished || !seg) {
      if (!audio.paused) audio.pause();
      return;
    }
    if (audio.ended) return;

    if (audio.playbackRate !== speedRef.current) audio.playbackRate = speedRef.current;

    // Instrumental: putar sampai ujung segmen.
    // Lirik: audio baris itu langsung main saat barisnya tampil, sambil kamu mengetik.
    // Kalau audio habis duluan, berhenti di akhir baris dan menunggu kamu selesai.
    // Selesai mengetik = pindah ke baris berikutnya dan audio-nya main.
    const target = seg.end;

    const shouldPlay = audio.currentTime < target - 0.03;
    if (shouldPlay && audio.paused) audio.play().catch(() => {});
    else if (!shouldPlay && !audio.paused) audio.pause();
  }, []);

  /* ---- 3. Saat masuk segmen baru: reset jam segmen + seek audio kalau loncat ---- */
  useEffect(() => {
    segClockRef.current = 0;
    if (!segment) return;
    const audio = audioRef.current;
    // Sinkronkan audio ke awal segmen. Kalau kamu mengetik lebih cepat dari audio,
    // audio loncat ke baris yang baru (toleransi kecil supaya segmen nyambung tetap mulus).
    if (audio && Math.abs(audio.currentTime - segment.start) > 0.15) {
      try { audio.currentTime = segment.start; } catch { /* metadata belum siap, aman diabaikan */ }
    }
  }, [segment]);

  /* ---- 4. Sinkron audio tiap ada perubahan penting (tanpa nunggu tick) ---- */
  useEffect(() => {
    driveAudio();
  }, [driveAudio, isPaused, speed, state.segmentIndex, state.finished]);

  /* ---- 5. Jam game ---- */
  useEffect(() => {
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 1);
      last = now;

      const st = stateRef.current;
      if (pausedRef.current || st.finished) return;

      elapsedRef.current += dt;
      setElapsed(Math.floor(elapsedRef.current));

      const seg = st.segments[st.segmentIndex];
      if (seg?.type === "instrumental") {
        segClockRef.current += dt * speedRef.current; // speed 2x = instrumental lewat 2x lebih cepat
        if (segClockRef.current >= seg.duration) dispatch({ type: "advance", from: st.segmentIndex });
      }

      if (timeLimit !== null && elapsedRef.current >= timeLimit) {
        elapsedRef.current = timeLimit;
        setElapsed(timeLimit);
        dispatch({ type: "finish" });
      }
      driveAudio();
    }, TICK_MS);

    return () => window.clearInterval(id);
  }, [timeLimit, driveAudio]);

  /* ---- 6. Auto pause kalau tab disembunyikan (timer browser di-throttle) ---- */
  useEffect(() => {
    const onHide = () => { if (document.hidden) setIsPaused(true); };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  /* ---- Aksi untuk UI ---- */
  // Ketik bebas satu baris penuh. Begitu kata terakhir selesai (benar/salah), baris berganti.
  const handleInput = useCallback((raw) => {
    if (pausedRef.current || stateRef.current.finished) return;
    const value = raw.replace(/^\s+/, "").replace(/\s{2,}/g, " ");
    const st = stateRef.current;
    const seg = st.segments[st.segmentIndex];
    if (seg?.type === "lyrics" && isLineComplete(value, seg.words)) {
      dispatch({ type: "submit", typed: value });
      setInputValue("");
      return;
    }
    setInputValue(value);
  }, []);

  // Enter = kirim baris sekarang juga (kata yang belum diketik dihitung salah).
  const submitLine = useCallback(() => {
    if (!inputValue.trim() || isPaused || state.finished) return;
    dispatch({ type: "submit", typed: inputValue });
    setInputValue("");
  }, [inputValue, isPaused, state.finished]);

  const togglePause = useCallback(() => setIsPaused((p) => !p), []);

  /* ---- Turunan untuk tampilan ---- */
  const totalWords = useMemo(() => countWords(state.segments), [state.segments]);
  const completedWords = state.typedWords.length;
  const accuracy = calculateAccuracy(state.typedWords);
  const wpm = calculateWpm(completedWords, elapsed);
  const progress = totalWords ? Math.min(100, Math.round((completedWords / totalWords) * 100)) : 0;
  const errors = state.typedWords.filter((w) => !w.correct).length;


  // Status live tiap kata di baris aktif: selesai (benar/salah), sedang diketik, atau belum.
  const typedTokens = splitTyped(inputValue);
  const trailingSpace = /\s$/.test(inputValue);
  const activeIndex = !typedTokens.length ? 0 : trailingSpace ? typedTokens.length : typedTokens.length - 1;
  const wordStatuses = words.map((target, i) => {
    if (i < activeIndex) return isCorrectWord(typedTokens[i] ?? "", target) && typedTokens[i] ? "correct" : "wrong";
    if (i === activeIndex) {
      const partial = normalizeWord(typedTokens[i] && !trailingSpace ? typedTokens[i] : "");
      const ok = !partial || normalizeWord(target).startsWith(partial);
      return ok ? "current" : "current-typo";
    }
    return "next";
  });

  const lyricIndexes = state.segments.reduce((acc, seg, i) => (seg.type === "lyrics" ? [...acc, i] : acc), []);
  const lineNumber = Math.max(1, lyricIndexes.indexOf(state.segmentIndex) + 1);
  const totalLines = lyricIndexes.length;
  const nextSeg = state.segments.slice(state.segmentIndex + 1).find((seg) => seg.type === "lyrics");
  const nextLine = isLyrics && nextSeg ? nextSeg.text : "";
  const timeLeft = timeLimit === null ? "∞" : formatTime(timeLimit - elapsed);

  const result = useMemo(() => ({
    songId: song.id,
    songTitle: song.title,
    duration,
    speed,
    elapsed,
    accuracy,
    wpm,
    errors,
    completedWords,
    totalWords,
    progress,
    typedWords: state.typedWords,
    finished: state.finished
  }), [song.id, song.title, duration, speed, elapsed, accuracy, wpm, errors,
       completedWords, totalWords, progress, state.typedWords, state.finished]);

  return {
    segment,
    words,
    wordStatuses,
    lineNumber,
    totalLines,
    nextLine,
    inputValue,
    onInputChange: handleInput,
    submitLine,
    lastResult: state.lastResult,
    isPaused,
    togglePause,
    finished: state.finished,
    result,
    timeLeft,
    audioStatus
  };
}
