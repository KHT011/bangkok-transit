import { useState, useEffect, useRef } from "react";
import { fetchStations } from "../services/stationsApi";

/**
 * Custom React hook to fetch and cache station data
 */
export function useStations() {
  const [stations, setStations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Prevent redundant API calls
  const hasFetched = useRef(false);

  useEffect(() => {
    // Prevent refetch if already fetched
    if (hasFetched.current) return;

    let isCancelled = false;

    (async () => {
      setIsLoading(true);
      setError("");

      const result = await fetchStations();

      if (isCancelled) return;

      if (result.ok) {
        console.log("Fetched stations:", result.data.length);
        setStations(result.data);
        hasFetched.current = true;
      } else {
        console.error("Failed to fetch stations:", result.error);
        setStations([]);
        setError(result.error);
      }

      setIsLoading(false);
    })();

    return () => {
      isCancelled = true;
    };
  }, []);

  return {
    stations,
    isLoading,
    error,
  };
}
