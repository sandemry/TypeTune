import { useId } from "react";
import {
  SPEED_MAX, SPEED_MIN, SPEED_STEP, SPEED_STOPS,
  clampSpeed, formatSpeed, speedVibe
} from "../utils/gameUtils";

// Slider kecepatan: 0.5x, 0.75x, 1x ... 2x. Rentangnya diatur di utils/gameUtils.js.
export default function SpeedSlider({ value, onChange, compact = false }) {
  const id = useId();
  const fill = ((value - SPEED_MIN) / (SPEED_MAX - SPEED_MIN)) * 100;
  const last = SPEED_STOPS.length - 1;

  return (
    <div className={`speed ${compact ? "speed-compact" : ""}`}>
      <div className="speed-readout">
        <label htmlFor={id}>{compact ? "Speed" : "Song speed"}</label>
        <strong>{formatSpeed(value)}</strong>
        {!compact && <span className="speed-vibe">{speedVibe(value)}</span>}
      </div>
      <input
        id={id}
        type="range"
        min={SPEED_MIN}
        max={SPEED_MAX}
        step={SPEED_STEP}
        value={value}
        onChange={(event) => onChange(clampSpeed(event.target.value))}
        aria-valuetext={`${formatSpeed(value)}, ${speedVibe(value)}`}
        style={{ "--fill": `${fill}%` }}
      />
      {!compact && (
        <div className="speed-ticks" aria-hidden="true">
          {SPEED_STOPS.map((stop, i) => (
            <span
              key={stop}
              className={stop === value ? "on" : ""}
              style={{ left: `calc(14px + (100% - 28px) * ${i / last})` }}
            >
              {formatSpeed(stop)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
