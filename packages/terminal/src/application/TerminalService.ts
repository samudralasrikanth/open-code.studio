/* eslint-disable */
import { randomUUID } from "node:crypto";
import { PlatformError } from "@ocs/common/errors";
import type { EventBus } from "@ocs/common/events";
import type { Logger } from "@ocs/common/logger";

import { TerminalState } from "../domain/TerminalState.js";
import type { TerminalSession } from "../domain/TerminalSession.js";
import { TerminalEventTypes } from "../events/TerminalEvents.js";
import { PtyAdapter, type IPtyProcess } from "../infrastructure/PtyAdapter.js";

export interface CreateTerminalOptions {
  shell?: string;
  args?: string[];
  cwd: string;
  cols?: number;
  rows?: number;
  env?: Record<string, string>;
}

export class TerminalService {
  private readonly sessions = new Map<string, TerminalSession>();
  private readonly ptyProcesses = new Map<string, IPtyProcess>();
  private readonly activeListeners = new Map<string, { dispose: () => void }[]>();

  public constructor(
    private readonly logger: Logger,
    private readonly events?: EventBus
  ) {}

  public getSessions(): readonly TerminalSession[] {
    return Array.from(this.sessions.values());
  }

  public getSession(id: string): TerminalSession | null {
    return this.sessions.get(id) || null;
  }

  public async create(options: CreateTerminalOptions): Promise<TerminalSession> {
    const id = randomUUID();

    // Resolve shell path
    let shellPath = options.shell;
    if (!shellPath) {
      shellPath = process.env.SHELL || (process.platform === "win32" ? "cmd.exe" : "/bin/sh");
    }

    const args = options.args || [];
    const cwd = options.cwd;
    const name = options.shell ? options.shell.split("/").pop() || "Terminal" : "terminal";

    this.logger.info("Spawning terminal session", { id, shell: shellPath, cwd });

    const session: TerminalSession = {
      id,
      name,
      shell: shellPath,
      cwd,
      status: TerminalState.CONNECTING,
      createdAt: new Date()
    };

    this.sessions.set(id, session);
    this.events?.publish(TerminalEventTypes.CREATED, { id, name, shell: shellPath, cwd });

    try {
      const ptyProcess = await PtyAdapter.spawn({
        shell: shellPath,
        args,
        cwd,
        cols: options.cols || 80,
        rows: options.rows || 24,
        ...(options.env ? { env: options.env } : {})
      });

      session.pid = ptyProcess.pid;
      session.status = TerminalState.ACTIVE;
      this.ptyProcesses.set(id, ptyProcess);

      this.logger.info("Terminal session spawned", { id, pid: ptyProcess.pid });
      this.events?.publish(TerminalEventTypes.STARTED, { id, pid: ptyProcess.pid });

      // Set up output listeners
      const dataSub = ptyProcess.onData((data) => {
        this.events?.publish(TerminalEventTypes.OUTPUT, { id, data });
      });

      const exitSub = ptyProcess.onExit((event) => {
        this.handleSessionExit(id, event.exitCode);
      });

      this.activeListeners.set(id, [dataSub, exitSub]);
      return session;
    } catch (err: any) {
      session.status = TerminalState.EXITED;
      this.logger.error("Failed to spawn terminal session", { id, error: err.message });
      this.events?.publish(TerminalEventTypes.STOPPED, { id });
      throw new PlatformError({
        category: "workspace",
        code: "OCS-TERMINAL-SPAWN",
        message: `Failed to spawn terminal process: ${err.message}`
      });
    }
  }

  public sendInput(id: string, data: string): void {
    const pty = this.ptyProcesses.get(id);
    if (!pty) {
      throw new PlatformError({
        category: "workspace",
        code: "OCS-TERMINAL-NOT-FOUND",
        message: `Terminal session ${id} not found or inactive`
      });
    }
    pty.write(data);
    this.events?.publish(TerminalEventTypes.INPUT, { id, data });
  }

  public resize(id: string, cols: number, rows: number): void {
    const pty = this.ptyProcesses.get(id);
    if (!pty) {
      throw new PlatformError({
        category: "workspace",
        code: "OCS-TERMINAL-NOT-FOUND",
        message: `Terminal session ${id} not found or inactive`
      });
    }
    pty.resize(cols, rows);
    this.events?.publish(TerminalEventTypes.LAYOUT_CHANGED, { id, cols, rows });
  }

  public close(id: string): void {
    const session = this.sessions.get(id);
    if (!session) return;

    this.logger.info("Closing terminal session", { id });

    // Clean listeners
    const subs = this.activeListeners.get(id) || [];
    for (const sub of subs) {
      sub.dispose();
    }
    this.activeListeners.delete(id);

    // Terminate process
    const pty = this.ptyProcesses.get(id);
    if (pty) {
      try {
        pty.kill();
      } catch (err) {
        // Ignored
      }
      this.ptyProcesses.delete(id);
    }

    session.status = TerminalState.EXITED;
    this.sessions.delete(id);
    this.events?.publish(TerminalEventTypes.CLOSED, { id });
  }

  public dispose(): void {
    this.logger.info("Disposing TerminalService: closing all sessions");
    const ids = Array.from(this.sessions.keys());
    for (const id of ids) {
      this.close(id);
    }
  }

  private handleSessionExit(id: string, exitCode: number): void {
    const session = this.sessions.get(id);
    if (!session) return;

    this.logger.info("Terminal session exited", { id, exitCode });

    const subs = this.activeListeners.get(id) || [];
    for (const sub of subs) {
      sub.dispose();
    }
    this.activeListeners.delete(id);
    this.ptyProcesses.delete(id);

    session.status = TerminalState.EXITED;
    this.events?.publish(TerminalEventTypes.STOPPED, { id, exitCode });
  }
}
