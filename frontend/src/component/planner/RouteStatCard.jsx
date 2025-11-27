import { formatMetric } from "./helpers";

const ICONS = {
  Cheapest: "/fare.png",
  Shortest: "/station.png",
};

export default function RouteStatCard({ label, value, unit, detail, highlighted, onSelect }) {
  const display = formatMetric(value) ?? "--";

  const clickable = typeof onSelect === "function" && value !== null;
  const iconSrc = ICONS[label];

  return (
    <div
      onClick={clickable ? onSelect : undefined}
      className={`rounded-lg border p-4 transition cursor-pointer ${
        highlighted
          ? "border-transparent bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--hot)] text-[#050914] shadow-xl accent-glow"
          : "border-[var(--border)] bg-[#0c152a]/70 text-[var(--text-primary)] hover:border-[var(--accent-2)]"
      }`}
    >
      <p
        className={`flex items-center gap-2 text-xs tracking-wide font-semibold ${
          highlighted ? "text-[#0c152a]" : "text-[var(--text-secondary)]"
        }`}
      >
        {iconSrc && (
          <img src={iconSrc} alt={label} className="w-5 h-5 object-contain" />
        )}
        {label}
      </p>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-semibold">{display}</span>
        {unit && (
          <span
            className={`text-sm ${
              highlighted ? "text-[#0c152a]" : "text-[var(--text-secondary)]"
            }`}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
