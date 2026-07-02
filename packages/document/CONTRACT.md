# Document Platform Contract

## Overview

The Document Platform manages the lifecycle, persistence, and state of Documents. It abstracts the source of the content (FileSystem, AI, Network, Memory).

## Strict Rules

1. **Editors Do Not Own Documents**: A Document is completely decoupled from UI. It can exist without an Editor (e.g., opened by search indexing, AI, or terminal).
2. **One Document, Many Editors**: A single Document can be rendered by multiple Editors simultaneously. The Document holds the state; the Editor holds the view.
3. **Save/Dirty State**: The Document Platform manages dirty states, auto-saving, and conflict resolution.
4. **Document Types**: Documents can be text, markdown, hex, image, or custom UI settings. The platform must support arbitrary document models.
5. **No UI Dependencies**: Similar to Workspace, this package MUST NOT depend on DOM or React.
