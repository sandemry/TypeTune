import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { songs } from '../data/songs';
import { useGame } from '../context/GameContext';
import SongCard from '../components/SongCard';

export default function Songs() {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('All');
  const navigate = useNavigate();
  const { setSelectedSong } = useGame();

  const filteredSongs = useMemo(() => songs.filter(song =>
    song.title.toLowerCase().includes(query.toLowerCase()) &&
    (level === 'All' || song.level === level)
  ), [query, level]);

  function chooseSong(song) {
    setSelectedSong(song);
    navigate('/settings');
  }

  return (
    <section>
      <div className="section-heading">
        <p className="eyebrow">THE PLAYLIST</p>
        <h1>Pick your song <span>♡</span></h1>
        <p>Choose a track and get ready to type along.</p>
      </div>
      <div className="toolbar">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search a song..." aria-label="Search song" />
        <select value={level} onChange={e => setLevel(e.target.value)} aria-label="Filter difficulty">
          <option>All</option><option>Easy</option><option>Medium</option><option>Hard</option>
        </select>
      </div>
      <div className="song-list">
        {filteredSongs.map(song => <SongCard key={song.id} song={song} onSelect={chooseSong} />)}
        {filteredSongs.length === 0 && <p className="empty-state">No songs found. Try another title ✿</p>}
      </div>
    </section>
  );
}
