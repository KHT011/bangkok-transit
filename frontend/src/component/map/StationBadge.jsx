export default function StationBadge({ code, lineColor = "#2ACC83" }) {
  if (!code) return null;

  const isHidden = lineColor === "transparent";

  return (
    <svg
      className="w-1.5 h-1.5 md:w-3 md:h-3 xl:w-4.5 xl:h-4.5"
      viewBox="0 0 12 12"
      preserveAspectRatio="xMidYMid meet"
    >
      <circle cx="6" cy="6" r="5" fill={lineColor} />

      {!isHidden && (
        <text
          x="50%"
          y="50%"
          fill="#000"
          fontSize="3.5"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {code}
        </text>
      )}
    </svg>
  );
}
