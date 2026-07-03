import type { VisibleNode } from "@ocs/explorer";
import { useState, useEffect } from "react";

/**
 * Hook to access the explorer tree state.
 */
export function useExplorer() {
  const [nodes, setNodes] = useState<VisibleNode[]>([]);
  const [stats, setStats] = useState<{ totalNodes: number; visibleNodes: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchNodes = async () => {
      try {
        const [visibleNodes, explorerStats] = await Promise.all([
          window.ocs?.explorer.getVisibleNodes(),
          window.ocs?.explorer.getStats()
        ]);
        if (mounted && visibleNodes && explorerStats) {
          setNodes(visibleNodes);
          setStats(explorerStats);
        }
      } catch (error) {
        console.error("[useExplorer] Failed to fetch explorer nodes", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void fetchNodes();

    const cleanup = window.ocs?.explorer.onStateChanged(() => {
      void fetchNodes();
    });

    return () => {
      mounted = false;
      cleanup?.();
    };
  }, []);

  return { nodes, stats, isLoading };
}
