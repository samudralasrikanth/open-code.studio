# MCP Integration

```mermaid
flowchart LR
    MODEL[AI Model]
    MCP[MCP Client]
    SERVER[MCP Server]
    TOOLS[External Tools]
    DATA[Resources]

    MODEL --> MCP
    MCP --> SERVER
    SERVER --> TOOLS
    SERVER --> DATA
```
