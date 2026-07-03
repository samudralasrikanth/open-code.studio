# package: @ocs/runtime (Planned Splits)

This package contains the native subprocess spawning execution logic, terminal session wrappers, GPU discovery diagnostics, and background tokenizer pipelines.

---

## 1. Split Module Architecture

To keep compilation times low and isolate native binaries, the runtime platform is split into five distinct sub-packages:

```
@ocs/
├── runtime-core/                # Abstract process & utility hooks
├── runtime-pty/                 # node-pty subprocess execution wrapper
├── runtime-process/             # Compiler and run process controls
├── runtime-models/              # Local LLM registry and registry config
└── runtime-tokenizer/           # Tiktoken WASM count workers (thread isolated)
```

---

## 2. Public API

- `PtyService` (inside `runtime-pty`)
  - `createSession(shell: string, Cwd: string): Promise<string>`
  - `write(sessionId: string, data: string): void`
  - `resize(sessionId: string, cols: number, rows: number): void`
- `TokenEngine` (inside `runtime-tokenizer`)
  - `countTokensAsync(text: string, model: string): Promise<number>`
- `GpuDiagnostic` (inside `runtime-models`)
  - `detectGpuCapabilities(): Promise<GpuCapabilities>`

---

## 3. Internal API

- `PtySubprocess`: Handles JSON-RPC communication over IPC with the Main process terminal managers.
- `TokenizationWorker`: Web Worker execution pool loading tiktoken dictionary structures asynchronously.

---

## 4. Dependencies

- `@ocs/common` (Leaf utilities)
- `@ocs/event-bus` (Event Coordination)

---

## 5. Import Rules

- **Allowed Imports:** Only leaf packages (`common`, `event-bus`, `telemetry`).
- **Forbidden Imports:** Must never import from gateways (`@ocs/gateway`), AST engines (`@ocs/knowledge`), or UI platforms (`@ocs/ui`).

---

## 6. Lifecycle

- The PtyHost utility process is spawned on application boot.
- Individual shell PTY sessions are spawned dynamically when terminal panels are opened.
- TokenizationWorkers are initialized on-demand and terminate on idle timeout (default: 5 minutes).

---

## 7. Testing

- Native modules (`node-pty`) are mocked using virtual streams during unit testing.
- Run tests via `pnpm test`.

---

## 8. Example Usage

```typescript
import { PtyService } from "@ocs/runtime-pty";
import { container } from "@ocs/common";

const ptyService = container.resolve<IPtyService>("IPtyService");
const session = await ptyService.createSession("/bin/zsh", "/Users/workspace");
ptyService.onData(session)((data) => console.log(data));
```
