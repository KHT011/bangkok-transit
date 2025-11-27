import { fetchJson } from "../shared/lib/fetchJson";

// Base API URL for production + containerized builds (same origin as FastAPI)
const API_BASE = "/stations";

// ---- API Functions ----

// Fetch all stations
export async function fetchStations() {
  return await fetchJson(`${API_BASE}/`);
}
