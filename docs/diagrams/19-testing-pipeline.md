# Testing Pipeline

```mermaid
flowchart LR
A[Commit]-->B[Lint]
B-->C[Type Check]
C-->D[Unit Tests]
D-->E[Integration Tests]
E-->F[Build]
F-->G[E2E Tests]
G-->H[Release]
```
