import {
  ChevronDownIcon,
  CloseIcon,
  MaximizeIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SplitHorizontalIcon,
  TerminalIcon,
  TrashIcon,
  WarningIcon
} from "@ocs/ui";
import { FitAddon } from "@xterm/addon-fit";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

import { executeRendererCommand } from "../../commands/RendererCommandRegistry.js";
import { CancellationTokenSource } from "@ocs/common";

import {
  getDisplayTerminalName,
  getNextActiveSessionId,
  type TerminalSessionItem
} from "./terminalSessionModel.js";

interface TerminalViewProps {
  cwd?: string;
  shell?: string;
}

interface CreatedTerminalSession {
  id: string;
  name?: string;
  shell?: string;
  cwd?: string;
  pid?: number;
  createdAt?: string | Date;
}

type TerminalMenu = "profiles" | "more" | null;

const TERMINAL_PROFILES = [
  { label: "zsh", shell: "/bin/zsh" },
  { label: "bash", shell: "/bin/bash" }
] as const;

function getCommandLine(session: TerminalSessionItem): string {
  const shellPath = session.shell ?? session.name ?? "shell";
  return `${shellPath} -il`;
}

function getMessage(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message;

  if (typeof value === "object" && value !== null && "message" in value) {
    const message = (value as { message?: unknown }).message;
    return typeof message === "string" ? message : undefined;
  }

  return undefined;
}

function isTransientXtermDimensionMessage(message: string | undefined): boolean {
  return Boolean(
    message && (message.includes("dimensions") || message.includes("actualCellWidth"))
  );
}

