import { useEffect, useMemo, useRef, useState } from 'react';
import { songs } from '../data/songs';
import { buildLrc, formatLrcTime, parseLyricsInput } from '../utils/lrcSync';

const RATES = [0.5, 0.75, 1];

export default function LyricsSync() {
  const audioRef = useRef(null);
  const nextRef = useRef(null);
  const actionsRef = useRef({});
  const [songId, setSongId] = useState(songs[0].id);
  const [lyricsText, setLyricsText] = useState('');
  const [events, setEvents] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(0.75); // lebih lambat = lebih mudah menekan tepat waktu
  const [offset, setOffset] = useState(0.2); // kompensasi telat menekan (detik)
  const [clock, setClock] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [copied, setCopied] = useState(false);

  const song = songs.find(s => s.id === songId);
  const slug = (song.audio || '').split('/').pop().replace(/\.[^.]+$/, '') || 'lagu';
  const { textLines, sectionBefore } = useMemo(() => parseLyricsInput(lyricsText), [lyricsText]);
  const lineEvents = events.filter(e => e.kind === 'line');
  const nextIdx = lineEvents.length;
  const output = useMemo(() => buildLrc(textLines, sectionBefore, events), [textLines, sectionBefore, events]);
  const locked = events.length > 0;

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate, songId]);

  useEffect(() => { nextRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [nextIdx]);

  // ---------- Aksi ----------
  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = rate;
    if (audio.paused) audio.play().catch(() => setAudioError(true));
    else audio.pause();
  }

  function tap() {
    const audio = audioRef.current;
    if (!audio || audio.paused || nextIdx >= textLines.length) return;
    const time = Math.max(0, Math.round((audio.currentTime - offset) * 100) / 100);
    setEvents(list => [...list, { kind: 'line', idx: nextIdx, time }]);
  }

  function markGap() {
    const audio = audioRef.current;
    const last = events[events.length - 1];
    if (!audio || audio.paused || !last || last.kind !== 'line') return;
    const time = Math.max(0, Math.round((audio.currentTime - offset) * 100) / 100);
    setEvents(list => [...list, { kind: 'gap', time }]);
  }

  function undo() { setEvents(list => list.slice(0, -1)); }

  function reset() {
    if (events.length && !window.confirm('Hapus semua timestamp?')) return;
    setEvents([]);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* salin manual dari kotak hasil */ }
  }

  function download() {
    const blob = new Blob([output + '\n'], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.lrc`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Pintasan keyboard (tidak aktif saat mengetik di kotak teks)
  actionsRef.current = { tap, markGap, undo, togglePlay };
  useEffect(() => {
    function onKey(e) {
      if (['TEXTAREA', 'INPUT', 'SELECT'].includes(e.target.tagName)) return;
      const a = actionsRef.current;
      if (e.code === 'Space') { e.preventDefault(); a.tap(); }
      else if (e.code === 'Backspace') { e.preventDefault(); a.undo(); }
      else if (e.key === 'g' || e.key === 'G') a.markGap();
      else if (e.key === 'p' || e.key === 'P') a.togglePlay();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function changeSong(id) {
    setSongId(id);
    setEvents([]);
    setAudioError(false);
    setPlaying(false);
  }

  return (
    <section className="sync-page">
      <div className="section-heading">
        <p className="eyebrow">LYRICS TOOL</p>
        <h1>Tap-sync lirik <span>♪</span></h1>
        <p>Putar lagu, tekan <kbd>Space</kbd> tiap baris lirik mulai. Hasilnya langsung jadi file <code>.lrc</code>.</p>
      </div>

      <div className="scrapbook-card sync-card">
        <div className="sync-controls">
          <label>Lagu
            <select value={songId} onChange={e => changeSong(Number(e.target.value))}>
              {songs.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </label>
          <label>Kecepatan putar
            <select value={rate} onChange={e => setRate(Number(e.target.value))}>
              {RATES.map(r => <option key={r} value={r}>{r}×</option>)}
            </select>
          </label>
          <label>Kompensasi telat (dtk)
            <input type="number" min="0" max="1" step="0.05" value={offset}
              onChange={e => setOffset(Number(e.target.value))} />
          </label>
        </div>

        <label className="sync-lyrics">Paste lirik (satu baris per baris){locked && ' — terkunci, klik Reset untuk mengubah'}
          <textarea rows={7} value={lyricsText} disabled={locked} onChange={e => setLyricsText(e.target.value)}
            placeholder={'Paste lirik yang kamu punya izin untuk pakai.\nHeader seperti [Chorus] atau [Verse 1] otomatis dikenali.'} />
        </label>

        <audio key={song.id} ref={audioRef} src={song.audio} preload="auto"
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
          onError={() => setAudioError(true)}
          onTimeUpdate={e => setClock(e.target.currentTime)}
          onLoadedMetadata={e => { e.target.playbackRate = rate; }} />

        {audioError && (
          <p className="audio-warning">🎵 File MP3 belum ditemukan di <code>public{song.audio}</code>. Taruh mp3 di <code>public/songs/</code> lalu refresh.</p>
        )}

        <div className="sync-actions">
          <button className="button" onClick={togglePlay}>{playing ? '⏸ Pause (P)' : '▶ Play (P)'}</button>
          <button className="button sync-tap" onClick={tap} disabled={!playing || nextIdx >= textLines.length}>
            ● TAP — baris mulai (Space)
          </button>
          <button className="button button-light" onClick={markGap} disabled={!playing || events[events.length - 1]?.kind !== 'line'}>Tandai jeda (G)</button>
          <button className="button button-light" onClick={undo} disabled={!events.length}>↶ Undo (⌫)</button>
          <button className="button button-light" onClick={reset} disabled={!events.length}>Reset</button>
          <span className="sync-clock">{formatLrcTime(clock)}</span>
        </div>

        {textLines.length > 0 && (
          <ol className="sync-lines">
            {textLines.map((text, i) => {
              const mark = lineEvents[i];
              const isNext = i === nextIdx;
              return (
                <li key={i} ref={isNext ? nextRef : null} className={mark ? 'done' : isNext ? 'next' : ''}>
                  <span className="sync-time">{mark ? formatLrcTime(mark.time) : '--:--.--'}</span>
                  <span>{text}</span>
                </li>
              );
            })}
          </ol>
        )}

        <label className="sync-output">Hasil .lrc → simpan sebagai <code>src/data/lrc/{slug}.lrc</code>
          <textarea rows={8} readOnly value={output} placeholder="Hasil muncul di sini setelah kamu mulai menekan TAP." />
        </label>
        <div className="sync-actions">
          <button className="button" onClick={copy} disabled={!output}>{copied ? 'Tersalin ✓' : 'Salin'}</button>
          <button className="button button-light" onClick={download} disabled={!output}>Download {slug}.lrc</button>
        </div>
        <p className="small-note">Tip: setelah baris terakhir, tekan G sekali supaya baris terakhir punya akhir yang tepat.</p>
      </div>
    </section>
  );
}
