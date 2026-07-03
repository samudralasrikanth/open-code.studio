# Performance: Caching Strategies

This document maps the caching architecture used to reduce file I/O operations and LLM token costs.

---

## 1. Document Caching

- **Implementation:** `DocumentCache` tracks open documents in-memory.
- **Eviction Strategy:** Reference counting tracks when documents are no longer in use (referencing counter reaches 0). Stale clean files are evicted; dirty files remain cached to preserve unsaved changes.

---

## 2. Tokenizer & Token Cache

- **Implementation:** `TokenCache` stores computed token counts for prompt strings using MD5 hashes as keys.
- **Eviction Strategy:** LRU (Least Recently Used) cache with a default capacity of 1,000 queries.

---

## 3. AST Symbol Cache

- **Implementation:** Cached symbols database stored inside SQLite tables.
- **Invalidation:** Triggered incrementally by the `FileWatcher` service when a file is modified. Only modified files are re-parsed.
