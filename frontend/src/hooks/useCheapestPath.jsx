import { useState } from "react";
import { fetchCheapestPath } from "../services/pathsApi";

export function useCheapestPath() {
  const [pathData, setPathData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const resetPath = () => setPathData(null);

  async function getCheapestPath(fromCode, toCode) {
    setIsLoading(true);
    setError("");
    setPathData(null);

    const result = await fetchCheapestPath(fromCode, toCode);

    if (result.ok) {
      setPathData(result.data);
    } else {
      setError(result.error || "Failed to fetch route");
    }

    setIsLoading(false);
  }

  return {
    pathData,
    isLoading,
    error,
    getCheapestPath, 
    resetPath
  };
}

