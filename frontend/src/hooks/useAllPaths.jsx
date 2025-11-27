import { useState } from "react";
import { fetchAllPaths } from "../services/pathsApi";

export function useAllPaths() {
  const [pathData, setPathData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const resetPath = () => setPathData(null);

  async function getAllPaths(fromCode, toCode) {
    setIsLoading(true);
    setError("");
    setPathData(null);

    const result = await fetchAllPaths(fromCode, toCode);

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
    getAllPaths, 
    resetPath
  };
}

