# Editor Platform Contract

## Overview

The Editor Platform handles rendering and managing Editor instances (text editors, diff editors, custom view editors). It binds UI renderers (e.g., Monaco) to the underlying Document Platform.

## Strict Rules

1. **Editor Adapters**: The core Editor Platform must not be tightly coupled to Monaco. It must expose an `IEditorAdapter` interface that the Monaco integration implements.
2. **Editor Input**: All Editors are driven by an `EditorInput`. An EditorInput encapsulates a reference to a Document or resource, enabling arbitrary editors (Image Viewer, PDF, Custom Settings UI).
3. **View State**: The Editor Platform owns view states (cursor position, scroll position, selections) which can be detached from the Document state.
4. **No Direct Document Mutation**: The Editor Platform does not directly save files. It issues commands to the Document Platform which handles the IO operations.
