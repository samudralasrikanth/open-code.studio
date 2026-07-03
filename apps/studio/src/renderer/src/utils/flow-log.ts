/**
 * Lightweight flow logging utility for the renderer process.
 *
 * The renderer cannot access the full Logger (which lives in Node.js).
 * This provides the same structured format with correlation IDs so that
 * flow logs across renderer → preload → main can be traced as one unit.
 *
 * Disable globally: `(window as any).__OCS_FLOW_LOGS_DISABLED__ = true`
 */

export interface FlowLogEntry {
  readonly domain: string;
  readonly source: string;
  readonly action: string;
  readonly correlationId?: string;
  readonly context?: Record<string, unknown>;
}

let _counter = 0;

/**
 * Generates a short correlation ID for the renderer process.
 * Uses a monotonic counter + timestamp fragment for uniqueness.
 */
export function correlationId(domain?: string): string {
  const short = `${Date.now().toString(36)}-${(++_counter).toString(36)}`;
  return domain ? `${domain}-${short}` : short;
}

/**
 * Structured flow log for renderer-side operations.
 */
export function flowLog(entry: FlowLogEntry): void {
  if ((window as unknown as Record<string, unknown>).__OCS_FLOW_LOGS_DISABLED__) {
    return;
  }

  const cid = entry.correlationId ?? correlationId();
  const message = `[flow:${entry.domain}] ${entry.source}: ${entry.action}`;

  console.info(message, {
    ...entry.context,
    correlationId: cid,
    domain: entry.domain,
    source: entry.source,
    action: entry.action
  });
}
