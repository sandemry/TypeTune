import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

export default function GameSettings() {
  const navigate = useNavigate();
  const { selectedSong, settings, setSettings } = useGame();

  function update(key, value) {
    setSettings(current => ({ ...current, [key]: value }));
  }

  return (
    <section className="narrow-page">
      <p className="eyebrow">BEFORE THE MUSIC STARTS</p>
      <h1>Set your challenge <span>✿</span></h1>
      <div className="scrapbook-card settings-card">
        <p className="muted">Selected song</p>
        <h2>{selectedSong.title}</h2>
        <p>{selectedSong.album} · {selectedSong.level}</p>
        <label>Playback speed <strong>{settings.speed}×</strong>
          <input type="range" min="0.5" max="1.5" step="0.25" value={settings.speed}
            list="speed-ticks" onChange={e => update('speed', Number(e.target.value))} />
          <datalist id="speed-ticks">
            <option value="0.5" /><option value="0.75" /><option value="1" /><option value="1.25" /><option value="1.5" />
          </datalist>
          <span className="range-labels"><small>0.5×</small><small>0.75×</small><small>1×</small><small>1.25×</small><small>1.5×</small></span>
        </label>
        <label>Game duration
          <select value={settings.duration} onChange={e => update('duration', e.target.value)}>
            <option value="1">1 minute</option><option value="2">2 minutes</option>
            <option value="3">3 minutes</option><option value="5">5 minutes</option>
            <option value="full">Full song</option>
          </select>
        </label>
        <label>Start from
          <select value={settings.section} onChange={e => update('section', e.target.value)}>
            <option value="beginning">Beginning</option>
            <option value="verse">Verse</option>
            <option value="chorus">Chorus / Reff</option>
            <option value="custom">Custom time</option>
          </select>
        </label>
        {settings.section === 'custom' && (
          <div className="two-columns">
            <label>Start (seconds)<input type="number" min="0" value={settings.customStart}
              onChange={e => update('customStart', Number(e.target.value))} /></label>
            <label>End (seconds)<input type="number" min="1" value={settings.customEnd}
              onChange={e => update('customEnd', Number(e.target.value))} /></label>
          </div>
        )}
        <label>Miss limit
          <select value={settings.missLimit} onChange={e => update('missLimit', Number(e.target.value))}>
            <option value="3">3 lines</option><option value="5">5 lines (default)</option><option value="7">7 lines</option>
          </select>
        </label>
        <button className="button full-width" onClick={() => navigate('/play')}>Let's play! ↗</button>
      </div>
    </section>
  );
}
