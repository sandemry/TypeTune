export default function GameStats({ accuracy, wpm, errors, progress, timeLeft }) {
  const stats = [
    { label: "Accuracy", value: `${accuracy}%` },
    { label: "WPM", value: wpm },
    { label: "Misses", value: errors },
    { label: "Time left", value: timeLeft }
  ];

  return (
    <section className="stats" aria-label="Live stats">
      <div className="progress-heading">
        <span>Song progress</span>
        <strong>{progress}%</strong>
      </div>
      <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <dl className="stats-row">
        {stats.map((stat) => (
          <div className="stat" key={stat.label}>
            <dd>{stat.value}</dd>
            <dt>{stat.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
