import * as fs from "fs/promises";

import type { ReplaceOperation, SearchResult } from "../domain/SearchQuery.js";

export class ReplaceService {
  /**
   * Applies the replace operation to a file.
   * This is a simple implementation that replaces the text.
   * Note: This is an MVP and may not handle complex multi-line AST replacement correctly.
   */
  public async executeReplace(operation: ReplaceOperation): Promise<void> {
    const fileContent = await fs.readFile(operation.file, "utf8");
    const lines = fileContent.split(/\r?\n/);

    // Sort replacements by line number descending and column descending so that
    // earlier replacements on the same line don't shift the offsets of later replacements.
    const sortedReplacements = [...operation.replacementMatches].sort((a, b) => {
      if (b.lineNumber !== a.lineNumber) {
        return b.lineNumber - a.lineNumber;
      }
      return b.column - a.column;
    });

    for (const match of sortedReplacements) {
      // lineNumber is 1-indexed
      const lineIndex = match.lineNumber - 1;
      const line = lines[lineIndex];
      if (line !== undefined) {
        // column is 1-indexed offset
        const startIndex = match.column - 1;
        const before = line.slice(0, startIndex);
        const after = line.slice(startIndex + match.length);
        lines[lineIndex] = before + match.replacementText + after;
      }
    }

    await fs.writeFile(operation.file, lines.join("\n"), "utf8");
  }

  /**
   * Replaces all matches in all files from a set of search results.
   */
  public async executeReplaceAll(
    queryId: string,
    results: SearchResult[],
    replaceText: string
  ): Promise<void> {
    const promises = results.map((result) => {
      const operation: ReplaceOperation = {
        searchQueryId: queryId,
        file: result.file,
        replacementMatches: result.matches.map((match) => ({
          lineNumber: match.lineNumber,
          column: match.column,
          length: match.length,
          replacementText: replaceText
        }))
      };
      return this.executeReplace(operation);
    });

    await Promise.all(promises);
  }
}
