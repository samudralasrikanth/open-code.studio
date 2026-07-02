export type PlatformErrorCategory =
  | "configuration"
  | "dependency-injection"
  | "events"
  | "lifecycle"
  | "logging"
  | "telemetry"
  | "validation"
  | "unknown";

export interface PlatformErrorOptions {
  readonly category: PlatformErrorCategory;
  readonly code: string;
  readonly message: string;
  readonly cause?: unknown;
  readonly details?: Record<string, unknown>;
  readonly exposeDetails?: boolean;
  readonly recoverable?: boolean;
}

export interface SerializedPlatformError {
  readonly category: PlatformErrorCategory;
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly recoverable: boolean;
}

export class PlatformError extends Error {
  public readonly category: PlatformErrorCategory;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;
  public readonly exposeDetails: boolean;
  public readonly recoverable: boolean;

  public constructor(options: PlatformErrorOptions) {
    super(options.message, { cause: options.cause });
    this.name = "PlatformError";
    this.category = options.category;
    this.code = options.code;
    if (options.details) {
      this.details = options.details;
    }
    this.exposeDetails = options.exposeDetails ?? false;
    this.recoverable = options.recoverable ?? false;
  }

  public toJSON(): SerializedPlatformError {
    return {
      category: this.category,
      code: this.code,
      message: this.message,
      ...(this.exposeDetails && this.details ? { details: this.details } : {}),
      recoverable: this.recoverable
    };
  }
}

export function isPlatformError(error: unknown): error is PlatformError {
  return error instanceof PlatformError;
}

export function serializeError(error: unknown): SerializedPlatformError {
  if (isPlatformError(error)) {
    return error.toJSON();
  }

  return {
    category: "unknown",
    code: "OCS-UNKNOWN",
    message: error instanceof Error ? error.message : "Unknown error",
    recoverable: false
  };
}

export function recoverableError(
  options: Omit<PlatformErrorOptions, "recoverable">
): PlatformError {
  return new PlatformError({ ...options, recoverable: true });
}
