import { useState, useEffect, useCallback } from "react";

export type SplitNode =
  | { type: "group"; groupId: string }
  | { type: "split"; orientation: "horizontal" | "vertical"; left: SplitNode; right: SplitNode };

export interface EditorLayout {
  root: SplitNode;
}

export interface SerializedEditorGroup {
  id: string;
  inputs: string[];
  activeInput?: string;
  previewInput?: string;
  dirtyInputs?: string[];
}

export interface SerializedEditorState {
  layout: EditorLayout;
  groups: SerializedEditorGroup[];
  activeGroup?: string;
}

/**
 * Hook to access the editor state.
 */
export function useEditor() {
  const [editorState, setEditorState] = useState<SerializedEditorState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchState = async () => {
      try {
        if (window.ocs?.editor?.getState) {
          const state = (await window.ocs.editor.getState()) as SerializedEditorState | undefined;
          if (mounted && state) {
            setEditorState(state);
          }
        }
      } catch (error) {
        console.error("[useEditor] Failed to fetch editor state", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void fetchState();

    const cleanup = window.ocs?.editor?.onStateChanged
      ? window.ocs.editor.onStateChanged((state) => {
          if (mounted) setEditorState(state as SerializedEditorState);
        })
      : undefined;

    return () => {
      mounted = false;
      cleanup?.();
    };
  }, []);

  const open = useCallback(async (id: string): Promise<void> => {
    if (window.ocs?.editor?.open) {
      await window.ocs.editor.open(id);
    }
  }, []);

  const close = useCallback(async (id: string, groupId?: string): Promise<void> => {
    if (window.ocs?.editor?.close) {
      await window.ocs.editor.close(id, groupId);
    }
  }, []);

  return { editorState, isLoading, open, close };
}
