/* eslint-disable */
import { EventEmitter } from "node:events";

export interface IPtyProcess {
  pid: number;
  onData(callback: (data: string) => void): { dispose(): void };
  onExit(callback: (event: { exitCode: number; signal?: number }) => void): { dispose(): void };
  write(data: string): void;
  resize(cols: number, rows: number): void;
  kill(signal?: string): void;
}

export class PtyAdapter {
  private static ptyModule: any = null;
  private static isLoaded = false;

  private static async ensurePtyLoaded(): Promise<boolean> {
    if (this.isLoaded) return this.ptyModule !== null;
    this.isLoaded = true;
    try {
      // Dynamic import to prevent bundler failures in non-Node environments
      // @ts-ignore
      const pty = await import("node-pty");
      this.ptyModule = pty.default || pty;
      return true;
    } catch (e: any) {
      console.warn("Failed to load native node-pty module. Falling back to Mock Shell.", e.message);
      return false;
    }
  }

  public static async spawn(options: {
    shell: string;
    args: string[];
    cwd: string;
    cols?: number;
    rows?: number;
    env?: Record<string, string>;
  }): Promise<IPtyProcess> {
    const loaded = await this.ensurePtyLoaded();
    if (loaded && this.ptyModule) {
      try {
        const ptyProcess = this.ptyModule.spawn(options.shell, options.args, {
          name: "xterm-color",
          cols: options.cols || 80,
          rows: options.rows || 24,
          cwd: options.cwd,
          env: {
            ...process.env,
            ...options.env
          }
        });
        return {
          pid: ptyProcess.pid,
          onData: (cb) => ptyProcess.onData(cb),
          onExit: (cb) => ptyProcess.onExit(cb),
          write: (data) => ptyProcess.write(data),
          resize: (cols, rows) => ptyProcess.resize(cols, rows),
          kill: (sig) => ptyProcess.kill(sig)
        };
      } catch (err: any) {
        console.warn("node-pty spawn failed. Falling back to Mock Shell.", err.message);
      }
    }

    // Fallback to Mock PTY process
    return new MockPtyProcess(options.shell, options.cwd);
  }
}

class MockPtyProcess implements IPtyProcess {
  public pid = Math.floor(Math.random() * 90000) + 10000;
  private emitter = new EventEmitter();
  private inputBuffer = "";
  private isKilled = false;

  constructor(
    private shell: string,
    private cwd: string
  ) {
    // Emit initial mock welcome banner
    setTimeout(() => {
      if (this.isKilled) return;
      this.emitData("\r\n\x1b[1;36m*** Open-Code.Studio Terminal Mock Shell ***\x1b[0m\r\n");
      this.emitData(`[Shell: ${this.shell} | PID: ${this.pid}]\r\n`);
      this.emitData(`[Working Directory: ${this.cwd}]\r\n\r\n`);
      this.emitPrompt();
    }, 50);
  }

  private emitData(data: string): void {
    this.emitter.emit("data", data);
  }

  private emitPrompt(): void {
    const baseDir = this.cwd.split("/").pop() || "";
    this.emitData(`\x1b[1;32mocs-mock-shell:${baseDir} $\x1b[0m `);
  }

  public onData(callback: (data: string) => void): { dispose(): void } {
    this.emitter.on("data", callback);
    return {
      dispose: () => {
        this.emitter.off("data", callback);
      }
    };
  }

  public onExit(callback: (event: { exitCode: number; signal?: number }) => void): {
    dispose(): void;
  } {
    this.emitter.on("exit", callback);
    return {
      dispose: () => {
        this.emitter.off("exit", callback);
      }
    };
  }

  public write(data: string): void {
    if (this.isKilled) return;

    // Handle standard keys
    if (data === "\r") {
      // Enter key
      this.emitData("\r\n");
      this.handleCommand(this.inputBuffer);
      this.inputBuffer = "";
    } else if (data === "\u007f") {
      // Backspace
      if (this.inputBuffer.length > 0) {
        this.inputBuffer = this.inputBuffer.slice(0, -1);
        this.emitData("\b \b");
      }
    } else if (data === "\u0003") {
      // Ctrl+C
      this.emitData("^C\r\n");
      this.inputBuffer = "";
      this.emitPrompt();
    } else {
      this.inputBuffer += data;
      this.emitData(data);
    }
  }

  private handleCommand(cmd: string): void {
    const trimmed = cmd.trim();
    if (!trimmed) {
      this.emitPrompt();
      return;
    }

    if (trimmed === "exit") {
      this.emitData("Exiting mock shell...\r\n");
      this.kill();
      return;
    }

    if (trimmed === "help") {
      this.emitData("Available mock commands:\r\n");
      this.emitData("  help     - Show this menu\r\n");
      this.emitData("  clear    - Clear the terminal screen\r\n");
      this.emitData("  cwd      - Print working directory\r\n");
      this.emitData("  exit     - Close this session\r\n");
      this.emitPrompt();
      return;
    }

    if (trimmed === "clear") {
      this.emitData("\x1b[2J\x1b[H");
      this.emitPrompt();
      return;
    }

    if (trimmed === "cwd") {
      this.emitData(`${this.cwd}\r\n`);
      this.emitPrompt();
      return;
    }

    // Default echo
    this.emitData(
      `Mock Command execution: "${trimmed}" is not a real system command. (Try: help)\r\n`
    );
    this.emitPrompt();
  }

  public resize(_cols: number, _rows: number): void {
    // Mock resize logic
  }

  public kill(_signal?: string): void {
    if (this.isKilled) return;
    this.isKilled = true;
    setTimeout(() => {
      this.emitter.emit("exit", { exitCode: 0 });
    }, 10);
  }
}
