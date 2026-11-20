import { useMemo, useState } from "react";
import SongGrid from "../components/SongGrid";
import { songs } from "../data/songs";

const LEVELS = ["All", "Easy", "Medium", "Hard"];

export default function Library() {
  const [album, setAlbum] = useState("All");
  const [level, setLevel] = useState("All");

  const albums = useMemo(() => ["All", ...new Set(songs.map((song) => song.album))], []);
  const filteredSongs = useMemo(
    () => songs.filter((song) =>
      (album === "All" || song.album === album) && (level === "All" || song.level === level)),
    [album, level]
  );

  return (
    <>
      <section className="band">
        <div className="wrap">
          <h1>Find your next obsession.</h1>
          <p>{songs.length} tracks. Your tempo, your rules.</p>
        </div>
      </section>

      <div className="wrap library-body">
        <section className="filter-bar" aria-label="Filters">
          <div className="filter-group">
            <label htmlFor="album-filter">Album</label>
            <select id="album-filter" value={album} onChange={(e) => setAlbum(e.target.value)}>
              {albums.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="level-filter">Difficulty</label>
            <select id="level-filter" value={level} onChange={(e) => setLevel(e.target.value)}>
              {LEVELS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <p className="results-count">{filteredSongs.length} {filteredSongs.length === 1 ? "track" : "tracks"} found</p>
        </section>

        <SongGrid songs={filteredSongs} />
        <p className="catalog-note">Difficulty tags are rough for now and will be tuned after playtesting.</p>
      </div>
    </>
  );
}
