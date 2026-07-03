/* eslint-disable */
import { useState, useEffect } from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Hook to access application diagnostics state.
 */
export function useDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDiagnostics = async () => {
    try {
      const data = await window.ocs?.diagnostics.get();
      setDiagnostics(data);
    } catch (error) {
      console.error("[useDiagnostics] Failed to fetch diagnostics", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchDiagnostics();

    // Refresh diagnostics periodically
    const interval = setInterval(() => {
      void fetchDiagnostics();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return { diagnostics, isLoading, refresh: fetchDiagnostics };
}
