# `@ocs/commands`

The `commands` package provides the foundational architecture for registering, discovering, executing, and tracking user commands across the Open-Code.Studio platform.

## Architecture

This package acts as the central hub (Command Registry) that decoupling command definitions from UI triggers (like palettes, menus, or keybindings).

### Components

- **`CommandRegistry`**: Central repository of all available commands.
- **`CommandExecutor`**: Handles the execution lifecycle of a command, including error catching and event emission.
- **`CommandSearch`**: Provides fast fuzzy-search capabilities over registered commands (powered by `fuzzysort`).
- **`CommandHistory`**: Tracks recently executed commands and favorites.

## Usage

```typescript
import { CommandRegistry, CommandExecutor } from "@ocs/commands";

const registry = new CommandRegistry();
const executor = new CommandExecutor(registry, eventBus);

registry.register({
  id: "editor.open",
  title: "Editor: Open File",
  category: "Editor",
  handler: async (context) => {
    // Implementation
  }
});

// Execute the command
await executor.execute("editor.open");
```
