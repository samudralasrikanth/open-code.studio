import { useCallback } from "react";

export function useDocument() {
  const get = useCallback(async (id: string): Promise<unknown> => {
    return window.ocs?.document.get(id);
  }, []);

  return { get };
}
