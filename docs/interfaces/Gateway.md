# Interface Specification: Gateway

This document defines the strict engineering contract for the Gateway subsystem.

---

## 1. Responsibilities

- Route LLM compilation and text request prompts to active providers (Gemini, OpenAI, Local models).
- Manage API credentials, usage tracking, and local prompt caching.
- Enforce circuit breaker patterns, request timeouts, and automatic retry loops.

---

## 2. Lifetime & Ownership

- **Owner:** Managed via Dependency Injection (`container.register("IGatewayService", GatewayService)`).
- **Lifetime Scope:** Singleton per active window session.
- **Provider Registration:** Providers are dynamically loaded as pluggable classes implementing `ILlmProvider`.

---

## 3. Threading & Concurrency Model

- **Non-blocking Network Streams:** Requests run asynchronously, using chunk-based WebSocket or Server-Sent Events (SSE) streaming.
- **Concurrent Request Limits:** Restrict maximum concurrent API requests (default: 5) to prevent local network saturation or provider rate limits.

---

## 4. Cardinality & Implementations

- **Single Coordinator:** One active `GatewayService` orchestrates client requests.
- **Pluggable Providers:** Multiple providers (e.g. `GeminiProvider`, `OllamaProvider`) can be registered concurrently.

---

## 5. Event Specifications

- **`onGatewayRequestStarted`**
  - **Payload:** `{ requestId: string; modelId: string }`
- **`onGatewayResponseChunk`**
  - **Payload:** `{ requestId: string; chunk: string }`
- **`onGatewayRequestCompleted`**
  - **Payload:** `{ requestId: string; usage: TokenUsage }`

---

## 6. Error & Failure Contracts

- **Error DTOs:**
  - `ProviderRateLimitError`: API rate limit reached.
  - `ProviderConnectionError`: Network timeout or provider endpoint unreachable.
  - `ContextLimitExceededError`: Prompt size exceeds model's context window.
- **IPC Boundaries:** Main process intercepts raw `Error` objects and serializes them into sanitized `{ success: false, code: string, message: string }` DTOs before sending them to the Renderer process over Electron IPC.

---

## 7. Electron IPC & API Mapping

- **IPC Channels:**
  - `gateway:generate` $\rightarrow$ `generateCompletion(request)`
  - `gateway:stream` $\rightarrow$ `streamCompletion(request)` (sets up SSE stream handler)
  - `gateway:providers` $\rightarrow$ `getRegisteredProviders()`

---

## 8. Performance Targets

- **Gateway Overhead:** $<5\text{ms}$ routing latency prior to network execution.
- **Streaming Start Latency:** $<100\text{ms}$ to return first token chunk from API gateway.

---

## 9. Persistence & State

- API keys are stored securely using platform credential managers. Usage histories and cost track logs are cached in the local SQLite memory database.

---

## 10. Required Test Scenarios

- **Unit Tests:** Mock provider networks to verify circuit breaker trip limits.
- **Integration Tests:** Verify stream termination and clean resource disposal on connection abort.
- **Security Tests:** Verify that API keys are never exposed in logs or sent across IPC in plaintext.
