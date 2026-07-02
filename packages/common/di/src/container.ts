import { PlatformError } from "../../errors/src/index.js";

export type ServiceToken<T> = symbol & { readonly __service?: T };
export type ServiceLifecycle = "singleton" | "transient";
export type ServiceFactory<T> = (resolver: ServiceResolver) => T;

export interface ServiceResolver {
  resolve<T>(token: ServiceToken<T>): T;
  lazy<T>(token: ServiceToken<T>): () => T;
}

export interface ServiceRegistration<T> {
  readonly token: ServiceToken<T>;
  readonly lifecycle: ServiceLifecycle;
  readonly factory: ServiceFactory<T>;
}

interface StoredRegistration<T> extends ServiceRegistration<T> {
  instance?: T;
}

export function createServiceToken<T>(description: string): ServiceToken<T> {
  return Symbol(description);
}

export class Container implements ServiceResolver {
  private readonly registrations = new Map<ServiceToken<unknown>, StoredRegistration<unknown>>();
  private readonly resolutionStack: ServiceToken<unknown>[] = [];

  public register<T>(registration: ServiceRegistration<T>): this {
    if (this.registrations.has(registration.token)) {
      throw new PlatformError({
        category: "dependency-injection",
        code: "OCS-DI-DUPLICATE",
        message: `Service is already registered: ${String(registration.token.description)}`
      });
    }

    this.registrations.set(registration.token, registration);
    return this;
  }

  public singleton<T>(token: ServiceToken<T>, factory: ServiceFactory<T>): this {
    return this.register({ token, lifecycle: "singleton", factory });
  }

  public transient<T>(token: ServiceToken<T>, factory: ServiceFactory<T>): this {
    return this.register({ token, lifecycle: "transient", factory });
  }

  public resolve<T>(token: ServiceToken<T>): T {
    const registration = this.registrations.get(token) as StoredRegistration<T> | undefined;
    if (!registration) {
      throw new PlatformError({
        category: "dependency-injection",
        code: "OCS-DI-NOT-FOUND",
        message: `Service is not registered: ${String(token.description)}`
      });
    }

    if (this.resolutionStack.includes(token)) {
      const cycle = [...this.resolutionStack, token].map((item) => item.description).join(" -> ");
      throw new PlatformError({
        category: "dependency-injection",
        code: "OCS-DI-CIRCULAR",
        message: `Circular dependency detected: ${cycle}`
      });
    }

    if (registration.lifecycle === "singleton" && registration.instance !== undefined) {
      return registration.instance;
    }

    this.resolutionStack.push(token);
    try {
      const instance = registration.factory(this);
      if (registration.lifecycle === "singleton") {
        registration.instance = instance;
      }
      return instance;
    } finally {
      this.resolutionStack.pop();
    }
  }

  public lazy<T>(token: ServiceToken<T>): () => T {
    return () => this.resolve(token);
  }
}

export function createContainer(): Container {
  return new Container();
}
