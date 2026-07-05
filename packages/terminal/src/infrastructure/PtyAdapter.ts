import { spawn } from "node:child_process";
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
  public static spawn(options: {
    shell: string;
    args: string[];
    cwd: string;
    cols?: number;
    rows?: number;
    env?: Record<string, string>;
  }): Promise<IPtyProcess> {
    try {
      return Promise.resolve(
        new ChildProcessPtyProcess(options.shell, options.cwd, options.args, options.env)
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn("Child process spawn failed.", errorMsg);
      // Wait, there is no MockPtyProcess defined in the file! Let's just rethrow or return something dummy if needed.
      // Actually, MockPtyProcess was removed in the previous edit! Let's throw the error so we don't return an undefined variable.
      throw new Error(`Child process spawn failed: ${errorMsg}`);
    }
  }
}

class ChildProcessPtyProcess implements IPtyProcess {
  public pid: number;
  private proc: ReturnType<typeof spawn>;
  private emitter = new EventEmitter();

  constructor(shell: string, cwd: string, args: string[] = [], env?: Record<string, string>) {
    // For shells, enforce interactive mode so we get prompt and output via standard pipes
    const isShell = shell.endsWith("zsh") || shell.endsWith("bash") || shell.endsWith("sh");
    const defaultArgs = args.length > 0 ? args : isShell ? ["-i"] : [];

    this.proc = spawn(shell, defaultArgs, {
      cwd,
      env: {
        ...process.env,
        ...env,
        TERM: "xterm-256color"
      },
      stdio: ["pipe", "pipe", "pipe"]
    });

    this.pid = this.proc.pid ?? Math.floor(Math.random() * 90000) + 10000;

    this.proc.stdout?.on("data", (chunk: Buffer) => {
      this.emitter.emit("data", chunk.toString("utf-8"));
    });

    this.proc.stderr?.on("data", (chunk: Buffer) => {
      this.emitter.emit("data", chunk.toString("utf-8"));
    });

    this.proc.on("exit", (code: number | null) => {
      this.emitter.emit("exit", { exitCode: code ?? 0 });
    });

    this.proc.on("error", (err: Error) => {
      this.emitter.emit("data", `\r\n\x1b[31mTerminal process error: ${err.message}\x1b[0m\r\n`);
    });
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
    if (this.proc.stdin && !this.proc.stdin.destroyed) {
      this.proc.stdin.write(data);
    }
  }

  public resize(): void {
    // No-op for standard child_process pipes
  }

  public kill(signal?: string): void {
    if (this.proc && !this.proc.killed) {
      this.proc.kill((signal || "SIGTERM") as NodeJS.Signals);
    }
  }
}
