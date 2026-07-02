# Explorer Platform Contract

## Overview

The Explorer Platform provides a virtualized, robust view of a File System tree. It handles file operations, file watching, decorations, context menus, and expansion states.

## Strict Rules

1. **Tree vs Flattening**: The renderer MUST only consume `VisibleNode[]`. The TreeModel is responsible for flattening the hierarchical tree into a flat array for the virtualized list.
2. **Virtualization Required**: UI implementations must use a virtualization library (like `@tanstack/react-virtual`) to render the tree, as workspaces can have tens of thousands of files.
3. **No Direct Node FS**: Use `VirtualFileSystem` instead of `fs` or `fs/promises`.
4. **Events Batching**: Watcher events MUST be debounced/batched via `ExplorerScheduler` to avoid choking the main thread or renderer.
5. **No Editor Dependencies**: The Explorer must not know what an Editor is. It only dispatches "open document" commands to the system when a file is selected.
