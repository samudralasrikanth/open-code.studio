/**
 * WorkspaceState — immutable state machine.
 *
 * Valid transitions:
 *
 *   closed  → opening  (open() called)
 *   opening → open     (validation + metadata load succeeded)
 *   opening → failed   (validation or metadata load failed)
 *   open    → closing  (close() called)
 *   closing → closed   (cleanup complete)
 *   failed  → closed   (acknowledged / reset)
 *
 * Any other transition is rejected with a PlatformError.
 */

import { PlatformError } from "@ocs/common/errors";

// ── States ────────────────────────────────────────────────────────────────────

export type WorkspaceStateValue = "closed" | "opening" | "open" | "closing" | "failed";

// ── Allowed transitions ───────────────────────────────────────────────────────

const ALLOWED: Record<WorkspaceStateValue, readonly WorkspaceStateValue[]> = {
  closed: ["opening"],
  opening: ["open", "failed"],
  open: ["closing"],
  closing: ["closed"],
  failed: ["closed"]
};

// ── State machine ─────────────────────────────────────────────────────────────

export class WorkspaceStateMachine {
  private _value: WorkspaceStateValue;

  public constructor(initial: WorkspaceStateValue = "closed") {
    this._value = initial;
  }

  public get value(): WorkspaceStateValue {
    return this._value;
  }

  public is(state: WorkspaceStateValue): boolean {
    return this._value === state;
  }

  /**
   * Transition to the next state. Throws if the transition is not allowed.
   */
  public transition(next: WorkspaceStateValue): void {
    const allowed = ALLOWED[this._value];
    if (!allowed.includes(next)) {
      throw new PlatformError({
        category: "workspace",
        code: "OCS-WS-STATE-001",
        message: `Invalid workspace state transition: ${this._value} → ${next}`,
        recoverable: false
      });
    }
    this._value = next;
  }

  /**
   * Attempt a transition, returning false instead of throwing on failure.
   * Use when a transition may be legitimately impossible (e.g. double-close).
   */
  public tryTransition(next: WorkspaceStateValue): boolean {
    const allowed = ALLOWED[this._value];
    if (!allowed.includes(next)) return false;
    this._value = next;
    return true;
  }
}
