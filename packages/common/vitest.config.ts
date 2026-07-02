import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["{config,di,errors,events,lifecycle,logger,telemetry,src}/src/**/*.ts"]
    },
    include: ["**/*.test.ts"]
  }
});
