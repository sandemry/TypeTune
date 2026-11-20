import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { loadHistory, loadLastResult } from "../utils/storage";
import { formatSpeed } from "../utils/gameUtils";

export default function Result() {
  // ProtectedRoute sudah memastikan hasil ada. Storage hanya dibaca, tidak ditulis di sini
  // (penyimpanan dilakukan sekali di Game.jsx, jadi tidak dobel saat StrictMode).
  const result = useMemo(loadLastResult, []);
  const history = useMemo(() => loadHistory().slice(0, 5), []);
  if (!result) return null;

  return (
    <section className="play-wrap result-page">
      <div className="result-card">
        <h1>You ate that.</h1>
        <p className="result-song">{result.songTitle} at {formatSpeed(result.speed ?? 1)}</p>
        <div className="result-score">{result.accuracy}<span>%</span><small>accuracy</small></div>
        <div className="result-grid">
          <div><strong>{result.wpm}</strong><span>WPM</span></div>
          <div><strong>{result.errors}</strong><span>Misses</span></div>
          <div><strong>{result.completedWords}</strong><span>Words typed</span></div>
          <div><strong>{result.progress}%</strong><span>Song progress</span></div>
        </div>
        <div className="result-actions">
          <Link to={`/play/${result.songId}`} className="btn btn-solid"><RotateCcw size={16} /> Run it back</Link>
          <Link to="/library" className="btn btn-outline">Pick another <ArrowUpRight size={16} /></Link>
        </div>
      </div>

      {history.length > 1 && (
        <div className="history-card">
          <h2>Recent runs</h2>
          <ul>
            {history.map((run) => (
              <li key={run.playedAt}>
                <span className="h-title">{run.songTitle}</span>
                <span>{formatSpeed(run.speed ?? 1)}</span>
                <span>{run.wpm} WPM</span>
                <span>{run.accuracy}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
