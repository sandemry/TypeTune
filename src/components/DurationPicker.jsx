// ✏️ [EDIT-ME] Pilihan durasi game. value = detik, atau "full" untuk sampai lagu habis.
export const DURATIONS = [
  { label: "2 min", value: 120 },
  { label: "3 min", value: 180 },
  { label: "5 min", value: 300 },
  { label: "Full song", value: "full" }
];

export default function DurationPicker({ value, onChange }) {
  return (
    <div className="chip-row" role="group" aria-label="Game duration">
      {DURATIONS.map((item) => (
        <button
          key={item.value}
          type="button"
          className={`chip ${value === item.value ? "selected" : ""}`}
          onClick={() => onChange(item.value)}
          aria-pressed={value === item.value}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
