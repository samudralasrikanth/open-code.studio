import type { Workspace, RecentWorkspace } from "@ocs/workspace";
import { useState, useEffect, useCallback } from "react";

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

  const open = useCallback(async (path: string): Promise<Workspace | null> => {
    return window.ocs?.workspace.open(path) ?? null;
  }, []);

  const getRecent = useCallback(async (): Promise<readonly RecentWorkspace[]> => {
    return window.ocs?.workspace.getRecent() ?? [];
  }, []);

  const openFolderDialog = useCallback(async (): Promise<{
    canceled: boolean;
    folderPath: string | null;
  }> => {
    return (
      window.ocs?.workspace.openFolderDialog() ?? {
        canceled: true,
        folderPath: null
      }
    );
  }, []);

  const getActive = useCallback(async (): Promise<Workspace | null> => {
    return window.ocs?.workspace.getActive() ?? null;
  }, []);

  const updateSettings = useCallback(async (settings: Record<string, unknown>): Promise<void> => {
    if (!window.ocs) return;
    await window.ocs.workspace.updateSettings(settings);
    const ws = await window.ocs.workspace.getActive();
    setWorkspace(ws);
  }, []);

  return { workspace, isLoading, open, getRecent, openFolderDialog, getActive, updateSettings };
}
