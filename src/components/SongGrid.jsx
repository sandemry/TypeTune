import SongCard from "./SongCard";

export default function SongGrid({ songs }) {
  if (!songs.length) {
    return <div className="empty-state">Nothing matches that filter. Try a different combo.</div>;
  }
  return (
    <div className="song-grid">
      {songs.map((song) => <SongCard key={song.id} song={song} />)}
    </div>
  );
}
