// Teks "ransom note": tiap huruf punya tile warna, font, dan kemiringan sendiri.
// Warna dibatasi ke palet (maize, fawn, cream, lavender, iris) supaya tetap harmonis.
// Dibuat deterministik (bukan random) supaya tidak berubah-ubah tiap render.

const COLORS = ["maize", "fawn", "cream", "lavender", "iris"];

export default function RansomWord({ text, size = "md", className = "" }) {
  const words = String(text).split(" ").filter(Boolean);
  let n = 0; // penghitung huruf global supaya warna tidak mengulang tiap kata
  return (
    <span className={`ransom ransom-${size} ${className}`}>
      <span className="sr-only">{text}</span>
      {words.map((word, w) => (
        <span key={w} className="ransom-word" aria-hidden="true">
          {[...word].map((ch, i) => {
            const seed = ch.charCodeAt(0) + (n++) * 7;
            return (
              <span
                key={i}
                className={`tile tile-${COLORS[seed % COLORS.length]} tile-f${(seed >> 1) % 4}`}
                style={{ "--tilt": `${(seed % 7) - 3}deg`, "--lift": `${(seed % 5) - 2}px` }}
              >
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
