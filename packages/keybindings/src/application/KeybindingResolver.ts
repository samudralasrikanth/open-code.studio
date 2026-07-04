import type { KeybindingRegistry } from "./KeybindingRegistry.js";
import type { ContextService } from "./ContextService.js";

export class KeybindingResolver {
  private lastPressedKey: string | null = null;
  private chordTimeout: NodeJS.Timeout | null = null;

  constructor(
    private readonly registry: KeybindingRegistry,
    private readonly contextService: ContextService
  ) {}

  public handleKeyboardEvent(event: KeyboardEvent, executeCommand: (commandId: string) => void): boolean {
    const keyCombination = this.parseKeyboardEvent(event);
    if (!keyCombination) return false;

    // Check chord sequence
    let resolvedSequence = keyCombination;
    if (this.lastPressedKey) {
      resolvedSequence = `${this.lastPressedKey} ${keyCombination}`;
      this.clearChordState();
    }

    const binding = this.registry.resolve(resolvedSequence);
    if (binding) {
      // Evaluate context condition
      if (this.contextService.evaluate(binding.when)) {
        event.preventDefault();
        event.stopPropagation();
        executeCommand(binding.command);
        return true;
      }
    }

    // Check if keyCombination is the first part of any chord binding
    const allBindings = this.registry.getAll();
    const isFirstPartOfChord = allBindings.some(
      (b) => b.key.toLowerCase().startsWith(`${keyCombination.toLowerCase()} `)
    );

    if (isFirstPartOfChord) {
      event.preventDefault();
      event.stopPropagation();
      this.lastPressedKey = keyCombination;
      this.chordTimeout = setTimeout(() => {
        this.clearChordState();
      }, 2000); // 2-second timeout to complete the chord sequence
      return true;
    }

    return false;
  }

  private parseKeyboardEvent(event: KeyboardEvent): string | null {
    if (["Control", "Shift", "Alt", "Meta"].includes(event.key)) {
      return null; // Don't parse modifiers alone
    }

    const parts: string[] = [];
    if (event.ctrlKey) parts.push("Control");
    if (event.altKey) parts.push("Alt");
    if (event.shiftKey) parts.push("Shift");
    if (event.metaKey) parts.push("Meta");

    // Map keys to standard format
    let key = event.key;
    if (key === " ") key = "Space";
    parts.push(key);

    return parts.join("+");
  }

  private clearChordState(): void {
    if (this.chordTimeout) {
      clearTimeout(this.chordTimeout);
      this.chordTimeout = null;
    }
    this.lastPressedKey = null;
  }
}
