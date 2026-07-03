import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"]
    },
    globals: false,
    include: ["{apps,packages,services,tooling}/**/*.test.ts", "tests/**/*.test.ts"],
    alias: {
      "monaco-editor": new URL("./packages/editor-monaco/tests/mock-monaco.ts", import.meta.url)
        .pathname
    }
  }
});
