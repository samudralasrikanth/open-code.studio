import { appendFileSync, existsSync, renameSync, statSync } from "node:fs";

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

export interface LoggerOptions {
  readonly level?: LogLevel;
  readonly sinks?: readonly LogSink[];
  readonly secretKeys?: readonly string[];
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

  public constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? "info";
    this.sinks = options.sinks ?? [new ConsoleSink()];
    this.secretKeys = options.secretKeys ?? ["secret", "password", "token", "key"];
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
    const output = JSON.stringify(record);
    if (record.level === "error") {
      console.error(output);
      return;
    }
    console.log(output);
  }
}

export class FileSink implements LogSink {
  public constructor(
    private readonly filePath: string,
    private readonly maxBytes = 5_000_000
  ) {}

  public write(record: LogRecord): void {
    this.rotateIfNeeded();
    appendFileSync(this.filePath, `${JSON.stringify(record)}\n`, "utf8");
  }

  private rotateIfNeeded(): void {
    if (existsSync(this.filePath) && statSync(this.filePath).size >= this.maxBytes) {
      renameSync(this.filePath, `${this.filePath}.${Date.now()}`);
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
