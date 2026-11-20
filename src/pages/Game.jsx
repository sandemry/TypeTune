import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pause, Play, TriangleAlert } from "lucide-react";
import { getSongById } from "../data/songs";
import DurationPicker from "../components/DurationPicker";
import SpeedSlider from "../components/SpeedSlider";
import TypingPanel from "../components/TypingPanel";
import GameStats from "../components/GameStats";
import { SongCover } from "../components/SongCard";
import useTypingGame from "../hooks/useTypingGame";
import { loadSpeed, saveResult, saveSpeed } from "../utils/storage";
import { clampSpeed } from "../utils/gameUtils";

export default function Game() {
  const { songId } = useParams();
  const navigate = useNavigate();
  const song = getSongById(songId);
  const [duration, setDuration] = useState(120);
  const [speed, setSpeed] = useState(() => clampSpeed(loadSpeed()));
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setStarted(false);
  }, [songId]);
  useEffect(() => {
    saveSpeed(speed);
  }, [speed]);

  const handleFinish = useCallback((result) => {
    saveResult(result);
    navigate("/result");
  }, [navigate]);

  if (!song) {
    return (
      <div className="play-wrap">
        <section className="setup">
          <h1>Track not found.</h1>
          <p className="muted">That song isn't in the library.</p>
          <Link to="/library" className="btn btn-primary btn-lg">Back to tracks</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="play-wrap">
      {!started ? (
        <section className="setup">
          <Link to="/library" className="back-link"><ArrowLeft size={15} /> Back to tracks</Link>
          <SongCover song={song} size="lg" />
          <h1>{song.title}</h1>
          <p className="muted">{song.album} by Olivia Rodrigo, {song.level.toLowerCase()} difficulty</p>

          <h2>How long?</h2>
          <DurationPicker value={duration} onChange={setDuration} />

          <h2>How fast?</h2>
          <SpeedSlider value={speed} onChange={setSpeed} />

          <button className="btn btn-primary btn-lg btn-block" onClick={() => { window.scrollTo(0, 0); setStarted(true); }}>
            Start typing <Play size={16} fill="currentColor" />
          </button>
          <p className="setup-hint">
            Intros and instrumentals play on their own. In lyric sections, one line shows at a time and
            its part of the song plays while you type. Finish the line (right or wrong) to get the next one.
          </p>

          {/* Kotak ini cuma muncul saat `npm run dev`, tidak ikut ke build produksi. */}
          {import.meta.env.DEV && (
            <div className="dev-hint">
              <strong>✏️ Dev note:</strong>{" "}
              {song.audioUrl
                ? <>audio set to <code>{song.audioUrl}</code>. Edit timeline in <code>src/data/songs.js</code>.</>
                : <>no mp3 yet, so it'll play silent. Drop a file in <code>public/audio/</code> and set <code>audioUrl</code> in <code>src/data/songs.js</code>.</>}
            </div>
          )}
        </section>
      ) : (
        <ActiveGame song={song} duration={duration} speed={speed} onSpeedChange={setSpeed} onFinish={handleFinish} />
      )}
    </div>
  );
}

function ActiveGame({ song, duration, speed, onSpeedChange, onFinish }) {
  const game = useTypingGame(song, duration, speed);
  const { finished, result, togglePause } = game;
  const reported = useRef(false);

  // Kirim hasil tepat sekali, walau React StrictMode menjalankan effect dua kali.
  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true;
      onFinish(result);
    }
  }, [finished, result, onFinish]);

  useEffect(() => {
    document.title = `${song.title} | typetune`;
    return () => { document.title = "typetune | Type the lyrics, run the music"; };
  }, [song.title]);

  // Esc = pause/resume.
  useEffect(() => {
    const onKey = (event) => { if (event.key === "Escape") togglePause(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePause]);

  const isInstrumental = game.segment?.type === "instrumental";

  return (
    <section className="stage">
      <header className="stage-bar">
        <Link to="/library" className="back-link"><ArrowLeft size={15} /> Exit</Link>
        <h1 className="stage-title">{song.title}</h1>
        <SpeedSlider value={speed} onChange={onSpeedChange} compact />
        <button className="icon-button" onClick={togglePause} aria-label={game.isPaused ? "Resume" : "Pause"}>
          {game.isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
        </button>
      </header>

      {game.audioStatus === "error" && (
        <div className="notice notice-warn" role="alert">
          <TriangleAlert size={16} /> Couldn't load the mp3, so the song plays silent. Check <code>audioUrl</code> in songs.js.
        </div>
      )}

      <GameStats
        accuracy={result.accuracy}
        wpm={result.wpm}
        errors={result.errors}
        progress={result.progress}
        timeLeft={game.timeLeft}
      />

      {game.isPaused && <div className="pause-banner">Paused. Press Esc or resume to continue.</div>}

      <div className="segment-label">
        <span className={`segment-dot ${isInstrumental ? "instrumental" : ""}`} />
        {game.segment?.label || "Song complete"}
        <span className="segment-mode">{isInstrumental ? "auto play" : "your turn"}</span>
      </div>

      {isInstrumental ? (
        <div className="instrumental-card" style={{ "--speed": speed }}>
          <div className="equalizer" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
          <h2>Instrumental break.</h2>
          <p>Just listen. Your next lyric is coming up.</p>
        </div>
      ) : (
        <TypingPanel
          words={game.words}
          wordStatuses={game.wordStatuses}
          lineNumber={game.lineNumber}
          totalLines={game.totalLines}
          nextLine={game.nextLine}
          inputValue={game.inputValue}
          onInputChange={game.onInputChange}
          onSubmit={game.submitLine}
          disabled={game.isPaused || !game.words.length}
          paused={game.isPaused}
          lastResult={game.lastResult}
        />
      )}
      <p className="stage-note">Finish a line and the next one appears. Wrong words still move the song forward.</p>
    </section>
  );
}
