export enum ExtensionErrorCode {
  Offline = "OFFLINE",
  Timeout = "TIMEOUT",
  Unauthorized = "UNAUTHORIZED",
  RateLimited = "RATE_LIMITED",
  RegistryUnavailable = "REGISTRY_UNAVAILABLE",
  Unknown = "UNKNOWN"
}

export class ExtensionError extends Error {
  constructor(
    public code: ExtensionErrorCode,
    message: string
  ) {
    super(message);
    this.name = "ExtensionError";
  }
}
