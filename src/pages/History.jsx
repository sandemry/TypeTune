import { useState } from 'react';
import { Link } from 'react-router-dom';
import { clearHistory, getHistory } from '../utils/storage';

export default function History() {
  const [history, setHistory] = useState(getHistory());

  function removeHistory() {
    if (window.confirm('Hapus semua riwayat permainan?')) {
      clearHistory();
      setHistory([]);
    }
  }

  return (
    <section>
      <div className="section-heading">
        <p className="eyebrow">YOUR LITTLE JOURNAL</p>
        <h1>Typing history <span>♡</span></h1>
        <p>Every practice makes progress.</p>
      </div>
      {history.length > 0 ? (
        <>
          <div className="history-list">
            {history.map(item => (
              <article className="history-card" key={item.id}>
                <div><h3>{item.song}</h3><p>{item.date}</p></div>
                <div className="history-metric"><strong>{item.wpm}</strong><small>WPM</small></div>
                <div className="history-metric"><strong>{item.accuracy}%</strong><small>Accuracy</small></div>
                <span className={`level ${item.status === 'Gugur' ? 'hard' : 'easy'}`}>{item.status}</span>
              </article>
            ))}
          </div>
          <button className="button button-light" onClick={removeHistory}>Clear history</button>
        </>
      ) : (
        <div className="scrapbook-card empty-state">
          <h2>No history yet ✿</h2>
          <p>Your completed sessions will appear here.</p>
          <Link className="button" to="/songs">Choose a song</Link>
        </div>
      )}
    </section>
  );
}
