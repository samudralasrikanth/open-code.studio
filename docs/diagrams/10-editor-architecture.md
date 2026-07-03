# Editor Architecture Diagram

```mermaid
flowchart TB
    DOC[Document Service]
    CTRL[Editor Controller]
    MONACO[Monaco Adapter]
    GROUPS[Editor Groups]
    VIEW[Editor View]

    DOC --> CTRL
    CTRL --> MONACO
    CTRL --> GROUPS
    MONACO --> VIEW
    GROUPS --> VIEW
```
