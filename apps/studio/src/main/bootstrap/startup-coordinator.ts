import { Logger } from "@ocs/common";

export interface StartupPhase {
  name: string;
  dependsOn: string[];
  execute: () => Promise<void> | void;
}

export type PhaseStatus = "pending" | "running" | "done" | "failed";

export interface PhaseState {
  name: string;
  status: PhaseStatus;
  error?: Error;
}

/**
 * Coordinates the application startup sequence.
 * Ensures phases are executed in the correct dependency order.
 * If any phase fails, startup aborts.
 */
export class StartupCoordinator {
  private phases = new Map<string, StartupPhase>();
  private state = new Map<string, PhaseState>();

  constructor(private readonly logger: Logger) {}

  public register(phase: StartupPhase): void {
    this.phases.set(phase.name, phase);
    this.state.set(phase.name, { name: phase.name, status: "pending" });
  }

  public getStatus(): PhaseState[] {
    return Array.from(this.state.values());
  }

  public async run(): Promise<void> {
    const cid = Logger.correlationId("startup");
    this.logger.flow({
      domain: "startup",
      source: "coordinator",
      action: "run:start",
      correlationId: cid
    });

    const sorted = this.getSortedPhases();

    for (const phase of sorted) {
      this.logger.flow({
        domain: "startup",
        source: "coordinator",
        action: `phase:${phase.name}:start`,
        correlationId: cid
      });
      const state = this.state.get(phase.name)!;
      state.status = "running";

      try {
        await phase.execute();
        state.status = "done";
        this.logger.flow({
          domain: "startup",
          source: "coordinator",
          action: `phase:${phase.name}:done`,
          correlationId: cid
        });
      } catch (error) {
        state.status = "failed";
        state.error = error instanceof Error ? error : new Error(String(error));
        this.logger.error(`Startup phase ${phase.name} failed`, {
          error: state.error.message,
          correlationId: cid
        });
        throw state.error; // Fail fast
      }
    }

    this.logger.flow({
      domain: "startup",
      source: "coordinator",
      action: "run:done",
      correlationId: cid
    });
  }

  private getSortedPhases(): StartupPhase[] {
    const sorted: StartupPhase[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (phaseName: string) => {
      if (visited.has(phaseName)) return;
      if (visiting.has(phaseName)) {
        throw new Error(`Circular dependency detected in startup phases: ${phaseName}`);
      }

      visiting.add(phaseName);

      const phase = this.phases.get(phaseName);
      if (!phase) {
        throw new Error(`Unknown startup phase: ${phaseName}`);
      }

      for (const dep of phase.dependsOn) {
        visit(dep);
      }

      visiting.delete(phaseName);
      visited.add(phaseName);
      sorted.push(phase);
    };

    for (const phaseName of this.phases.keys()) {
      visit(phaseName);
    }

    return sorted;
  }
}
