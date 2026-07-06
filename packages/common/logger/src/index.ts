function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
import * as fs from "node:fs";

export type LogLevel = "debug" | "info" | "warn" | "error";
export type LogContext = Record<string, unknown>;

export interface LogRecord {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly context: LogContext;
}

export interface LogSink {
  write(record: LogRecord): void;
}

/**
 * Structured flow log entry for tracing cross-boundary operations.
 * Every flow log carries a correlation ID that follows the operation
 * across renderer → preload → IPC → main → service boundaries.
 */
export interface FlowLogEntry {
  readonly domain: string;
  readonly source: string;
  readonly action: string;
  readonly correlationId?: string;
  readonly context?: LogContext;
}

export interface LoggerOptions {
  readonly level?: LogLevel;
  readonly sinks?: readonly LogSink[];
  readonly secretKeys?: readonly string[];
  /** Domains for which flow logging is enabled. If omitted, all domains are enabled. */
  readonly flowEnabled?: ReadonlySet<string>;
}

const priority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

export class Logger {
  private readonly level: LogLevel;
  private readonly sinks: readonly LogSink[];
  private readonly secretKeys: readonly string[];
  private readonly flowEnabled: ReadonlySet<string> | null;

  public constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? "info";
    this.sinks = options.sinks ?? [new ConsoleSink()];
    this.secretKeys = options.secretKeys ?? ["secret", "password", "token", "key"];
    this.flowEnabled = options.flowEnabled ?? null; // null = all domains enabled
  }

  public debug(message: string, context: LogContext = {}): void {
    this.write("debug", message, context);
  }

  public info(message: string, context: LogContext = {}): void {
    this.write("info", message, context);
  }

  public warn(message: string, context: LogContext = {}): void {
    this.write("warn", message, context);
  }

  public error(message: string, context: LogContext = {}): void {
    this.write("error", message, context);
  }

  /**
   * Structured flow log for tracing operations across process boundaries.
   * Flow logs carry a correlation ID so that an entire operation
   * (renderer → preload → IPC → main → service) can be traced as one unit.
   */
  public flow(entry: FlowLogEntry): void {
    if (this.flowEnabled && !this.flowEnabled.has(entry.domain)) {
      return;
    }

    const correlationId = entry.correlationId ?? Logger.correlationId();
    const message = `[flow:${entry.domain}] ${entry.source}: ${entry.action}`;
    const context: LogContext = {
      ...entry.context,
      correlationId,
      domain: entry.domain,
      source: entry.source,
      action: entry.action
    };

    this.write("info", message, context);
  }

  /**
   * Generates a short correlation ID for tracing a flow across boundaries.
   * Format: `{domain}-{short-uuid}` when called with a domain, or a raw short ID.
   */
  public static correlationId(domain?: string): string {
    const short = generateUUID().slice(0, 8);
    return domain ? `${domain}-${short}` : short;
  }

  private write(level: LogLevel, message: string, context: LogContext): void {
    if (priority[level] < priority[this.level]) {
      return;
    }

    const record: LogRecord = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: maskSecrets(context, this.secretKeys)
    };

    for (const sink of this.sinks) {
      sink.write(record);
    }
  }
}

export class ConsoleSink implements LogSink {
  public write(record: LogRecord): void {
    try {
      const output = JSON.stringify(record);
      if (record.level === "error") {
        console.error(output);
        return;
      }
      console.log(output);
    } catch {
      // Ignore EPIPE and stdout/stderr stream closure errors
    }
  }
}

export class FileSink implements LogSink {
  public constructor(
    private readonly filePath: string,
    private readonly maxBytes = 5_000_000
  ) {}

  public write(record: LogRecord): void {
    this.rotateIfNeeded();
    fs.appendFileSync(this.filePath, `${JSON.stringify(record)}\n`, "utf8");
  }

  private rotateIfNeeded(): void {
    if (fs.existsSync(this.filePath) && fs.statSync(this.filePath).size >= this.maxBytes) {
      fs.renameSync(this.filePath, `${this.filePath}.${Date.now()}`);
    }
  }
}

export function createLogger(options?: LoggerOptions): Logger {
  return new Logger(options);
}

export function maskSecrets(value: unknown, secretKeys: readonly string[] = []): LogContext {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => {
      const shouldMask = secretKeys.some((secretKey) =>
        key.toLowerCase().includes(secretKey.toLowerCase())
      );
      if (shouldMask) {
        return [key, "********"];
      }
      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        return [key, maskSecrets(entry, secretKeys)];
      }
      return [key, entry];
    })
  );
}
