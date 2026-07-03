# Workspace Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Closed
    Closed --> Opening
    Opening --> LoadingConfig
    LoadingConfig --> Indexing
    Indexing --> Ready
    Ready --> Closing
    Closing --> Closed
```
