// src/components/planner/helpers.js

/**
 * unwrapRoutePayload
 * Some API responses come as:
 *   { data: { ...actualRoute } }
 *
 * Others come directly as:
 *   { ...actualRoute }
 *
 * This helper normalizes both formats so the rest of the app
 * can always work with the real route object.
 */
export const unwrapRoutePayload = (payload) => {
  if (!payload) return null;
  return payload.data ?? payload;
};


/**
 * Normalizes ANY route response into a clean array.
 *
 * Possible backend shapes:
 *   - [ route, route, route ]
 *   - { routes: [ ... ] }
 *   - { path_options: [ ... ] }
 *   - { ...singleRoute }
 *
 * This ensures the UI always receives an array.
 */
export const toRouteArray = (payload) => {
  const raw = unwrapRoutePayload(payload);
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.routes)) return raw.routes;
  if (Array.isArray(raw.path_options)) return raw.path_options;
  return [raw];
};

/**
 * resolveStationCode
 * Converts user input into a station_code.
 * Supports typing:
 *   - "mo chit"
 *   - "N08"
 *   - "phahon yothin"
 *
 * If user selects from dropdown, fallbackCode is already correct
 * so we just return that.
 */
export const resolveStationCode = (input, fallbackCode, stations) => {
  if (fallbackCode) return fallbackCode;
  const normalized = input.trim().toLowerCase();
  if (!normalized) return "";
  const match = stations.find((station) => {
    const name = (station.name_en || "").trim().toLowerCase();
    const code = (station.station_code || "").trim().toLowerCase();
    return code === normalized || name === normalized;
  });
  return match?.station_code || "";
};


/**
 * buildRouteKey
 * Generates a unique and stable key for comparing routes.
 *
 * Used for:
 *   - React list keys
 *   - ensuring no duplicate routes
 *   - checking if active route matches another one
 *
 * If backend provides route_id, use it.
 * Otherwise generate a synthetic key based on route attributes.
 */
export const buildRouteKey = (route) => {
  if (!route) return "route-null";
  return (
    route.route_id ||
    `${route.path_type || "route"}-${route.fare_total ?? "?"}-${route.stats?.total_stations ?? "?"}-${route.stats?.total_transfers ?? route.stats?.total_lines ?? "?"}`
  );
};

/**
 * isSameRoute
 * Compares two route objects by their route key.
 * Helps avoid flickering or unnecessary re-renders.
 */
export const isSameRoute = (a, b) => {
  if (!a || !b) return false;
  return buildRouteKey(a) === buildRouteKey(b);
};

/**
 * formatMetric
 * Safely formats numbers for UI:
 *   30800 -> "30,800"
 *
 * Prevents calling toLocaleString() on null/undefined.
 */
export const formatMetric = (v) => {
  if (v === null || v === undefined) return null;
  return typeof v === "number" ? v.toLocaleString("en-US") : v.toString();
};
