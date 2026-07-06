import { mkdtempSync, mkdirSync, writeFileSync } from "fs";
import * as fsPromises from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { EventBus } from "@ocs/common/events";
import { SearchService, ReplaceService, RipgrepProvider } from "@ocs/search";

describe("Integration: Search and Replace Engine", () => {
  let searchService: SearchService;
  let replaceService: ReplaceService;
  let eventBus: EventBus;
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "ocs-integration-search-"));
    // Create some files to search
    mkdirSync(join(tempDir, "src"));
    writeFileSync(join(tempDir, "src", "index.ts"), "const hello = 'world';\nconsole.log(hello);");
    writeFileSync(join(tempDir, "src", "app.ts"), "const hello = 'universe';\nconsole.log(hello);");
    writeFileSync(join(tempDir, "README.md"), "# Hello world\nWelcome to hello universe");

    eventBus = new EventBus();
    const provider = new RipgrepProvider();
    searchService = new SearchService(provider, eventBus);
    replaceService = new ReplaceService();
  });

  afterEach(async () => {
    await fsPromises.rm(tempDir, { recursive: true, force: true });
  });

  it("should find matches and replace all correctly", async () => {
    // 1. Search for "hello"
    const query = {
      id: "q1",
      text: "hello",
      isRegex: false,
      matchCase: true,
      matchWholeWord: false
    };

    let totalMatchesFound = 0;
    eventBus.subscribe("search.completed", (event: { payload: { totalMatches: number } }) => {
      totalMatchesFound = event.payload.totalMatches;
    });

    await searchService.executeSearch(query, tempDir);

    const results = searchService.getCachedResults("q1");
    expect(results).toBeDefined();
    expect(results?.length).toBe(3); // 3 files have "hello"

    // Total occurrences of "hello" (case sensitive):
    // index.ts: 2
    // app.ts: 2
    // README.md: 1 ("Hello" is uppercase, we used matchCase: true so it shouldn't match, only lowercase "hello")
    expect(totalMatchesFound).toBe(5);

    // 2. Execute Replace All
    await replaceService.executeReplaceAll("q1", results!, "foo");

    // 3. Verify files
    const indexContent = await fsPromises.readFile(join(tempDir, "src", "index.ts"), "utf-8");
    expect(indexContent).toBe("const foo = 'world';\nconsole.log(foo);");

    const appContent = await fsPromises.readFile(join(tempDir, "src", "app.ts"), "utf-8");
    expect(appContent).toBe("const foo = 'universe';\nconsole.log(foo);");

    const readmeContent = await fsPromises.readFile(join(tempDir, "README.md"), "utf-8");
    expect(readmeContent).toBe("# Hello world\nWelcome to foo universe");
  });

  it("should respect include and exclude glob patterns", async () => {
    // Search for "hello" but exclude .ts files
    const query = {
      id: "q2",
      text: "hello",
      isRegex: false,
      matchCase: false,
      matchWholeWord: false,
      excludePatterns: ["*.ts"]
    };

    let totalMatchesFound = 0;
    eventBus.subscribe("search.completed", (event: { payload: { totalMatches: number } }) => {
      totalMatchesFound = event.payload.totalMatches;
    });

    await searchService.executeSearch(query, tempDir);

    const results = searchService.getCachedResults("q2");
    expect(results).toBeDefined();
    expect(results?.length).toBe(1); // Only README.md
    expect(results![0].file.endsWith("README.md")).toBe(true);
    expect(totalMatchesFound).toBe(2); // README.md has "Hello" and "hello"

    // Search for "hello" only in .md files
    const queryInclude = {
      id: "q3",
      text: "hello",
      isRegex: false,
      matchCase: false,
      matchWholeWord: false,
      includePatterns: ["*.md"]
    };

    await searchService.executeSearch(queryInclude, tempDir);
    const resultsInclude = searchService.getCachedResults("q3");
    expect(resultsInclude?.length).toBe(1);
    expect(resultsInclude![0].matches.length).toBe(2);
  });

  it("should benchmark search performance on 1,000 files", async () => {
    const benchDir = join(tempDir, "bench");
    mkdirSync(benchDir);

    // Create 1,000 files
    const NUM_FILES = 1000;
    for (let i = 0; i < NUM_FILES; i++) {
      writeFileSync(
        join(benchDir, `file_${i}.txt`),
        `This is a test file number ${i}\nLooking for targetWord123 here.\nEnd of file.`
      );
    }

    const query = {
      id: "bench1",
      text: "targetWord123",
      isRegex: false,
      matchCase: true,
      matchWholeWord: false
    };

    let totalMatchesFound = 0;
    eventBus.subscribe(
      "search.completed",
      (event: { payload: { queryId: string; totalMatches: number } }) => {
        if (event.payload.queryId === "bench1") {
          totalMatchesFound = event.payload.totalMatches;
        }
      }
    );

    const start = Date.now();
    await searchService.executeSearch(query, benchDir);
    const duration = Date.now() - start;

    expect(totalMatchesFound).toBe(NUM_FILES);
    console.log(`Search Performance: ${NUM_FILES} files searched in ${duration}ms`);
    expect(duration).toBeLessThan(1000); // Should be very fast (under 1s)
  });
});
