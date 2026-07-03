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

const ALLOWED: Record<WorkspaceStateValue, readonly WorkspaceStateValue[]> = {
  closed: ["opening"],
  opening: ["open", "failed"],
  open: ["closing"],
  closing: ["closed"],
  // "failed" must also allow a direct retry ("opening") — WorkspaceService.open()
  // permits calling open() again from the "failed" state (see the guard at the
  // top of that method), so the state machine must permit the same transition
  // or every retry after a single failed open throws "Invalid workspace state
  // transition: failed → opening" and Open Folder becomes permanently broken
  // for the rest of the session.
  failed: ["closed", "opening"]
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
