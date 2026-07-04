import { useEffect, useRef } from "react";
import { executeRendererCommand } from "../commands/RendererCommandRegistry.js";

export function useKeybindings(): void {
  const bindingsRef = useRef<any[]>([]);
  const lastKeyRef = useRef<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load keybindings on mount
  useEffect(() => {
    let active = true;
    const fetchBindings = async () => {
      if (window.ocs?.keybindings?.get) {
        const list = await window.ocs.keybindings.get();
        if (active) {
          bindingsRef.current = list;
        }
      }
    };
    void fetchBindings();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const parseEvent = (e: KeyboardEvent): string | null => {
      if (["Control", "Shift", "Alt", "Meta"].includes(e.key)) {
        return null;
      }
      const parts: string[] = [];
      if (e.ctrlKey) parts.push("Control");
      if (e.altKey) parts.push("Alt");
      if (e.shiftKey) parts.push("Shift");
      if (e.metaKey) parts.push("Meta");

      let key = e.key;
      if (key === " ") key = "Space";
      parts.push(key);
      return parts.join("+");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const parsed = parseEvent(e);
      if (!parsed) return;

      let seq = parsed;
      if (lastKeyRef.current) {
        seq = `${lastKeyRef.current} ${parsed}`;
        lastKeyRef.current = null;
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }

      // Check if matches any registered command keybinding
      const matched = bindingsRef.current.find(
        (b) => b.key.toLowerCase() === seq.toLowerCase()
      );

      if (matched) {
        e.preventDefault();
        e.stopPropagation();
        void (async () => {
          const handled = await executeRendererCommand(matched.command);
          if (!handled && window.ocs?.commands?.execute) {
            await window.ocs.commands.execute(matched.command);
          }
        })();
        return;
      }

      // Check if first part of a chord
      const isChordStart = bindingsRef.current.some(
        (b) => b.key.toLowerCase().startsWith(`${parsed.toLowerCase()} `)
      );

      if (isChordStart) {
        e.preventDefault();
        e.stopPropagation();
        lastKeyRef.current = parsed;
        timerRef.current = setTimeout(() => {
          lastKeyRef.current = null;
          timerRef.current = null;
        }, 2000);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);
}
