/* eslint-disable */
import { useState, useEffect } from "react";
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

  return { editorState, isLoading };
}
