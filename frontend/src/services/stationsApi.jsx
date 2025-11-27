import { fetchJson } from "../shared/lib/fetchJson";

// Base API URL for production + containerized builds
const API_BASE = "https://bangkok-transit.onrender.com/stations";

// ---- API Functions ----

// Fetch all stations
export async function fetchStations() {
  return await fetchJson(`${API_BASE}/`);
}
