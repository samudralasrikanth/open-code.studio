# ADR-0029 — AI Gateway Routing and Provider Abstraction

## Status

Accepted

## Date

2026-07-03

## Context

The AI Gateway directs prompt requests to local runtimes or cloud APIs (OpenAI, Gemini, Anthropic). Coupling the Gateway directly to specific provider SDKs creates dependency bloat and violates open-closed principles.

## Decision

Invert the AI Gateway's dependency design. The AI Gateway depends strictly on a generic `IProviderAdapter` interface:

```typescript
export interface IProviderAdapter {
  execute(prompt: PromptDto, options: RequestOptions): Promise<Stream<TokenDto>>;
  metadata(): ProviderMetadata;
}
```

Concrete adapters (`OpenAIAdapter`, `AnthropicAdapter`, `GeminiAdapter`, `LocalRuntimeAdapter`) implement this interface. The AI Gateway manages:

- **Routing:** Dynamically selecting adapters based on user budget, network latency, and model capability requirements.
- **Resiliency:** Handing circuit breakers, exponential backoff retries, and falling back from local runtimes to cloud providers when GPU memory is saturated.

```
[ AI Gateway ]
      │
      ▼
 ┌─────────────┐
 │ Interface   │
 │ IProviderAd │
 └─────────────┘
      ▲
      ├─────────────────┬─────────────────┐
      │                 │                 │
 ┌──────────┐      ┌──────────┐      ┌──────────┐
 │ OpenAI   │      │ Anthropic│      │ Local    │
 │ Adapter  │      │ Adapter  │      │ Adapter  │
 └──────────┘      └──────────┘      └──────────┘
```

## Consequences

- **Positive:** Adding a new LLM provider requires creating a single adapter package without modifying the core gateway package. Gateway logic is fully unit-testable using mock adapters.
- **Negative:** Adapters must translate custom provider parameters (like temperature, top-k) to standard gateway representations.
