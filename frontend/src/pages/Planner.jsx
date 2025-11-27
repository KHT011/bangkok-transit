import { useEffect, useMemo, useRef, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useStations } from "../hooks/useStations";
import { useShortestPath } from "../hooks/useShortestPath";
import { useCheapestPath } from "../hooks/useCheapestPath";
import { useAllPaths } from "../hooks/useAllPaths";
import StationBadge from "../component/map/StationBadge";
import SystemFilterDropdown from "../component/planner/SystemFilterDropDown";
import RouteOptionCard from "../component/planner/RouteOptionCard";
import RouteStatCard from "../component/planner/RouteStatCard";
import RouteDetailPanel from "../component/planner/RouteDetailPanel";
import StationInput from "../component/planner/StationInput";
import {
  unwrapRoutePayload,
  toRouteArray,
  resolveStationCode,
  buildRouteKey,
  isSameRoute,
} from "../component/planner/helpers";
import { RotateCcw, Plus, Minus } from "lucide-react";

export default function Planner() {
  const {
    stations,
    isLoading: isStationsLoading,
    error: stationsError,
  } = useStations();

  const [startInput, setStartInput] = useState("");
  const [startStationCode, setStartStationCode] = useState("");

  const [targetInput, setTargetInput] = useState("");
  const [targetStationCode, setTargetStationCode] = useState("");
  const [filteredStart, setFilteredStart] = useState([]);
  const [filteredTarget, setFilteredTarget] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);
  const [formError, setFormError] = useState("");
  const [manualSelection, setManualSelection] = useState(false);

  const [showDetailsOnly, setShowDetailsOnly] = useState(false);

  const [systemFilter, setSystemFilter] = useState("all");

  const {
    pathData: shortestPayload,
    isLoading: isShortestLoading,
    error: shortestError,
    getShortestPath,
    resetPath: resetShortest,
  } = useShortestPath();
  const {
    pathData: cheapestPayload,
    isLoading: isCheapestLoading,
    error: cheapestError,
    getCheapestPath,
    resetPath: resetCheapest,
  } = useCheapestPath();
  const {
    pathData: allPayload,
    isLoading: isAllLoading,
    error: allError,
    getAllPaths,
    resetPath: resetAll,
  } = useAllPaths();

  const isPlanning = isShortestLoading || isCheapestLoading || isAllLoading;

  const getSuggestions = (value) => {
    const query = value.trim().toLowerCase();
    if (!query) return [];
    return stations
      .filter((station) => {
        const name = (station.name_en || "").trim().toLowerCase();
        const code = (station.station_code || "").trim().toLowerCase();
        return name.includes(query) || code.includes(query);
      })
      .slice(0, 8);
  };

  const handleStartChange = (next) => {
    setStartInput(next);
    setStartStationCode("");
    setFilteredStart(getSuggestions(next));
  };

  const handleTargetChange = (next) => {
    setTargetInput(next);
    setTargetStationCode("");
    setFilteredTarget(getSuggestions(next));
  };

  const handleSelectStart = (station) => {
    setStartInput(station.name_en);
    setStartStationCode(station.station_code);
    setFilteredStart([]);
  };

  const handleSelectTarget = (station) => {
    setTargetInput(station.name_en);
    setTargetStationCode(station.station_code);
    setFilteredTarget([]);
  };

  const handlePlanRoutes = async () => {
    const fromCode = resolveStationCode(startInput, startStationCode, stations);
    const toCode = resolveStationCode(targetInput, targetStationCode, stations);

    if (!fromCode || !toCode) {
      setFormError("Please pick both start and destination from the list.");
      return;
    }

    setFormError("");
    setManualSelection(false);
    setStartStationCode(fromCode);
    setTargetStationCode(toCode);
    setFilteredStart([]);
    setFilteredTarget([]);
    setActiveRoute(null);

    try {
      await Promise.all([
        getShortestPath(fromCode, toCode),
        getCheapestPath(fromCode, toCode),
        getAllPaths(fromCode, toCode),
      ]);
    } catch (err) {
      console.error(err);
      setFormError("Unable to plan route right now. Please retry.");
    }
  };

  const handleReset = () => {
    setStartInput("");
    setStartStationCode("");
    setTargetInput("");
    setTargetStationCode("");
    setFilteredStart([]);
    setFilteredTarget([]);
    setActiveRoute(null);
    setFormError("");
    setManualSelection(false);
    resetShortest();
    resetCheapest();
    resetAll();
  };

  const resolvedShortestRoute = useMemo(
    () => unwrapRoutePayload(shortestPayload),
    [shortestPayload]
  );
  const resolvedCheapestRoute = useMemo(
    () => unwrapRoutePayload(cheapestPayload),
    [cheapestPayload]
  );
  const resolvedAllRoutes = useMemo(
    () => toRouteArray(allPayload),
    [allPayload]
  );

  useEffect(() => {
    if (manualSelection) return;
    const priority = [];
    if (resolvedShortestRoute) priority.push(resolvedShortestRoute);
    if (resolvedCheapestRoute) priority.push(resolvedCheapestRoute);
    if (resolvedAllRoutes[0]) priority.push(resolvedAllRoutes[0]);

    const nextRoute = priority.find(Boolean) || null;
    if (nextRoute && !isSameRoute(activeRoute, nextRoute)) {
      setActiveRoute(nextRoute);
    }
    if (!nextRoute && activeRoute) {
      setActiveRoute(null);
    }
  }, [
    manualSelection,
    resolvedShortestRoute,
    resolvedCheapestRoute,
    resolvedAllRoutes,
    activeRoute,
  ]);

  const routeOptions = useMemo(() => {
    const merged = [...resolvedAllRoutes];
    if (resolvedShortestRoute) merged.push(resolvedShortestRoute);
    if (resolvedCheapestRoute) merged.push(resolvedCheapestRoute);

    const seen = new Set();
    return merged.filter((route) => {
      if (!route) return false;
      const key = buildRouteKey(route);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [resolvedAllRoutes, resolvedShortestRoute, resolvedCheapestRoute]);

  const filteredRouteOptions = useMemo(() => {
    if (systemFilter === "all") return routeOptions;

    return routeOptions.filter((route) => {
      const lines = route.route_steps
        .map((s) => s.line?.toLowerCase() || "")
        .filter(Boolean);

      if (systemFilter === "BTS") {
        return lines.some((l) => l.includes("bts"));
      }
      if (systemFilter === "MRT") {
        return lines.some((l) => l.includes("mrt"));
      }
      if (systemFilter === "Airport") {
        return lines.some((l) => l.includes("airport"));
      }
      if (systemFilter === "SRT") {
        return lines.some((l) => l.includes("srt"));
      }

      return true;
    });
  }, [routeOptions, systemFilter]);

  const plannerError =
    formError || stationsError || shortestError || cheapestError || allError;

  const recommendedCards = useMemo(
    () => [
      {
        label: "Cheapest",
        value: resolvedCheapestRoute?.fare_total ?? null,
        unit: resolvedCheapestRoute ? "THB" : "",
        detail: resolvedCheapestRoute
          ? `${resolvedCheapestRoute.stats?.total_stations ?? "--"} stations`
          : "Plan to discover fares",
        highlighted: isSameRoute(activeRoute, resolvedCheapestRoute),
      },
      {
        label: "Shortest",
        value: resolvedShortestRoute?.stats?.total_stations ?? null,
        unit: resolvedShortestRoute ? "Stations" : "",
        detail: resolvedShortestRoute
          ? `${resolvedShortestRoute.fare_total ?? "--"} THB`
          : "Fewest stops on the map",
        highlighted: isSameRoute(activeRoute, resolvedShortestRoute),
      },
    ],
    [resolvedCheapestRoute, resolvedShortestRoute, activeRoute]
  );

  // Map picker (click to fill planner inputs)
  const ORIGINAL_WIDTH = 841.89;
  const ORIGINAL_HEIGHT = 841.89;
  const transformRef = useRef(null);
  const mapImgRef = useRef(null);
  const [xRatio, setXRatio] = useState(1);
  const [yRatio, setYRatio] = useState(1);

  const updateRatios = () => {
    if (!mapImgRef.current) return;
    const actualWidth = mapImgRef.current.clientWidth;
    const actualHeight = mapImgRef.current.clientHeight;
    if (actualWidth && actualHeight) {
      setXRatio(actualWidth / ORIGINAL_WIDTH);
      setYRatio(actualHeight / ORIGINAL_HEIGHT);
    }
  };

  useEffect(() => {
    const img = mapImgRef.current;
    if (img && img.complete) updateRatios();
    else if (img) img.addEventListener("load", updateRatios);
    const onResize = () => updateRatios();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (img) img.removeEventListener("load", updateRatios);
    };
  }, []);

  const handleResetView = () => {
    if (!transformRef.current) return;
    transformRef.current.setTransform(0, 0, 1);
    transformRef.current.centerView(1);
  };

  const findStationByCode = (code) => {
    if (!code) return null;
    const normalized = code.trim().toLowerCase();
    return stations.find(
      (s) => (s.station_code || "").trim().toLowerCase() === normalized
    );
  };

  const startStationObj = useMemo(
    () => findStationByCode(startStationCode),
    [startStationCode, stations]
  );
  const targetStationObj = useMemo(
    () => findStationByCode(targetStationCode),
    [targetStationCode, stations]
  );

  const routeStations = useMemo(() => {
    if (!activeRoute?.stations || !stations.length) return [];
    return activeRoute.stations
      .map((st) => findStationByCode(st.station_code))
      .filter(Boolean);
  }, [activeRoute, stations]);

  const handleMapStationClick = (station) => {
    if (!startStationCode) {
      setStartStationCode(station.station_code);
      setStartInput(station.name_en);
      setFilteredStart([]);
      return;
    }
    if (!targetStationCode) {
      setTargetStationCode(station.station_code);
      setTargetInput(station.name_en);
      setFilteredTarget([]);
      return;
    }
    setStartStationCode(station.station_code);
    setStartInput(station.name_en);
    setTargetStationCode("");
    setTargetInput("");
    setFilteredTarget([]);
  };

  return (
    <div className="text-[var(--text-primary)]">
      <div className="mx-auto max-w-7xl space-y-10 px-2">
        <header className="mx-2 mt-4 text-center space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">
            Bangkok Railway Studio
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold leading-tight drop-shadow">
            Plan your ride with ease
          </h1>
          <p className="text-base text-[var(--text-secondary)] max-w-3xl mx-auto">
            Cross-check BTS, MRT, Airport Rail Link, and more with graph-based routing. Toggle between
            shortest, cheapest, or explore every viable combination in one swoop.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[500px_1fr] h-full">
          {/* LEFT SIDE - Trip Input + Results (sticky form) */}
          <div className="space-y-6">
            <div className="frosted-surface rounded-2xl shadow-2xl p-6 lg:sticky lg:top-5 backdrop-blur">
              <div className="mb-4 space-y-1">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--accent-2)] pill-badge">
                  Input
                </span>
                <h2 className="text-2xl font-semibold mt-3">Path composer</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Search stations by code, nickname, or line. Pick your objective and the studio will chart the rest.
                </p>
              </div>

              <div className="flex flex-col items-center gap-3 justify-between">
                <div className="w-full">
                  <StationInput
                    label="From"
                    placeholder="Enter start station"
                    value={startInput}
                    onChange={handleStartChange}
                    suggestions={filteredStart}
                    onSelectSuggestion={handleSelectStart}
                    disabled={isStationsLoading}
                  />
                </div>

                <div className="w-full">
                  <StationInput
                    label="To"
                    placeholder="Enter destination"
                    value={targetInput}
                    onChange={handleTargetChange}
                    suggestions={filteredTarget}
                    onSelectSuggestion={handleSelectTarget}
                    disabled={isStationsLoading}
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handlePlanRoutes}
                  disabled={isPlanning || isStationsLoading}
                  className="flex-1 rounded-lg bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--hot)] py-2 text-sm font-semibold text-[#050914] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg accent-glow"
                >
                  {isPlanning ? "Planning route..." : "Show route"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg border border-[var(--border)] bg-white/5 px-4 py-2 text-sm text-[var(--text-secondary)] transition hover:border-[var(--accent-2)] hover:text-[var(--text-primary)]"
                >
                  Reset Stations
                </button>
              </div>

              {plannerError && (
                <p className="mt-3 text-xs text-[#ff9bb5]">{plannerError}</p>
              )}
              {!plannerError && (
                <p className="mt-7 text-xs text-[var(--text-secondary)]">
                  Tip: You can choose stations from suggestion drop-down
                </p>
              )}
            </div>
          </div>

          {/* RIGHT SIDE - Map only */}
          <div className="space-y-6">
            <div className="rounded-2xl p-5 shadow-2xl frosted-surface backdrop-blur">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-[var(--hot)] pill-badge">
                    Output
                  </span>
                  <h5 className="text-lg font-semibold mt-2">Path roster</h5>
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  {startStationObj && (
                    <span>From: {startStationObj.station_code}</span>
                  )}
                  {targetStationObj && (
                    <span className="ml-3">
                      To: {targetStationObj.station_code}
                    </span>
                  )}
                </div>
              </div>
              <div className="relative lg:aspect-square w-full lg:max-h-[83vh] bg-white rounded-xl overflow-hidden border border-[#d5deeb] shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
                <TransformWrapper
                  ref={transformRef}
                  initialScale={1}
                  minScale={1}
                  maxScale={4}
                  centerOnInit
                  limitToBounds={false}
                  wheel={{ step: 0.1, smoothStep: 0.007, limitsOnWheel: true }}
                  pinch={{ disabled: false }}
                  doubleClick={{ disabled: true }}
                >
                  <TransformComponent>
                    <div className="relative w-full h-full">
                                
                      <img
                        ref={mapImgRef}
                        src="/BangkokTransitMap.png"
                        alt="Bangkok Metro Map"
                        className="w-full h-full select-none pointer-events-none"
                        draggable={false}
                      />

                      {routeStations.map((station, i) => (
                        <div
                          key={`${station.station_code}-${i}`}
                          style={{
                            position: "absolute",
                            left: `${station.x * xRatio}px`,
                            top: `${station.y * yRatio}px`,
                            transform: "translate(-50%, -50%)",
                            zIndex: 50,
                          }}
                        >
                          <StationBadge code={station.station_code.trim()} />
                        </div>
                      ))}

                      {stations.map((station) => {
                        const isStart =
                          startStationObj?.station_code ===
                          station.station_code;
                        const isTarget =
                          targetStationObj?.station_code ===
                          station.station_code;

                        return (
                          <div
                            key={station.id}
                            onClick={() => handleMapStationClick(station)}
                            style={{
                              position: "absolute",
                              left: `${station.x * xRatio}px`,
                              top: `${station.y * yRatio}px`,
                              transform: "translate(-50%, -50%)",
                              cursor: "pointer",
                              zIndex: isStart || isTarget ? 22 : 15,
                            }}
                          >
                            <StationBadge
                              code={station.station_code.trim()}
                              lineColor={
                                isStart
                                  ? "#00c853"
                                  : isTarget
                                  ? "#00c853"
                                  : "transparent"
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </TransformComponent>
                </TransformWrapper>

                <div className="absolute top-3 right-3 flex flex-col gap-2 z-30">
                  <button
                    type="button"
                    onClick={() => transformRef.current?.zoomIn()}
                    className="px-2 py-2 rounded-lg bg-[rgba(8,12,24,0.78)] text-white hover:bg-[rgba(8,12,24,0.92)] active:scale-95 border border-[var(--border)]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => transformRef.current?.zoomOut()}
                    className="px-2 py-2 rounded-lg bg-[rgba(8,12,24,0.78)] text-white hover:bg-[rgba(8,12,24,0.92)] active:scale-95 border border-[var(--border)]"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetView}
                    className="px-2 py-2 rounded-lg bg-[rgba(8,12,24,0.78)] text-white hover:bg-[rgba(8,12,24,0.92)] active:scale-95 border border-[var(--border)]"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-3">
                Click to set start and destination; third click resets with new
                start.
              </p>
            </div>

            {showDetailsOnly ? (
              <div>
                <RouteDetailPanel
                  route={activeRoute}
                  isLoading={isPlanning}
                  onBack={() => setShowDetailsOnly(false)}
                />
              </div>
            ) : (
              <div className="grid gap-6">
                <div className="rounded-2xl frosted-surface p-5 h-full backdrop-blur shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                        Recommended routes
                      </p>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                        At-a-glance metrics
                      </h3>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-2 auto-rows-[1fr]">
                    {recommendedCards.map((card) => (
                      <div key={card.label} className="h-full">
                        <RouteStatCard
                          {...card}
                          onSelect={() => {
                            const picked =
                              card.label === "Cheapest"
                                ? resolvedCheapestRoute
                                : resolvedShortestRoute;

                            if (picked) {
                              setActiveRoute(picked);
                              setManualSelection(true);
                              setShowDetailsOnly(true);
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* All paths */}
                <div className="frosted-surface rounded-2xl shadow-2xl p-5 h-full flex flex-col backdrop-blur">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                        All routes
                      </p>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                        Compare options
                      </h3>
                    </div>

                    {routeOptions.length > 0 && (
                      <SystemFilterDropdown
                        value={systemFilter}
                        onChange={setSystemFilter}
                      />
                    )}
                  </div>

                  <div
                    className="flex-1 space-y-3 overflow-y-auto pr-1 lg:max-h-none
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-gray-900
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-gray-700"
                  >
                    {isPlanning && !routeOptions.length ? (
                      <p className="text-sm text-[var(--text-secondary)]">
                        Crunching best combinations...
                      </p>
                    ) : filteredRouteOptions.length ? (
                      filteredRouteOptions.map((route) => (
                        <RouteOptionCard
                          key={buildRouteKey(route)}
                          route={route}
                          isActive={isSameRoute(route, activeRoute)}
                          onSelect={() => {
                            setActiveRoute(route);
                            setManualSelection(true);
                            setShowDetailsOnly(true);
                          }}
                        />
                      ))
                    ) : routeOptions.length ? (
                      <p className="text-sm text-[var(--text-secondary)] py-6 text-center">
                        No routes available for this filter
                        <br />
                        <span className="text-[var(--text-secondary)] text-xs">
                          Try selecting a different system
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm text-[var(--text-secondary)]">
                        Plan a trip to see every possible path.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
