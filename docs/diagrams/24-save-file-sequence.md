# Save File Sequence

```mermaid
sequenceDiagram
participant E as Editor
participant D as Document
participant FS as FileSystem

E->>D: Save
D->>FS: Write File
FS-->>D: Success
D-->>E: Dirty=false
```
