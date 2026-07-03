# Performance Guidelines

> Version: 1.0
> Applies To: Entire Monorepo

---

# Purpose

Performance is a core product feature. Every contribution should consider its impact on responsiveness, memory usage, startup time, and scalability.

Goals:

- Fast startup
- Responsive UI
- Low memory footprint
- Efficient CPU usage
- Scalable architecture
- Measurable improvements

Performance optimizations should be driven by profiling and metrics, not assumptions.

---

# Performance Principles

1. Measure before optimizing.
2. Optimize algorithms before micro-optimizations.
3. Avoid unnecessary work.
4. Prefer lazy loading.
5. Cache expensive operations.
6. Offload heavy work to background workers.
7. Keep the UI thread responsive.

---

# Startup Performance

Targets:

| Metric            | Target      |
| ----------------- | ----------- |
| Cold Start        | < 2 seconds |
| Warm Start        | < 1 second  |
| First Interactive | < 3 seconds |

Recommendations:

- Lazy-load non-essential modules.
- Avoid synchronous filesystem access during startup.
- Defer AI initialization until needed.
- Load extensions incrementally.

---

# UI Performance

Guidelines:

- Minimize re-renders.
- Memoize expensive computations.
- Avoid unnecessary state updates.
- Virtualize long lists and trees.
- Use efficient diffing strategies.

Never block the main UI thread with expensive operations.

---

# File System Performance

- Batch filesystem operations where possible.
- Cache metadata when safe.
- Debounce file watcher events.
- Avoid repeated directory scans.
- Stream large file operations instead of loading everything into memory.

---

# Memory Management

Monitor:

- Heap growth
- Object retention
- Event listener leaks
- Unreleased resources
- Cache size

Release resources when they are no longer needed.

---

# Event Handling

- Debounce frequent events (e.g., search input).
- Throttle high-frequency updates (e.g., scroll, resize).
- Remove event listeners when components are disposed.

---

# Extension Performance

Extensions must:

- Load on demand.
- Avoid blocking activation.
- Use asynchronous APIs.
- Release resources during deactivation.

Slow extensions should be detectable through diagnostics.

---

# AI Performance

Optimize:

- Prompt construction
- Context assembly
- Token usage
- Provider selection
- Streaming responses
- Request batching where appropriate

Avoid sending unnecessary workspace context.

---

# Network Performance

- Compress payloads where appropriate.
- Reuse connections.
- Implement retries with backoff.
- Cache immutable resources.
- Minimize request count.

---

# Caching

Use caching for:

- Configuration
- File metadata
- Search indexes
- AI model metadata
- Extension manifests

Caches must define:

- Expiration policy
- Invalidation strategy
- Maximum size

---

# Background Work

Move long-running tasks off the UI thread:

Examples:

- Search indexing
- Git operations
- AI embeddings
- Large file parsing
- Extension discovery

Use workers or background processes where appropriate.

---

# Performance Budgets

Suggested budgets:

| Resource             | Budget   |
| -------------------- | -------- |
| Main Bundle          | < 5 MB   |
| Renderer Memory      | < 500 MB |
| Extension Activation | < 200 ms |
| Command Execution    | < 100 ms |
| File Open            | < 300 ms |

Budgets should be monitored and reviewed regularly.

---

# Profiling

Use profiling tools to analyze:

- CPU usage
- Memory allocation
- Rendering performance
- Event loop blocking
- Startup sequence

Profile before and after significant optimizations.

---

# Benchmarking

Benchmark critical workflows:

- Startup
- Workspace loading
- File search
- Text search
- AI response latency
- Git operations

Store benchmark results for comparison over time.

---

# Performance Review Checklist

Before merging:

- No unnecessary allocations
- No redundant renders
- No blocking synchronous work
- Background tasks isolated
- Memory usage reviewed
- Benchmarks updated (if applicable)

---

# Related Documents

- CODING_STANDARDS.md
- TESTING_GUIDELINES.md
- ARCHITECTURE.md
- SECURITY_GUIDELINES.md

---

End of Document
