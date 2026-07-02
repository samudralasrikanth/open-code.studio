/**
 * WorkspaceUri — opaque branded URI type.
 *
 * Consumers never parse URI strings directly. All construction and parsing
 * goes through this module so that future URI schemes (ssh://, container://,
 * cloud://) can be added without changing any consumer code.
 *
 * ADR-013: WorkspaceUri abstraction over raw paths.
 */

import { PlatformError } from "@ocs/common/errors";

// ── Branded type ──────────────────────────────────────────────────────────────

declare const _workspaceUriTag: unique symbol;

/** An opaque URI identifying a workspace location. Never parse this directly. */
export type WorkspaceUri = string & { readonly [_workspaceUriTag]: true };

// ── Supported schemes ─────────────────────────────────────────────────────────

export type WorkspaceScheme =
  | "file" // Local file system — implemented in EPIC-0004
  | "ssh" // Remote SSH — reserved
  | "container" // Dev container — reserved
  | "cloud" // Cloud workspace — reserved
  | "git"; // Bare git repository — reserved

// ── Construction ──────────────────────────────────────────────────────────────

/**
 * Create a `file://` workspace URI from an absolute file system path.
 */
export function uriFromPath(absolutePath: string): WorkspaceUri {
  if (!absolutePath.startsWith("/") && !/^[A-Za-z]:[/\\]/.test(absolutePath)) {
    throw new PlatformError({
      category: "workspace",
      code: "OCS-WS-URI-001",
      message: `WorkspaceUri requires an absolute path, got: ${absolutePath}`
    });
  }
  const normalised = absolutePath.replace(/\\/g, "/");
  return `file://${normalised}` as WorkspaceUri;
}

/**
 * Parse a URI string into a `WorkspaceUri`, validating the scheme.
 */
export function uriFromString(raw: string): WorkspaceUri {
  const knownSchemes: WorkspaceScheme[] = ["file", "ssh", "container", "cloud", "git"];
  const hasKnownScheme = knownSchemes.some((s) => raw.startsWith(`${s}://`));
  if (!hasKnownScheme) {
    throw new PlatformError({
      category: "workspace",
      code: "OCS-WS-URI-002",
      message: `Unsupported WorkspaceUri scheme: ${raw}`
    });
  }
  return raw as WorkspaceUri;
}

// ── Inspection ────────────────────────────────────────────────────────────────

/** Extract the scheme from a WorkspaceUri. */
export function uriScheme(uri: WorkspaceUri): WorkspaceScheme {
  const sep = uri.indexOf("://");
  return uri.slice(0, sep) as WorkspaceScheme;
}

/** Convert a `file://` WorkspaceUri back to a file system path. */
export function uriToPath(uri: WorkspaceUri): string {
  if (!uri.startsWith("file://")) {
    throw new PlatformError({
      category: "workspace",
      code: "OCS-WS-URI-003",
      message: `Cannot convert non-file URI to path: ${uri}`
    });
  }
  return uri.slice("file://".length);
}

/** Return the last path segment as a human-readable display name. */
export function uriDisplayName(uri: WorkspaceUri): string {
  const path = uri.startsWith("file://") ? uriToPath(uri) : uri;
  const parts = path.replace(/\\/g, "/").split("/").filter(Boolean);
  return parts[parts.length - 1] ?? uri;
}

/** Return true if the two URIs refer to the same location. */
export function uriEquals(a: WorkspaceUri, b: WorkspaceUri): boolean {
  return a === b;
}
