import { fetchJson } from "../shared/lib/fetchJson";

// Base URL from Vite environment
const API_BASE = import.meta.env.VITE_API_BASE_URL;


// Request shortest path between two station codes
export async function fetchShortestPath(fromCode, toCode) {
  const url = `${API_BASE}/paths/`;

  const payload = {
    start_station_code: fromCode,
    end_station_code: toCode,
    criteria: "shortest",
  };

  const result = await fetchJson(url, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return result; // returns { ok, data, error }
}


// Request all paths between two station codes
export async function fetchAllPaths(fromCode, toCode) {
  const url = `${API_BASE}/paths/`;

  const payload = {
    start_station_code: fromCode,
    end_station_code: toCode,
    criteria: "all",
  };

  const result = await fetchJson(url, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return result; 
}

// Request cheapest path between two station codes
export async function fetchCheapestPath(fromCode, toCode) {
  const url = `${API_BASE}/paths/`;

  const payload = {
    start_station_code: fromCode,
    end_station_code: toCode,
    criteria: "cheapest",
  };

  const result = await fetchJson(url, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return result; 
}

// POST /paths/fare
// Request cheapest path between two station codes
export async function fetchFarePath(fromCode, toCode) {
  const url = `${API_BASE}/paths/fare`;

  const payload = {
    from_station_code: fromCode,
    to_station_code: toCode,
  };

  const result = await fetchJson(url, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return result; 
}