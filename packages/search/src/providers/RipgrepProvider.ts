import { spawn, type ChildProcess } from "child_process";
import * as readline from "readline";

// Inline the logic from @vscode/ripgrep to avoid ESM/CJS mismatch in Electron.
// The package just resolves the platform-specific rg binary path.
const arch = process.env.npm_config_arch || process.arch;
const binaryName = process.platform === "win32" ? "rg.exe" : "rg";
let ripgrepPath: string;
try {
  // Resolve the platform-specific package that @vscode/ripgrep delegates to
  const platformPkg = `@vscode/ripgrep-${process.platform}-${arch}`;
  ripgrepPath = require.resolve(`${platformPkg}/bin/${binaryName}`);
} catch {
  // Fallback: try system-installed rg
  ripgrepPath = "rg";
}

import type { SearchQuery, SearchResult, SearchMatch } from "../domain/SearchQuery.js";
import type { SearchProvider } from "./SearchProvider.js";

export class RipgrepProvider implements SearchProvider {
  private activeSearches: Map<string, ChildProcess> = new Map();

  public async search(
    query: SearchQuery,
    cwd: string,
    onResult: (result: SearchResult) => void,
    onProgress?: (progress: { filesScanned: number; matchesFound: number }) => void
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const args: string[] = ["--json", "--heading"];

      if (query.isRegex) {
        // Ripgrep uses regex by default if not fixed strings, but let's be explicit just in case
      } else {
        args.push("--fixed-strings");
      }

      if (query.matchCase) {
        args.push("--case-sensitive");
      } else {
        args.push("--ignore-case");
      }

      if (query.matchWholeWord) {
        args.push("--word-regexp");
      }

      // Handling includes and excludes
      if (query.includePatterns && query.includePatterns.length > 0) {
        for (const pattern of query.includePatterns) {
          args.push("--glob", pattern);
        }
      }

      if (query.excludePatterns && query.excludePatterns.length > 0) {
        for (const pattern of query.excludePatterns) {
          args.push("--glob", `!${pattern}`);
        }
      }

      // Add the actual text query
      args.push(query.text);

      // Search in current directory (cwd)
      args.push(".");

      const rg = spawn(ripgrepPath, args, { cwd });
      this.activeSearches.set(query.id, rg);

      const rl = readline.createInterface({
        input: rg.stdout,
        crlfDelay: Infinity
      });

      let totalMatches = 0;
      let filesScanned = 0;

      // Grouping results per file
      let currentFileResult: SearchResult | null = null;

      rl.on("line", (line) => {
        try {
          const parsed = JSON.parse(line);

          if (parsed.type === "begin") {
            filesScanned++;
            currentFileResult = {
              file: parsed.data.path.text,
              preview: "",
              matches: []
            };
          } else if (parsed.type === "match" && currentFileResult) {
            const linesText = parsed.data.lines.text;
            // Multiple matches might be in one line object
            const submatches = parsed.data.submatches;

            for (const sub of submatches) {
              const match: SearchMatch = {
                text: sub.match.text,
                lineNumber: parsed.data.line_number,
                column: sub.start + 1, // ripgrep uses 0-based offset for start
                length: sub.end - sub.start
              };
              currentFileResult.matches.push(match);
              totalMatches++;
            }

            // Assign preview if empty, just take the first matched line's context
            if (!currentFileResult.preview) {
              currentFileResult.preview = linesText.trim();
            }

            if (onProgress) {
              onProgress({ filesScanned, matchesFound: totalMatches });
            }
          } else if (parsed.type === "end" && currentFileResult) {
            if (currentFileResult.matches.length > 0) {
              onResult(currentFileResult);
            }
            currentFileResult = null;
          }
        } catch (e) {
          // Ignore parse errors from non-json lines if any
        }
      });

      rg.stderr.on("data", () => {
        // Ripgrep often outputs warnings for unreadable files to stderr. We can mostly ignore them.
        // console.error(`rg stderr: ${data}`);
      });

      rg.on("close", (code) => {
        this.activeSearches.delete(query.id);
        if (code === 0 || code === 1) {
          // 0 means matched, 1 means no match found. Both are successful completions.
          resolve(totalMatches);
        } else {
          // Process aborted or failed
          reject(new Error(`Ripgrep exited with code ${code}`));
        }
      });

      rg.on("error", (err) => {
        this.activeSearches.delete(query.id);
        reject(err);
      });
    });
  }

  public cancel(queryId: string): void {
    const process = this.activeSearches.get(queryId);
    if (process) {
      process.kill("SIGTERM");
      this.activeSearches.delete(queryId);
    }
  }
}
