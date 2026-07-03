import type { VisibleNode } from "@ocs/explorer";
import { useState, useEffect, useCallback } from "react";

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

  const selectNode = useCallback(async (id: string): Promise<void> => {
    await window.ocs?.explorer.selectNode(id);
  }, []);

  const collapseNode = useCallback(async (id: string): Promise<void> => {
    await window.ocs?.explorer.collapseNode(id);
  }, []);

  const expandNode = useCallback(async (providerId: string, id: string): Promise<void> => {
    await window.ocs?.explorer.expandNode(providerId, id);
  }, []);

  const executeCommand = useCallback(async (commandId: string, args?: unknown): Promise<void> => {
    await window.ocs?.explorer.executeCommand(commandId, args);
  }, []);

  const revealInFinder = useCallback(async (uri: string): Promise<void> => {
    await window.ocs?.explorer.revealInFinder(uri);
  }, []);

  return {
    nodes,
    stats,
    isLoading,
    selectNode,
    collapseNode,
    expandNode,
    executeCommand,
    revealInFinder
  };
}
