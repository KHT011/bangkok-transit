import { formatMetric } from "./helpers";
import { lineColors } from "../../utils/lineColors";

const LIGHT_TEXT_LINES = new Set([
  "MRT Yellow Line Monorail",
  "MRT Pink Line Monorail",
  "BTS Gold Line",
  "BTS Sukhumvit Line",
]);

export default function RouteOptionCard({ route, onSelect, isActive }) {
  const stats = route?.stats || {};
  const steps = route?.route_steps || [];
  const lineBadges = Array.from(
    new Set(
      steps
        .map((step) => step.line)
        .filter(Boolean)
    )
  );

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border p-4 text-left transition ${
        isActive
          ? "border-[var(--accent)] bg-[#0c152a]/90 shadow-lg accent-glow"
          : "border-[var(--border)] bg-[#0c152a]/70 hover:border-[var(--accent-2)]"
      }`}
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-[var(--text-secondary)]">
        <span>{route?.path_type || "Route"}</span>
        {/* {isActive && <span className="text-[#32B67A]">Viewed</span>} */}
      </div>
      <div className="mt-2 text-2xl font-semibold">
        {formatMetric(route?.fare_total) ?? "--"}
        <span className="ml-1 text-sm font-normal text-[var(--text-secondary)]">THB</span>
      </div>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">
        {stats.total_stations ?? "--"} stations ·{" "}
        {stats.total_transfers ?? stats.total_lines ?? "--"} transfers
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {lineBadges.map((line) => (
          <span
            key={`${route?.path_type}-${line}`}
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              LIGHT_TEXT_LINES.has(line) ? "text-black" : "text-white"
            }`}
            style={{
              backgroundColor: lineColors[line] || "rgba(255,255,255,0.1)",
            }}
          >
            {line.split(" ")[0] || line}
          </span>
        ))}
      </div>
    </button>
  );
}
