import { Link, Navigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

export default function Result() {
  const { latestResult } = useGame();
  if (!latestResult) return <Navigate to="/songs" replace />;
  return (
    <section className="narrow-page">
      <div className="scrapbook-card result-card">
        <p className="eyebrow">YOUR SESSION IS OVER</p>
        <h1>{latestResult.status === 'Gugur' ? 'Oops, you got eliminated!' : 'You did it! ✿'}</h1>
        <p className="muted">{latestResult.song} · {latestResult.date}</p>
        <div className="result-grid">
          <div><strong>{latestResult.wpm}</strong><small>WPM</small></div>
          <div><strong>{latestResult.accuracy}%</strong><small>Accuracy</small></div>
          <div><strong>{latestResult.errors}</strong><small>Errors</small></div>
          <div><strong>{latestResult.misses}</strong><small>Missed lines</small></div>
        </div>
        <p>Keep practicing. Your fingers will find the rhythm!</p>
        <div className="hero-actions">
          <Link className="button" to="/songs">Play again</Link>
          <Link className="button button-light" to="/history">View history</Link>
        </div>
      </div>
    </section>
  );
}
