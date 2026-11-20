import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, Activity, Gauge, History, Lock, Music, Timer, RotateCcw } from "lucide-react";
import { songs } from "../data/songs";
import SongGrid from "../components/SongGrid";
import RansomWord from "../components/RansomWord";
import { isCorrectWord } from "../utils/gameUtils";

const STAR = "M0-14C1-5 5-1 14 0 5 1 1 5 0 14-1 5-5 1-14 0-5-1-1-5 0-14Z";
const INK = "#5F4467";
const Sparkle = ({ className = "", fill = "#F8DC6B", size = 40, style }) => (
  <svg className={`deco ${className}`} style={style} width={size} height={size} viewBox="-16 -16 32 32" aria-hidden="true">
    <path d={STAR} fill={fill} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

// Stiker kupu-kupu ala era SOUR.
const Butterfly = ({ x = 0, y = 0, r = 0, s = 1, a = "#E5558A", b = "#B5D9EE", fly }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} stroke={INK} strokeWidth="3" strokeLinejoin="round">
    <g className={fly ? "bob" : ""}>
      <path d="M0 0C-6-34-46-44-50-14-52 6-22 12 0 0Z" fill={a} /><path d="M0 0C-4 22-34 40-40 22-42 12-20 6 0 0Z" fill={b} />
      <path d="M0 0C6-34 46-44 50-14 52 6 22 12 0 0Z" fill={a} /><path d="M0 0C4 22 34 40 40 22 42 12 20 6 0 0Z" fill={b} />
      <path d="M0-12V16" strokeWidth="5" strokeLinecap="round" />
    </g>
  </g>
);
const ButterflyDeco = ({ className, size = 80, ...p }) => (
  <svg className={`deco ${className}`} width={size} height={size * .85} viewBox="-60 -50 120 100" aria-hidden="true"><Butterfly {...p} fly /></svg>
);
const Smiley = ({ x, y, r = 22, fill = "#F8DC6B" }) => (
  <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth="3" strokeLinecap="round">
    <circle r={r} fill={fill} /><path d={`M${-r * .4} ${-r * .2}v${r * .22}M${r * .4} ${-r * .2}v${r * .22}M${-r * .5} ${r * .2}q${r * .5} ${r * .5} ${r} 0`} fill="none" />
  </g>
);

