# package: @ocs/gateway

This package manages LLM provider routing, connection failovers, caching structures, and credential secure storage.

---

## 1. Architecture

The Gateway uses a pluggable provider design where specific client libraries are encapsulated behind a unified adapter.

```
@ocs/gateway/
├── src/
│   ├── domain/                  # Provider contracts
│   │     └── ILlmProvider.ts
│   ├── application/             # Routing engines
│   │     ├── GatewayService.ts
│   │     └── CircuitBreaker.ts
│   └── infrastructure/          # Client wrappers
│         ├── GeminiProvider.ts
│         └── OpenAIProvider.ts
```

---

## 2. Public API

- `GatewayService`
  - `generateCompletion(req: CompletionRequest): Promise<CompletionResponse>`
  - `streamCompletion(req: CompletionRequest): Promise<ReadableStream>`
  - `registerProvider(id: string, provider: ILlmProvider): void`

---

## 3. Internal API

- `CircuitBreaker`: Tracks error rates per provider and triggers fallback routes when thresholds are exceeded.
- `SecureCredentialStorage`: Integrates with operating system vaults to securely store API credentials.

---

## 4. Dependencies

- `@ocs/common` (Leaf utilities)
- `@ocs/event-bus` (Event coordination)
- `@ocs/runtime-tokenizer` (For prompt budget validations)

---

## 5. Import Rules

- **Allowed Imports:** `@ocs/common`, `@ocs/event-bus`, `@ocs/runtime-tokenizer`.
- **Forbidden Imports:** Must never import from AST parsers (`@ocs/knowledge`), AI agents (`@ocs/agents`), or UI rendering shells.

---

## 6. Lifecycle

- Initialized on window startup. Retrieves cached credentials and tests client handshakes in the background.

---

## 7. Testing

- Network calls are mocked using standard HTTP mock servers (e.g. MSW) to test connection failovers, timeouts, and stream parsing.

---

## 8. Example Usage

```typescript
import { GatewayService } from "@ocs/gateway";
import { container } from "@ocs/common";

const gateway = container.resolve<IGatewayService>("IGatewayService");
const stream = await gateway.streamCompletion({
  model: "gemini-1.5-pro",
  prompt: "Write a quicksort function."
});
```
