import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ConsoleSink,
  FileSink,
  Logger,
  maskSecrets,
  type LogRecord,
  type LogSink
} from "../src/index.js";

class MemorySink implements LogSink {
  public readonly records: LogRecord[] = [];

  public write(record: LogRecord): void {
    this.records.push(record);
  }
}

describe("Logger", () => {
  it("writes structured records and masks secrets", () => {
    const sink = new MemorySink();
    const logger = new Logger({ level: "debug", sinks: [sink] });

    logger.info("hello", { token: "secret", nested: { password: "secret" } });

    expect(sink.records[0]?.message).toBe("hello");
    expect(sink.records[0]?.context).toEqual({
      token: "********",
      nested: { password: "********" }
    });
  });

  it("filters records below the configured level", () => {
    const sink = new MemorySink();
    const logger = new Logger({ level: "warn", sinks: [sink] });

    logger.info("hidden");
    logger.warn("visible");

    expect(sink.records.map((record) => record.message)).toEqual(["visible"]);
  });

  it("masks matching keys", () => {
    expect(maskSecrets({ apiKey: "secret" }, ["key"])).toEqual({ apiKey: "********" });
  });

  it("writes to file sinks and handles non-object masking", () => {
    const directory = mkdtempSync(join(tmpdir(), "ocs-logs-"));
    const file = join(directory, "app.log");
    const logger = new Logger({ sinks: [new FileSink(file)] });

    logger.error("stored", { value: 1 });

    expect(readFileSync(file, "utf8")).toContain("stored");
    expect(maskSecrets("plain")).toEqual({});
  });

  it("writes console records", () => {
    const sink = new ConsoleSink();

    sink.write({
      timestamp: new Date().toISOString(),
      level: "info",
      message: "console",
      context: {}
    });

    expect(sink).toBeInstanceOf(ConsoleSink);
  });
});