// Hero: CD holografik penuh stiker. Tulisan "typetune" disusun dari bead huruf.
function SourCd() {
  const bead = ["#F4C6D1", "#B5D9EE", "#F8DC6B", "#BFE3B4"];
  return (
    <div className="cd">
      <div className="cd-disc" />
      <svg viewBox="0 0 480 480" role="img" aria-label="CD holografik penuh stiker kupu-kupu, smiley, bintang, dan bead huruf typetune">
        <circle cx="240" cy="240" r="68" fill="#FFFBF7" stroke={INK} strokeWidth="4" />
        <circle cx="240" cy="240" r="26" fill="#E3CCEA" stroke={INK} strokeWidth="4" />
        <path id="cd-arc" d="M104 240a136 136 0 0 1 272 0" fill="none" />
        <text fontSize="21" fill={INK} fontFamily="'Bagel Fat One', Georgia, serif" letterSpacing="1">
          <textPath href="#cd-arc" startOffset="50%" textAnchor="middle">type the lyrics, run the music</textPath>
        </text>
        <Butterfly x={118} y={118} r={-24} s={1.05} fly />
        <Butterfly x={92} y={350} r={18} s={.8} a="#B5D9EE" b="#F8DC6B" />
        <Smiley x={372} y={118} r={24} />
        <Smiley x={410} y={300} r={19} fill="#F4C6D1" />
        <g transform="translate(330 168) rotate(-24)" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round">
          <path d="M0 0h54a8 8 0 0 1 0 15H8a8 8 0 0 1 0-15" fill="#fff" />
        </g>
        <g transform="translate(398 388)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => <circle key={d} cx="0" cy="-23" r="12" fill="#E5558A" stroke={INK} strokeWidth="3" transform={`rotate(${d})`} />)}
          <Smiley x={0} y={0} r={17} />
        </g>
        <path transform="translate(60 240) scale(1.5)" d={STAR} fill="#F8DC6B" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path transform="translate(300 330) scale(1)" d={STAR} fill="#fff" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path transform="translate(436 208) scale(.8)" d={STAR} fill="#B5D9EE" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path transform="translate(190 330)" d="M0 8C-22-8-12-26 0-14 12-26 22-8 0 8Z" fill="#E5558A" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        {[..."typetune"].map((k, i) => (
          <g key={i} transform={`translate(${107 + i * 38} ${412 - Math.sin((i / 7) * Math.PI) * 0})`}>
            <circle r="17" fill="#fff" stroke={bead[i % 4]} strokeWidth="5" />
            <circle r="17" fill="none" stroke={INK} strokeWidth="2" />
            <text y="7" textAnchor="middle" fontSize="19" fill={INK} fontFamily="'Bagel Fat One', Georgia, serif">{k}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// Tirai pink dengan garland bintang, seperti kamar di ilustrasi referensi.
const Curtain = ({ side }) => (
  <svg className={`curtain curtain-${side}`} viewBox="0 0 120 800" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 0H120C98 130 124 250 96 380S114 620 88 800H0Z" fill="#F6A9C0" stroke={INK} strokeWidth="3" />
    <path d="M30 0C46 200 20 360 40 800M64 0C84 220 54 400 70 800" fill="none" stroke={INK} strokeWidth="2.5" opacity=".55" />
  </svg>
);

const PHRASE = "hum a little and type a little and never let the song stop".split(" ");

// Demo mini: aturan sama dengan game asli. Kata dikunci dengan spasi, salah pun maju.
function Demo() {
  const [value, setValue] = useState("");
  const [log, setLog] = useState([]);
  const done = log.length === PHRASE.length;
  const hits = log.filter(Boolean).length;
  let streak = 0, best = 0;
  log.forEach((ok) => { streak = ok ? streak + 1 : 0; best = Math.max(best, streak); });

  const lock = () => {
    if (!value.trim() || done) return;
    setLog([...log, isCorrectWord(value, PHRASE[log.length])]);
    setValue("");
  };
  return (
    <div className="demo-card">
      <p className="demo-line" aria-label="Practice lyric">
        {PHRASE.map((w, i) => (
          <span key={i} className={`dw ${i < log.length ? (log[i] ? "dw-ok" : "dw-bad") : i === log.length ? "dw-now" : ""}`}>{w}</span>
        ))}
      </p>
      <label className="sr-only" htmlFor="demo-input">Type the highlighted word</label>
      <input
        id="demo-input" className="demo-input" value={value} disabled={done} autoComplete="off" spellCheck="false"
        placeholder={done ? "All done" : "Type the yellow word, then press space"}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); lock(); } }}
      />
      <div className="demo-track" role="progressbar" aria-valuenow={log.length} aria-valuemin={0} aria-valuemax={PHRASE.length}>
        <i style={{ width: `${(log.length / PHRASE.length) * 100}%` }} />
      </div>
      <dl className="demo-stats">
        <div><dd>{log.length ? Math.round((hits / log.length) * 100) : 100}%</dd><dt>Accuracy</dt></div>
        <div><dd>{streak}</dd><dt>Combo</dt></div>
        <div><dd>{best}</dd><dt>Best combo</dt></div>
      </dl>
      {done && (
        <p className="demo-done">
          {hits === PHRASE.length ? "Flawless run." : `${hits} of ${PHRASE.length} right.`}{" "}
          <button className="btn btn-secondary" onClick={() => { setLog([]); setValue(""); }}><RotateCcw size={15} /> Try again</button>
        </p>
      )}
    </div>
  );
}

const FEATURES = [
  { icon: Lock, color: "#F8DC6B", title: "Lock every word", text: "Press space to lock a word. Right or wrong, it's final and the song moves on." },
  { icon: Music, color: "#B5D9EE", title: "The song follows you", text: "Each locked word plays the next slice of the track. Stop typing and the music waits." },
  { icon: Gauge, color: "#F7B58B", title: "Speed from 0.5x to 2x", text: "Slow it down to learn, speed it up to show off. Change it any time, mid-song." },
  { icon: Timer, color: "#BFE3B4", title: "Pick your run length", text: "Two minutes, three, five, or the full song. Your speed choice is remembered." },
  { icon: Activity, color: "#F4C6D1", title: "Live stats", text: "Watch WPM, accuracy, misses and song progress update after every word." },
  { icon: History, color: "#F8DC6B", title: "Breaks and history", text: "Instrumentals play on their own. Pause with Esc and review your recent runs." }
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <Curtain side="l" /><Curtain side="r" />
        {[["12%", "#F8DC6B"], ["34%", "#E5558A"], ["58%", "#B5D9EE"], ["80%", "#F8DC6B"]].map(([t, c], i) => (
          <span key={t}>
            <Sparkle size={30} fill={c} style={{ top: t, left: "clamp(40px,7vw,104px)" }} />
            <Sparkle size={30} fill={c} style={{ top: `calc(${t} + 6%)`, right: "clamp(40px,7vw,104px)" }} />
          </span>
        ))}
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <h1>Type the lyrics.<br />Run the music.</h1>
            <p className="hero-description">
              Your Olivia Rodrigo soundtrack, typed one word at a time. Every word you lock in plays the next piece of the song.
              Pick a track, set your speed, and type along.
            </p>
            <div className="hero-actions">
              <Link to="/library" className="btn btn-primary btn-lg">Pick a track</Link>
              <a href="#try-it" className="btn btn-secondary btn-lg">Try a round <ArrowDown size={16} /></a>
            </div>
            <p className="hero-note">{songs.length} tracks ready, from 0.5x to 2x speed.</p>
          </div>
          <div className="hero-art"><SourCd /></div>
        </div>
      </section>

      <section className="sect s-orchid" id="try-it">
        <ButterflyDeco className="d-a" size={92} />
        <div className="wrap demo">
          <div>
            <h2>Take a practice round</h2>
            <p className="sect-lead">Type the yellow word, press space, repeat. Same rules as the real game, minus the music.</p>
          </div>
          <Demo />
        </div>
      </section>

      <section className="sect s-cream" id="features">
        <div className="wrap">
          <h2>Everything you need for a sad-girl singalong</h2>
          <p className="sect-lead">Built for typing along to songs you love.</p>
          <ul className="features">
            {FEATURES.map(({ icon: Icon, color, title, text }) => (
              <li key={title} className="feature" style={{ "--f": color }}>
                <span className="feature-icon"><Icon size={24} strokeWidth={2.4} color="#5F4467" /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sect s-sky" id="how-it-works">
        <div className="wrap">
          <h2>How to play</h2>
          <ol className="strip">
            <li className="frame" style={{ "--f": "#F8DC6B" }}>
              <div className="frame-art"><RansomWord text="hum" size="lg" /></div>
              <h3>1. Read the word</h3><p>The next lyric word is highlighted for you.</p>
            </li>
            <li className="frame" style={{ "--f": "#F4C6D1" }}>
              <div className="frame-art"><span className="keycap">space</span></div>
              <h3>2. Lock it in</h3><p>Hit space to commit, even if you slipped.</p>
            </li>
            <li className="frame" style={{ "--f": "#BFE3B4" }}>
              <div className="frame-art"><div className="equalizer" aria-hidden="true"><i /><i /><i /><i /><i /></div></div>
              <h3>3. Hear it play</h3><p>The song moves forward with every word.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="sect s-tracks s-butter">
        <div className="wrap">
          <div className="section-heading">
            <h2>Pick a track from the album</h2>
            <Link to="/library" className="btn btn-secondary">See all tracks</Link>
          </div>
          <SongGrid songs={songs.slice(0, 3)} />
        </div>
      </section>

      <section className="sect s-orchid cta-end">
        <ButterflyDeco className="d-b" size={84} a="#B5D9EE" b="#F8DC6B" r={14} />
        <ButterflyDeco className="d-c" size={70} r={-16} />
        <div className="wrap">
          <h2>Ready when you are.</h2>
          <p className="sect-lead" style={{ margin: "12px auto 26px" }}>Your first song is one click away.</p>
          <Link to="/library" className="btn btn-primary btn-lg">Start typing</Link>
        </div>
      </section>
    </>
  );
}