export const TerminalView: React.FC<TerminalViewProps> = ({ cwd = "/", shell }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const sessionsRef = useRef<TerminalSessionItem[]>([]);
  const cleanupFnsRef = useRef<Record<string, Array<() => void>>>({});
  const activeSessionIdRef = useRef<string | null>(null);
  const isDisposedRef = useRef(false);
  const creationTokenRef = useRef<CancellationTokenSource | null>(null);

  const [sessions, setSessions] = useState<TerminalSessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<TerminalMenu>(null);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [activeSessionId, sessions]
  );

  const replaceSessions = useCallback((next: TerminalSessionItem[]) => {
    sessionsRef.current = next;
    setSessions(next);
  }, []);

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

  const fitTerminal = useCallback(() => {
    const term = terminalRef.current;
    const fitAddon = fitAddonRef.current;

    if (!term?.element || !fitAddon) {
      return;
    }

    if (
      containerRef.current &&
      (containerRef.current.clientWidth === 0 || containerRef.current.clientHeight === 0)
    ) {
      return;
    }

    try {
      fitAddon.fit();
    } catch {
      // xterm can report transient zero dimensions while the panel is resizing.
    }
  }, []);

  const resizeSessions = useCallback(() => {
    const term = terminalRef.current;
    const terminalApi = window.ocs?.terminal;

    if (!term || !terminalApi) return;

    for (const session of sessionsRef.current) {
      if (!session.exited) {
        void terminalApi.resize(session.id, term.cols || 80, term.rows || 24);
      }
    }
  }, []);

  const setActiveSession = useCallback(
    (sessionId: string | null) => {
      activeSessionIdRef.current = sessionId;
      setActiveSessionId(sessionId);
      setOpenMenu(null);

      const term = terminalRef.current;
      if (!term) return;

      term.reset();

      if (sessionId) {
        const session = sessionsRef.current.find((item) => item.id === sessionId);
        if (session) {
          term.write(session.buffer);
        }
      }

      fitTerminal();
      resizeSessions();
      term.focus();
    },
    [fitTerminal, resizeSessions]
  );

  const disposeSessionListeners = useCallback((sessionId: string) => {
    const listeners = cleanupFnsRef.current[sessionId];
    if (listeners) {
      listeners.forEach((listener) => listener());
      delete cleanupFnsRef.current[sessionId];
    }
  }, []);

  const closeSession = useCallback(
    (sessionId: string) => {
      const current = sessionsRef.current;
      const nextActiveId =
        activeSessionIdRef.current === sessionId
          ? getNextActiveSessionId(current, sessionId)
          : activeSessionIdRef.current;
      const remaining = current.filter((item) => item.id !== sessionId);

      disposeSessionListeners(sessionId);
      replaceSessions(remaining);

      if (activeSessionIdRef.current === sessionId) {
        setActiveSession(nextActiveId);
      }

      if (window.ocs?.terminal) {
        void window.ocs.terminal.close(sessionId);
      }
    },
    [disposeSessionListeners, replaceSessions, setActiveSession]
  );

  const createSession = useCallback(
    async (options?: { shell?: string }) => {
      const term = terminalRef.current;
      const terminalApi = window.ocs?.terminal;

      if (!term || !terminalApi) {
        return;
      }

      setOpenMenu(null);

      const requestedShell = options?.shell ?? shell;
      const cts = new CancellationTokenSource();
      creationTokenRef.current = cts;

      try {
        const session = (await terminalApi.create({
          cwd,
          ...(requestedShell ? { shell: requestedShell } : {}),
          cols: term.cols || 80,
          rows: term.rows || 24,
          token: cts.token
        })) as CreatedTerminalSession;

        if (isDisposedRef.current || cts.token.isCancellationRequested) {
          void terminalApi.close(session.id);
          return;
        }

        const sessionShell = session.shell ?? requestedShell;
        const newSession: TerminalSessionItem = {
          id: session.id,
          name: getDisplayTerminalName(session.name, sessionShell),
          shell: sessionShell,
          cwd: session.cwd ?? cwd,
          pid: session.pid,
          createdAt: session.createdAt,
          buffer: "",
          exited: false
        };

        const withoutDuplicate = sessionsRef.current.filter((item) => item.id !== session.id);
        replaceSessions([...withoutDuplicate, newSession]);
        setActiveSession(session.id);

        const unsubOutput = terminalApi.onOutput((payload: { id: string; data: string }) => {
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

        const unsubExit = terminalApi.onExit((payload: { id: string; exitCode?: number }) => {
          if (payload.id !== session.id) return;

          updateSessions((prev) =>
            prev.map((item) =>
              item.id === session.id
                ? { ...item, exited: true, exitCode: payload.exitCode ?? 0 }
                : item
            )
          );

          if (activeSessionIdRef.current === session.id) {
            term.write(
              `\r\n\x1b[33m[Process exited with code ${payload.exitCode ?? 0}]\x1b[0m\r\n`
            );
          }

          disposeSessionListeners(session.id);
        });

        cleanupFnsRef.current[session.id] = [unsubOutput, unsubExit];
      } catch (err: unknown) {
        if (err instanceof Error) {
          term.write(`\r\n\x1b[31mError spawning terminal: ${err.message}\x1b[0m\r\n`);
        } else {
          term.write("\r\n\x1b[31mError spawning terminal\x1b[0m\r\n");
        }
      } finally {
        if (creationTokenRef.current === cts) {
          creationTokenRef.current = null;
        }
      }
    },
    [cwd, disposeSessionListeners, replaceSessions, setActiveSession, shell, updateSessions]
  );

  const closeActiveSession = useCallback(() => {
    if (activeSessionIdRef.current) {
      closeSession(activeSessionIdRef.current);
    }
  }, [closeSession]);

  const clearActiveSession = useCallback(() => {
    const term = terminalRef.current;
    const sessionId = activeSessionIdRef.current;

    if (!term || !sessionId) return;

    term.clear();
    updateSessions((prev) =>
      prev.map((item) => (item.id === sessionId ? { ...item, buffer: "" } : item))
    );
    setOpenMenu(null);
  }, [updateSessions]);

  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      const msg = event.message || getMessage(event.error);
      if (isTransientXtermDimensionMessage(msg)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      const msg = getMessage(event.reason);
      if (isTransientXtermDimensionMessage(msg)) {
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
      cursorStyle: "block",
      fontFamily: "var(--font-mono), 'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 13,
      lineHeight: 1.25,
      scrollback: 5000,
      theme: {
        background: "#1e1e1e",
        foreground: "#d4d4d4",
        cursor: "#d4d4d4",
        selectionBackground: "#264f78",
        black: "#000000",
        red: "#f14c4c",
        green: "#89d185",
        yellow: "#cca700",
        blue: "#3794ff",
        magenta: "#bc3fbc",
        cyan: "#2aaaff",
        white: "#d4d4d4",
        brightBlack: "#666666",
        brightRed: "#f14c4c",
        brightGreen: "#89d185",
        brightYellow: "#f5f543",
        brightBlue: "#3794ff",
        brightMagenta: "#d670d6",
        brightCyan: "#2aaaff",
        brightWhite: "#ffffff"
      }
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);

    terminalRef.current = term;
    fitAddonRef.current = fitAddon;
    isDisposedRef.current = false;

    fitTerminal();
    term.focus();

    const resizeObserver = new ResizeObserver(() => {
      fitTerminal();
      resizeSessions();
    });

    resizeObserver.observe(containerRef.current);

    const dataListener = term.onData((data: string) => {
      const activeId = activeSessionIdRef.current;
      if (activeId && window.ocs?.terminal) {
        void window.ocs.terminal.sendText(activeId, data);
      }
    });

    const resizeListener = term.onResize(() => {
      resizeSessions();
    });

    const containerElement = containerRef.current;
    const handleContainerClick = () => {
      term.focus();
    };
    containerElement.addEventListener("click", handleContainerClick);

    void createSession();

    return () => {
      isDisposedRef.current = true;
      if (creationTokenRef.current) {
        creationTokenRef.current.cancel();
      }
      resizeObserver.disconnect();
      dataListener.dispose();
      resizeListener.dispose();
      containerElement.removeEventListener("click", handleContainerClick);

      const sessionIds = sessionsRef.current.map((session) => session.id);
      for (const sessionId of sessionIds) {
        disposeSessionListeners(sessionId);
        if (window.ocs?.terminal) {
          void window.ocs.terminal.close(sessionId);
        }
      }

      cleanupFnsRef.current = {};
      sessionsRef.current = [];
      activeSessionIdRef.current = null;
      term.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
      setSessions([]);
      setActiveSessionId(null);
      setOpenMenu(null);
    };
  }, [createSession, disposeSessionListeners, fitTerminal, resizeSessions]);

  const actionsContainer = document.getElementById("workbench-panel-actions-bottom");

  const toolbarContent = (
    <div
      className="ocs-terminal__toolbar"
      style={{
        display: "flex",
        alignItems: "center",
        borderBottom: "none",
        height: "100%",
        padding: "0 8px",
        backgroundColor: "transparent",
        justifyContent: "flex-end",
        gap: "8px"
      }}
    >
      <div className="ocs-terminal__actions" aria-label="Terminal actions">
        <button
          type="button"
          className="ocs-terminal__iconButton"
          onClick={() => void createSession()}
          title="New Terminal"
        >
          <PlusIcon size={15} />
        </button>
        <button
          type="button"
          className="ocs-terminal__iconButton ocs-terminal__iconButton--narrow"
          onClick={() => setOpenMenu((value) => (value === "profiles" ? null : "profiles"))}
          title="Terminal Profiles"
        >
          <ChevronDownIcon size={12} />
        </button>
        <span className="ocs-terminal__divider" />
        <button
          type="button"
          className="ocs-terminal__iconButton"
          onClick={() => void createSession()}
          title="Split Terminal"
        >
          <SplitHorizontalIcon size={15} />
        </button>
        <button
          type="button"
          className="ocs-terminal__iconButton"
          onClick={closeActiveSession}
          title="Kill Terminal"
          disabled={!activeSession}
        >
          <TrashIcon size={15} />
        </button>
        <button
          type="button"
          className="ocs-terminal__iconButton"
          onClick={() => setOpenMenu((value) => (value === "more" ? null : "more"))}
          title="More Actions"
        >
          <MoreHorizontalIcon size={15} />
        </button>
        <span className="ocs-terminal__divider" />
        <button
          type="button"
          className="ocs-terminal__iconButton"
          onClick={() => void executeRendererCommand("workbench.action.maximizeBottomPanel")}
          title="Maximize Panel"
        >
          <MaximizeIcon size={15} />
        </button>
        <button
          type="button"
          className="ocs-terminal__iconButton"
          onClick={() => void executeRendererCommand("workbench.action.toggleBottomPanel")}
          title="Close Panel"
        >
          <CloseIcon size={15} />
        </button>
      </div>

      <div className="ocs-terminal__selectorGroup">
        <button
          type="button"
          className="ocs-terminal__shellSelector"
          onClick={() => setOpenMenu((value) => (value === "profiles" ? null : "profiles"))}
          title="Select terminal profile"
        >
          <TerminalIcon size={14} />
          <span>{activeSession?.name ?? getDisplayTerminalName(undefined, shell)}</span>
          <ChevronDownIcon size={12} />
        </button>
      </div>

      {openMenu === "profiles" && (
        <div className="ocs-terminal__menu ocs-terminal__menu--profiles" role="menu">
          <button type="button" role="menuitem" onClick={() => void createSession()}>
            New Terminal
          </button>
          <button type="button" role="menuitem" onClick={() => void createSession()}>
            Split Terminal
          </button>
          <span className="ocs-terminal__menuSeparator" />
          {TERMINAL_PROFILES.map((profile) => (
            <button
              key={profile.shell}
              type="button"
              role="menuitem"
              onClick={() => void createSession({ shell: profile.shell })}
            >
              {profile.label}
            </button>
          ))}
        </div>
      )}

      {openMenu === "more" && (
        <div className="ocs-terminal__menu ocs-terminal__menu--more" role="menu">
          <button type="button" role="menuitem" onClick={clearActiveSession}>
            Clear Terminal
          </button>
          <button type="button" role="menuitem" onClick={() => void createSession()}>
            New Terminal Window
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => void executeRendererCommand("workbench.action.showCommands")}
          >
            Show All Commands
          </button>
          <span className="ocs-terminal__menuSeparator" />
          <button type="button" role="menuitem" disabled>
            Configure Terminal Settings
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="ocs-terminal">
      {actionsContainer ? createPortal(toolbarContent, actionsContainer) : toolbarContent}

      <div className="ocs-terminal__body">
        <div className="ocs-terminal__surface">
          <div ref={containerRef} className="ocs-terminal__xterm" />
        </div>

        <aside className="ocs-terminal__rail" aria-label="Terminal session list">
          {sessions.map((session, index) => {
            const isActive = session.id === activeSessionId;
            const detailTitle = `${session.name} ${index + 1}`;

            return (
              <button
                key={session.id}
                type="button"
                className={`ocs-terminal__railButton${isActive ? " is-active" : ""}${session.exited ? " is-exited" : ""}`}
                onClick={() => setActiveSession(session.id)}
                title={detailTitle}
              >
                <TerminalIcon size={17} />
                {session.exited && <WarningIcon className="ocs-terminal__railWarning" size={10} />}
                <span className="ocs-terminal__sessionDetails" aria-hidden="true">
                  <strong>{session.name}</strong>
                  <span>Process ID (PID): {session.pid ?? "Pending"}</span>
                  <span>Command line: {getCommandLine(session)}</span>
                  <span>Shell integration: PTY</span>
                </span>
              </button>
            );
          })}
        </aside>
      </div>
    </div>
  );
};
