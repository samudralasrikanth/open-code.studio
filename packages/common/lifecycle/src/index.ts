import { PlatformError } from "../../errors/src/index.js";

export interface LifecycleService {
  readonly name: string;
  readonly dependsOn?: readonly string[];
  start(): void | Promise<void>;
  stop(): void | Promise<void>;
  health?(): HealthCheckResult | Promise<HealthCheckResult>;
}

export interface HealthCheckResult {
  readonly healthy: boolean;
  readonly message?: string;
}

export class LifecycleManager {
  private readonly services = new Map<string, LifecycleService>();
  private started: LifecycleService[] = [];

  public register(service: LifecycleService): this {
    this.services.set(service.name, service);
    return this;
  }

  public async start(): Promise<void> {
    try {
      const ordered = this.resolveOrder();
      for (const service of ordered) {
        await service.start();
        this.started.push(service);
      }
    } catch (error) {
      await this.shutdownStarted();
      throw new PlatformError({
        category: "lifecycle",
        code: "OCS-LIFECYCLE-START",
        message: "Application startup failed",
        cause: error
      });
    }
  }

  public async stop(): Promise<void> {
    await this.shutdownStarted();
  }

  public async health(): Promise<Record<string, HealthCheckResult>> {
    const checks: Record<string, HealthCheckResult> = {};
    for (const service of this.services.values()) {
      checks[service.name] = service.health ? await service.health() : { healthy: true };
    }
    return checks;
  }

  private async shutdownStarted(): Promise<void> {
    for (const service of [...this.started].reverse()) {
      await service.stop();
    }
    this.started = [];
  }

  private resolveOrder(): LifecycleService[] {
    const ordered: LifecycleService[] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const visit = (service: LifecycleService): void => {
      if (visited.has(service.name)) return;
      if (visiting.has(service.name)) {
        throw new PlatformError({
          category: "lifecycle",
          code: "OCS-LIFECYCLE-CIRCULAR",
          message: `Circular lifecycle dependency detected at ${service.name}`
        });
      }
      visiting.add(service.name);
      for (const dependency of service.dependsOn ?? []) {
        const dependencyService = this.services.get(dependency);
        if (!dependencyService) {
          throw new PlatformError({
            category: "lifecycle",
            code: "OCS-LIFECYCLE-MISSING",
            message: `${service.name} depends on unknown service ${dependency}`
          });
        }
        visit(dependencyService);
      }
      visiting.delete(service.name);
      visited.add(service.name);
      ordered.push(service);
    };

    for (const service of this.services.values()) {
      visit(service);
    }
    return ordered;
  }
}

export function createLifecycleManager(): LifecycleManager {
  return new LifecycleManager();
}
