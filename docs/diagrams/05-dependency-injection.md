# Dependency Injection Flow

```mermaid
flowchart TD
    A[Application Bootstrap]
    B[Register Interfaces]
    C[Register Implementations]
    D[Build Container]
    E[Resolve Dependencies]
    F[Application Services]

    A-->B-->C-->D-->E-->F
```
