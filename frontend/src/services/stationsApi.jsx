import { fetchJson } from "../shared/lib/fetchJson";

// Base API URL from Vite environment
const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/stations`;

// ---- API Functions ----

// Fetch all stations
export async function fetchStations() {
  return await fetchJson(`${API_BASE}/`);
}
