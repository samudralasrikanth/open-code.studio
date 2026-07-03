import type { Workspace } from "@ocs/workspace";
import { useState, useEffect } from "react";

/**
 * Hook to access the currently active workspace.
 */
export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    window.ocs?.workspace
      .getActive()
      .then((ws) => {
        if (mounted) {
          setWorkspace(ws);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("[useWorkspace] Failed to fetch active workspace", error);
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { workspace, isLoading };
}
