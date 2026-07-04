import { useState, useEffect, useRef, useCallback } from "react";

export type PaginationState =
  "idle" | "loading-first" | "ready" | "loading-more" | "end-of-results" | "error";

export interface ExtensionData {
  id: string;
  name: string;
  namespace: string;
  displayName: string;
  description: string;
  version: string;
  publisher: string;
  iconUrl?: string;
  downloadCount: number;
  rating: number;
}

export function useExtensions(query: string, filters?: Record<string, unknown>) {
  const [extensions, setExtensions] = useState<ExtensionData[]>([]);
  const [state, setState] = useState<PaginationState>("idle");
  const [error, setError] = useState<{ code: string; message: string } | null>(null);

  const pageRef = useRef(1);
  const currentQueryRef = useRef(query);
  const stateRef = useRef<PaginationState>("idle");

  const updateState = useCallback((newState: PaginationState) => {
    stateRef.current = newState;
    setState(newState);
  }, []);

  const fetchExtensions = useCallback(
    async (isLoadMore = false) => {
      const q = currentQueryRef.current;

      if (isLoadMore) {
        if (stateRef.current === "loading-more" || stateRef.current === "end-of-results") return;
        updateState("loading-more");
        pageRef.current += 1;
      } else {
        updateState("loading-first");
        setExtensions([]);
        setError(null);
        pageRef.current = 1;
      }

      try {
        const result = await window.ocs.extensions.search({
          query: q,
          page: pageRef.current,
          size: 30,
          filters
        });

        // Prevent stale responses from overwriting newer queries
        if (currentQueryRef.current !== q) return;

        if (!result.success || !result.data) {
          updateState("error");
          setError(result.error || { code: "UNKNOWN", message: "Failed to fetch extensions." });
          return;
        }

        const newExtensions = result.data.results;

        setExtensions((prev) => (isLoadMore ? [...prev, ...newExtensions] : newExtensions));

        if (newExtensions.length < 30) {
          updateState("end-of-results");
        } else {
          updateState("ready");
        }
      } catch (err: unknown) {
        if (currentQueryRef.current === q) {
          updateState("error");
          const message = err instanceof Error ? err.message : "Unknown error";
          setError({ code: "UNKNOWN", message });
        }
      }
    },
    [filters, updateState]
  );

  // Debounce the query
  useEffect(() => {
    currentQueryRef.current = query;
    const timer = setTimeout(() => {
      void fetchExtensions(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, fetchExtensions]);

  return {
    extensions,
    state,
    error,
    loadMore: () => fetchExtensions(true)
  };
}
