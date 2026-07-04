import type { EventBus } from "@ocs/common";

export class ContextService {
  private readonly contexts = new Map<string, boolean>();

  constructor(private readonly eventBus: EventBus) {}

  public set(key: string, value: boolean): void {
    const prev = this.contexts.get(key) ?? false;
    if (prev !== value) {
      this.contexts.set(key, value);
      this.eventBus.publish("context.changed", { key, value });
    }
  }

  public get(key: string): boolean {
    return this.contexts.get(key) ?? false;
  }

  public evaluate(expression?: string): boolean {
    if (!expression) return true;

    // Simple context key resolver. Supports negate syntax like "!editorFocus".
    const isNegated = expression.startsWith("!");
    const key = isNegated ? expression.slice(1) : expression;
    const value = this.get(key);

    return isNegated ? !value : value;
  }
}
