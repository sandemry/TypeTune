export default function SongCard({ song, onSelect }) {
  return (
    <article className="song-card">
      <div className="album-art"><span>{song.cover}</span><small>{song.album}</small></div>
      <div className="song-info">
        <h3>{song.title}</h3>
        <p>Olivia Rodrigo · {song.album} · {song.duration}</p>
        <span className={`level ${song.level.toLowerCase()}`}>{song.level}</span>
      </div>
      <button className="button button-small" onClick={() => onSelect(song)}>Choose</button>
    </article>
  );
}
