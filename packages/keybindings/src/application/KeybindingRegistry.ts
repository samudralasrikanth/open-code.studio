import type { Keybinding } from "../domain/Keybinding.js";

const DEFAULT_KEYBINDINGS: Keybinding[] = [
  { key: "Meta+s", command: "document.save" },
  { key: "Control+s", command: "document.save" },
  { key: "Meta+p", command: "workbench.action.quickOpen" },
  { key: "Control+p", command: "workbench.action.quickOpen" },
  { key: "Meta+Shift+p", command: "workbench.action.showCommands" },
  { key: "Control+Shift+p", command: "workbench.action.showCommands" },
  { key: "Meta+Shift+f", command: "workbench.action.showSearch" },
  { key: "Control+Shift+f", command: "workbench.action.showSearch" },
  { key: "Meta+,", command: "workbench.action.openSettings" },
  { key: "Control+,", command: "workbench.action.openSettings" },
  { key: "Control+`", command: "workbench.action.toggleTerminal" }
];

export class KeybindingRegistry {
  private readonly defaultBindings = new Map<string, Keybinding>();
  private readonly userBindings = new Map<string, Keybinding>();

  constructor() {
    for (const binding of DEFAULT_KEYBINDINGS) {
      this.registerDefault(binding);
    }
  }

  public registerDefault(binding: Keybinding): void {
    this.defaultBindings.set(binding.key.toLowerCase(), binding);
  }

  public registerUser(binding: Keybinding): void {
    this.userBindings.set(binding.key.toLowerCase(), binding);
  }

  public resolve(keySequence: string): Keybinding | undefined {
    const key = keySequence.toLowerCase();
    // User bindings override default bindings
    return this.userBindings.get(key) || this.defaultBindings.get(key);
  }

  public getAll(): Keybinding[] {
    const all = new Map<string, Keybinding>();
    for (const [k, v] of this.defaultBindings) {
      all.set(k, v);
    }
    for (const [k, v] of this.userBindings) {
      all.set(k, v);
    }
    return Array.from(all.values());
  }

  public clearUserBindings(): void {
    this.userBindings.clear();
  }
}
