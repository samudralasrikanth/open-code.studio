import { FitAddon } from "@xterm/addon-fit";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

import {
  getDisplayTerminalName,
  getNextActiveSessionId,
  type TerminalSessionItem
} from "./terminalSessionModel.js";

interface TerminalViewProps {
  cwd?: string;
  shell?: string;
}

export const TerminalView: React.FC<TerminalViewProps> = ({ cwd = "/", shell }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const sessionsRef = useRef<TerminalSessionItem[]>([]);
  const cleanupFnsRef = useRef<Record<string, Array<() => void>>>({});
  const activeSessionIdRef = useRef<string | null>(null);
  const isDisposedRef = useRef(false);
  const [sessions, setSessions] = useState<TerminalSessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const updateSessions = useCallback(
    (updater: (prev: TerminalSessionItem[]) => TerminalSessionItem[]) => {
      setSessions((prev) => {
        const next = updater(prev);
        sessionsRef.current = next;
        return next;
      });
    },
    []
  );

  const setActiveSession = useCallback((sessionId: string | null) => {
    activeSessionIdRef.current = sessionId;
    setActiveSessionId(sessionId);

    const term = terminalRef.current;
    if (!term) return;

    if (!sessionId) {
      term.reset();
      term.focus();
      return;
    }

    const session = sessionsRef.current.find((item) => item.id === sessionId);
    if (!session) return;

    term.reset();
    term.write(session.buffer);
    term.focus();
  }, []);

  const disposeSessionListeners = useCallback((sessionId: string) => {
    const listeners = cleanupFnsRef.current[sessionId];
    if (listeners) {
      listeners.forEach((listener) => listener());
      delete cleanupFnsRef.current[sessionId];
    }
  }, []);

  const closeSession = useCallback(
    (sessionId: string) => {
      disposeSessionListeners(sessionId);

      updateSessions((prev) => {
        const remaining = prev.filter((item) => item.id !== sessionId);
        if (activeSessionIdRef.current === sessionId) {
          const nextId = getNextActiveSessionId(remaining, sessionId);
          setActiveSession(nextId);
        }
        return remaining;
      });

      const ocs = (window as unknown as { ocs: any }).ocs;
      if (ocs?.terminal) {
        void ocs.terminal.close(sessionId);
      }
    },
    [disposeSessionListeners, setActiveSession, updateSessions]
  );

  const createSession = useCallback(async () => {
    const term = terminalRef.current;
    const ocs = (window as unknown as { ocs: any }).ocs;

    if (!term || !ocs?.terminal) {
      return;
    }

    try {
      const session = await ocs.terminal.create({
        cwd,
        shell,
        cols: term.cols,
        rows: term.rows
      });

      if (isDisposedRef.current) {
        void ocs.terminal.close(session.id);
        return;
      }

      const newSession: TerminalSessionItem = {
        id: session.id,
        name: getDisplayTerminalName(shell),
        buffer: "",
        exited: false
      };

      updateSessions((prev) => {
        const alreadyExists = prev.some((item) => item.id === session.id);
        if (alreadyExists) {
          return prev;
        }

        const next = [...prev, newSession];
        return next;
      });

      setActiveSession(session.id);
      cleanupFnsRef.current[session.id] = [];

      const unsubOutput = ocs.terminal.onOutput((payload: { id: string; data: string }) => {
        if (payload.id !== session.id) return;

        updateSessions((prev) =>
          prev.map((item) =>
            item.id === session.id ? { ...item, buffer: item.buffer + payload.data } : item
          )
        );

        if (activeSessionIdRef.current === session.id) {
          term.write(payload.data);
        }
      });

      const unsubExit = ocs.terminal.onExit((payload: { id: string; exitCode?: number }) => {
        if (payload.id !== session.id) return;

        updateSessions((prev) =>
          prev.map((item) => (item.id === session.id ? { ...item, exited: true } : item))
        );

        if (activeSessionIdRef.current === session.id) {
          term.write(`\r\n\x1b[33m[Process exited with code ${payload.exitCode ?? 0}]\x1b[0m\r\n`);
        }

        disposeSessionListeners(session.id);
      });

      const dataListener = term.onData((data: string) => {
        void ocs.terminal.sendText(session.id, data);
      });

      const resizeListener = term.onResize(({ cols, rows }) => {
        void ocs.terminal.resize(session.id, cols, rows);
      });

      cleanupFnsRef.current[session.id] = [
        unsubOutput,
        unsubExit,
        () => dataListener.dispose(),
        () => resizeListener.dispose(),
        () => {
          void ocs.terminal.close(session.id);
        }
      ];
    } catch (err: unknown) {
      if (err instanceof Error) {
        term.write(`\r\n\x1b[31mError spawning terminal: ${err.message}\x1b[0m\r\n`);
      } else {
        term.write(`\r\n\x1b[31mError spawning terminal\x1b[0m\r\n`);
      }
    }
  }, [cwd, shell, disposeSessionListeners, setActiveSession, updateSessions]);

  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      const msg = event.message || event.error?.message;
      if (msg && (msg.includes("dimensions") || msg.includes("actualCellWidth"))) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message;
      if (msg && (msg.includes("dimensions") || msg.includes("actualCellWidth"))) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    window.addEventListener("error", handleGlobalError, true);
    window.addEventListener("unhandledrejection", handleRejection, true);
    return () => {
      window.removeEventListener("error", handleGlobalError, true);
      window.removeEventListener("unhandledrejection", handleRejection, true);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: "'Fira Code', 'Courier New', monospace",
      fontSize: 14,
      theme: {
        background: "#1e1e1e",
        foreground: "#cccccc"
      }
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(containerRef.current);
    if (term.element && (term as any)._core?._renderService) {
      try {
        fitAddon.fit();
      } catch (e) {
        // Safe fallback
      }
    }
    term.focus();

    terminalRef.current = term;
    fitAddonRef.current = fitAddon;

    isDisposedRef.current = false;

    const resizeObserver = new ResizeObserver(() => {
      if (fitAddonRef.current && term.element && (term as any)._core?._renderService) {
        try {
          fitAddonRef.current.fit();
        } catch (e) {
          // Safe fallback
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    const containerElement = containerRef.current;
    const handleContainerClick = () => {
      term.focus();
    };
    containerElement.addEventListener("click", handleContainerClick);

    void createSession();

    return () => {
      isDisposedRef.current = true;
      resizeObserver.disconnect();
      containerElement.removeEventListener("click", handleContainerClick);

      Object.keys(cleanupFnsRef.current).forEach((sessionId) => {
        disposeSessionListeners(sessionId);
      });
      cleanupFnsRef.current = {};
      term.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
      sessionsRef.current = [];
      activeSessionIdRef.current = null;
      setSessions([]);
      setActiveSessionId(null);
    };
  }, [createSession, disposeSessionListeners]);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 8px",
          backgroundColor: "#252526",
          borderBottom: "1px solid #333",
          flexWrap: "wrap"
        }}
      >
        <button
          type="button"
          onClick={() => void createSession()}
          style={{
            background: "#007acc",
            border: "none",
            color: "white",
            borderRadius: "4px",
            padding: "4px 8px",
            cursor: "pointer",
            fontSize: "12px"
          }}
        >
          + New Terminal
        </button>
        {sessions.map((session) => (
          <button
            key={session.id}
            type="button"
            onClick={() => setActiveSession(session.id)}
            style={{
              background: activeSessionId === session.id ? "#2d2d2d" : "#1e1e1e",
              border: activeSessionId === session.id ? "1px solid #007acc" : "1px solid #3c3c3c",
              color: session.exited ? "#f0a500" : "#cccccc",
              borderRadius: "4px",
              padding: "4px 8px",
              cursor: "pointer",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span>{session.name}</span>
            <span
              onClick={(event) => {
                event.stopPropagation();
                closeSession(session.id);
              }}
              style={{ color: "#888", fontSize: "11px" }}
              aria-label={`Close ${session.name}`}
            >
              ✕
            </span>
          </button>
        ))}
      </div>
      <div
        ref={containerRef}
        style={{ flex: 1, width: "100%", height: "100%", overflow: "hidden" }}
      />
    </div>
  );
};
