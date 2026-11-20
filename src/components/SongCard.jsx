import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import RansomWord from "./RansomWord";

export function SongCover({ song, size = "md" }) {
  return (
    <div className={`cover cover-${size} tone-${song.accent}`}>
      {song.cover ? (
        <img src={song.cover} alt={`${song.title} cover art`} loading="lazy" />
      ) : (
        <>
          <span className="cover-sun" aria-hidden="true" />
          <RansomWord text={song.title} size={size === "lg" ? "md" : "sm"} className="cover-title" />
        </>
      )}
    </div>
  );
}

export default function SongCard({ song }) {
  return (
    <article className="song-card">
      <SongCover song={song} />
      <div className="song-card-info">
        <div>
          <h3>{song.title}</h3>
          <p>{song.album}{song.durationLabel && song.durationLabel !== "-" ? `, ${song.durationLabel}` : ""}</p>
        </div>
        <span className={`level-pill level-${song.level.toLowerCase()}`}>{song.level}</span>
      </div>
      <Link className="btn btn-primary btn-block" to={`/play/${song.id}`}>
        <Play size={15} fill="currentColor" /> Play this one
      </Link>
    </article>
  );
}
