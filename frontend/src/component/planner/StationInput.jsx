export default function StationInput({
  label,
  placeholder,
  value,
  onChange,
  suggestions = [],
  onSelectSuggestion,
  disabled,
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[var(--text-secondary)]">{label}</label>
      <div className="relative">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full mt-1 rounded-lg border border-[var(--border)] bg-[#0c152a]/90 px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-2)] disabled:cursor-not-allowed disabled:opacity-50 shadow-inner"
        />
        {suggestions.length > 0 && (
          <ul
            className="absolute left-0 right-0 top-full z-20 mt-2 max-h-38 rounded-2xl border border-[var(--border)] bg-[#0b1426]/95 shadow-2xl
            overflow-y-auto transition-all duration-200 ease-out
            scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800
            data-closed:scale-95 data-closed:opacity-0 data-closed:transform 
            data-enter:duration-100 data-enter:ease-out 
            data-leave:duration-75 data-leave:ease-in [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-track]:bg-gray-100
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gray-300
            dark:[&::-webkit-scrollbar-track]:bg-neutral-700
            dark:[&::-webkit-scrollbar-thumb]:bg-[#32B67A]"
          >
            {suggestions.map((station) => (
              <li
                key={station.station_code}
                onClick={() => onSelectSuggestion(station)}
                className="cursor-pointer px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-white/5"
              >
                <div className="flex items-center justify-between">
                  <span>{station.name_en}</span>
                  <span className="text-[var(--text-secondary)]">{station.station_code}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
