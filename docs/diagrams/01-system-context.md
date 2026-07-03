# System Context Diagram

```mermaid
flowchart TD
    User[Developer]
    IDE[Open Code Studio]
    AI[AI Providers]
    FS[Local File System]
    EXT[Extensions]
    GIT[Git]
    User --> IDE
    IDE --> AI
    IDE --> FS
    IDE --> EXT
    IDE --> GIT
```
