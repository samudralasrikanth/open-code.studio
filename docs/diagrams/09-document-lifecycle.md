# Document Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Closed
    Closed --> Open
    Open --> Clean
    Clean --> Dirty: Edit
    Dirty --> Saving
    Saving --> Clean
    Clean --> Closed
    Dirty --> Closed: Discard
```
