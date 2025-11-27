import { formatMetric } from "./helpers";
import { lineColors } from "../../utils/lineColors";

const LIGHT_TEXT_LINES = new Set([
  "MRT Yellow Line Monorail",
  "MRT Pink Line Monorail",
  "BTS Gold Line",
  "BTS Sukhumvit Line",
]);

export default function RouteDetailPanel({ route, isLoading, onBack }) {
  if (isLoading) {
    return (
      <div className="flex min-h-[520px] flex-col rounded-2xl frosted-surface p-6">
        <p className="text-sm text-[var(--text-secondary)]">
          Planning fastest, cheapest, and transfer-friendly paths...
        </p>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="flex min-h-[520px] flex-col rounded-3xl frosted-surface p-6">
        <button
          className="w-40 h-fit ml-auto rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:border-[var(--accent-2)] hover:text-[var(--text-primary)]"
          onClick={onBack}
        >
          Back to routes
        </button>
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
          Step-by-step guidance
        </h2>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          Choose a start and destination to see the detailed instructions,
          transfers, and line changes for your journey.
        </p>
      </div>
    );
  }

  const stats = route.stats || {};
  const steps = route.route_steps || [];
  const startStep = steps[0];
  const endStep = steps[steps.length - 1];

  return (
    <div className="flex flex-col rounded-2xl frosted-surface p-6 backdrop-blur">
      <div className="flex flex-col flex-wrap items-start justify-between gap-4">
        <div className="flex items-start justify-between w-full">
          {/* LEFT SIDE TEXT */}
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent)]">
              Step-by-step
            </p>
            <h2 className="my-1 text-2xl font-semibold text-[var(--text-primary)]">
              {route.path_type || "Recommended route"}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {formatMetric(route.fare_total) ?? "--"} THB ·{" "}
              {stats.total_stations ?? "--"} stations
            </p>
          </div>

          {/* RIGHT SIDE BUTTON */}
          <button
            className="w-40 h-fit ml-auto rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:border-[var(--accent-2)] hover:text-[var(--text-primary)]"
            onClick={onBack}
          >
            Back to routes
          </button>
        </div>

        {startStep && endStep && (
          <div className="text-sm text-[var(--text-primary)]">
            <div className="flex items-center">
              <p className="text-sm text-[var(--text-secondary)] me-2">From:</p>
              <p className="font-semibold">
                {startStep.station?.name || startStep.station?.name_en || "--"}{" "}
                {startStep.station?.code || startStep.station?.station_code
                  ? `(${
                      startStep.station?.code || startStep.station?.station_code
                    })`
                  : ""}
              </p>
            </div>
            <div className="mt-3 flex items-center">
              <p className="text-sm text-[var(--text-secondary)] me-2">To:</p>
              <p className="font-semibold">
                {endStep.station?.name || endStep.station?.name_en || "--"}{" "}
                {endStep.station?.code || endStep.station?.station_code
                  ? `(${
                      endStep.station?.code || endStep.station?.station_code
                    })`
                  : ""}
              </p>
            </div>
          </div>
        )}

        {/* Route Overview Description */}
        {route.route_description && (
          <div className="my-4 space-y-1 text-xs text-[var(--text-primary)] leading-relaxed">
            {route.route_description
              .replace(
                /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/gu,
                ""
              )
              .replace(/===.*?===/g, "")
              .trim()
              .split("\n")
              .filter((line) => line.trim().length > 0)
              .map((line, idx) => (
                <p key={idx}>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {idx + 1}.
                  </span>{" "}
                  {line.trim()}
                </p>
              ))}
          </div>
        )}

        {/* Fare Summary Section */}
        {route.fare_breakdown && Array.isArray(route.fare_breakdown) && (
          <div className="mt-6 rounded-2xl w-full border border-[var(--border)] bg-[#0c152a]/60 p-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Total Fare
            </h3>
            <p className="text-xl font-bold text-[var(--accent)] mt-1">
              {formatMetric(route.fare_total) ?? "0.00"} THB
            </p>

            <div className="mt-4 space-y-2 text-sm text-[var(--text-primary)]">
              {route.fare_breakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between border-b border-white/5 pb-2 last:border-none"
                >
                  <p>
                    <span className="font-semibold">{item.line}</span>:{" "}
                    {item.hops} hops
                  </p>
                  <p className="font-medium">{formatMetric(item.fare)} THB</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        className="mt-6 flex-1 space-y-5 overflow-y-auto pr-2 text-sm text-[var(--text-primary)]
        [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:rounded-full
        [&::-webkit-scrollbar-track]:bg-gray-900
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-gray-700"
      >
        {steps.length ? (
          steps.map((step, index) => {
            const badgeColor =
              lineColors[step.line] || "rgba(255,255,255,0.08)";
            const extraText = step.details || step.description;
            return (
              <div
                key={`${step.station?.code || index}-${index}`}
                className="flex gap-4"
              >
                <div className="flex flex-col items-center ">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--accent)] text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  {index !== steps.length - 1 && (
                    <span className="h-full w-px bg-[var(--accent)]"></span>
                  )}
                </div>

                <div className="flex-1 rounded-2xl border border-[var(--border)] bg-[#0c152a]/70 p-4">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {step.action || "Continue"}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {step.station?.name || step.station?.name_en || "Station"}{" "}
                    {step.station?.code || step.station?.station_code
                      ? `(${step.station?.code || step.station?.station_code})`
                      : ""}
                  </p>
                  {step.line && (
                    <span
                      className={`mt-3 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        LIGHT_TEXT_LINES.has(step.line)
                          ? "text-black"
                          : "text-white"
                      }`}
                      style={{ backgroundColor: badgeColor }}
                    >
                      {step.line}
                    </span>
                  )}
                  {extraText && (
                    <p className="mt-2 text-xs text-[var(--text-secondary)]">
                      {extraText}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">
            No instructions provided for this route.
          </p>
        )}
      </div>
    </div>
  );
}
