/* eslint-disable */
import { useState, useEffect, useCallback } from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Hook to access the editor state.
 */
export function useEditor() {
  const [editorState, setEditorState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchState = async () => {
      try {
        const state = await window.ocs?.editor.getState();
        if (mounted && state) {
          setEditorState(state);
        }
      } catch (error) {
        console.error("[useEditor] Failed to fetch editor state", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void fetchState();

    const cleanup = window.ocs?.editor.onStateChanged((state) => {
      if (mounted) setEditorState(state);
    });

    return () => {
      mounted = false;
      cleanup?.();
    };
  }, []);

  const open = useCallback(async (id: string): Promise<void> => {
    await window.ocs?.editor.open(id);
  }, []);

  const close = useCallback(async (id: string, groupId?: string): Promise<void> => {
    await window.ocs?.editor.close(id, groupId);
  }, []);

  return { editorState, isLoading, open, close };
}
