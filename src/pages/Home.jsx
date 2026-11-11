import { Link } from 'react-router-dom';
import Sticker from '../components/Sticker';

export default function Home() {
  return (
    <section className="hero scrapbook-card">
      <div className="hero-copy">
        <Sticker>your little music corner ✦</Sticker>
        <p className="eyebrow">MUSIC × TYPING × FUN</p>
        <h1>Feel the music.<br /><em>Type the lyrics.</em></h1>
        <p className="hero-description">
          Karaoke, but make it typing! Pilih lagu, ikuti iramanya, dan lihat seberapa cepat
          jari-jarimu bergerak.
        </p>
        <div className="hero-actions">
          <Link className="button" to="/songs">Start typing ↗</Link>
          <Link className="text-link" to="/history">See my history</Link>
        </div>
      </div>
      <div className="hero-art">
        <div className="cd">
          <div className="cd-center"><span>SOUR</span><small>TypeTune mix</small></div>
        </div>
        <span className="floating-sticker star">✦</span>
        <span className="floating-sticker heart">♥</span>
        <span className="floating-sticker smile">☻</span>
      </div>
    </section>
  );
}
