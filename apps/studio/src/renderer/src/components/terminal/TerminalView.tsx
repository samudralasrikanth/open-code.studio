import { FitAddon } from "@xterm/addon-fit";
import React, { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

interface TerminalViewProps {
  cwd?: string;
  shell?: string;
}

interface OcsAPI {
  terminal: {
    create: (options: {
      shell?: string;
      cwd: string;
      cols?: number;
      rows?: number;
    }) => Promise<{ id: string }>;
    close: (id: string) => Promise<void>;
    resize: (id: string, cols: number, rows: number) => Promise<void>;
    sendText: (id: string, text: string) => Promise<void>;
    onOutput: (callback: (payload: { id: string; data: string }) => void) => () => void;
    onExit: (callback: (payload: { id: string; exitCode?: number }) => void) => () => void;
  };
}

declare global {
  interface Window {
    ocs: OcsAPI;
  }
}

export const TerminalView: React.FC<TerminalViewProps> = ({ cwd = "/", shell }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const cleanupFns = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize xterm
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
    fitAddon.fit();

    terminalRef.current = term;
    fitAddonRef.current = fitAddon;

    let isDisposed = false;

    // Start Backend Session
    const startSession = async (): Promise<void> => {
      try {
        const ocs = (window as unknown as { ocs: OcsAPI }).ocs;
        if (!ocs || !ocs.terminal) {
          term.write("\r\n\x1b[31mError: Terminal IPC bridge not found.\x1b[0m\r\n");
          return;
        }

        const session = await ocs.terminal.create({
          cwd,
          shell,
          cols: term.cols,
          rows: term.rows
        });

        if (isDisposed) {
          void ocs.terminal.close(session.id);
          return;
        }

        sessionIdRef.current = session.id;

        // Subscriptions
        const unsubOutput = ocs.terminal.onOutput((payload: { id: string; data: string }) => {
          if (payload.id === session.id) {
            term.write(payload.data);
          }
        });

        const unsubExit = ocs.terminal.onExit((payload: { id: string; exitCode?: number }) => {
          if (payload.id === session.id) {
            term.write(
              `\r\n\x1b[33m[Process exited with code ${payload.exitCode ?? 0}]\x1b[0m\r\n`
            );
          }
        });

        const dataListener = term.onData((data: string) => {
          void ocs.terminal.sendText(session.id, data);
        });

        const resizeListener = term.onResize(({ cols, rows }) => {
          void ocs.terminal.resize(session.id, cols, rows);
        });

        cleanupFns.current.push(
          unsubOutput,
          unsubExit,
          () => dataListener.dispose(),
          () => resizeListener.dispose(),
          () => {
            void ocs.terminal.close(session.id);
          }
        );
      } catch (err: unknown) {
        if (err instanceof Error) {
          term.write(`\r\n\x1b[31mError spawning terminal: ${err.message}\x1b[0m\r\n`);
        } else {
          term.write(`\r\n\x1b[31mError spawning terminal\x1b[0m\r\n`);
        }
      }
    };

    void startSession();

    // Window Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      isDisposed = true;
      resizeObserver.disconnect();
      cleanupFns.current.forEach((fn) => {
        fn();
      });
      cleanupFns.current = [];
      term.dispose();
    };
  }, [cwd, shell]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%", overflow: "hidden" }} />;
};
