# Layered Architecture

```mermaid
flowchart TB
    UI[Presentation Layer]
    WB[Workbench Layer]
    APP[Application Layer]
    PLATFORM[Platform Layer]
    INFRA[Infrastructure Layer]
    OS[Operating System]

    UI --> WB --> APP --> PLATFORM --> INFRA --> OS
```
