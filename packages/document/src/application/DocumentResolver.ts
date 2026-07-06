import type { WorkspaceUri, IFileSystem } from "@ocs/workspace";
import { uriScheme, uriToPath } from "@ocs/workspace";

import type { IDocument } from "../domain/Document.js";

import type { DocumentFactory } from "./DocumentFactory.js";

/**
 * Interface for loading document content from its source.
 */
export interface IDocumentResolver {
  canResolve(uri: WorkspaceUri): boolean;
  resolve(uri: WorkspaceUri): Promise<IDocument>;
}

/**
 * Resolves local file system paths using the workspace's IFileSystem.
 */
export class FileSystemDocumentResolver implements IDocumentResolver {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly documentFactory: DocumentFactory
  ) {}

  public canResolve(uri: WorkspaceUri): boolean {
    return uriScheme(uri) === "file";
  }

  public async resolve(uri: WorkspaceUri): Promise<IDocument> {
    const path = uriToPath(uri);
    const stat = await this.fileSystem.stat(path);
    if (stat.isDirectory) {
      throw new Error(`Cannot resolve directory as document: ${uri.toString()}`);
    }

    // Heuristic: For now, try to load as text. If we had a robust file type
    // detection, we would conditionally load binary docs.
    const content = await this.fileSystem.readFile(path);

    // Naive language resolution (can be injected via a LanguageRegistry later)
    const languageId = this.guessLanguageId(uri);

    return this.documentFactory.createTextDocument(
      uri,
      content,
      languageId,
      "utf-8",
      false,
      stat.mtimeMs
    );
  }

  private guessLanguageId(uri: WorkspaceUri): string {
    const path = uriToPath(uri).toLowerCase();
    if (path.endsWith(".ts") || path.endsWith(".tsx")) return "typescript";
    if (path.endsWith(".js") || path.endsWith(".jsx")) return "javascript";
    if (path.endsWith(".json")) return "json";
    if (path.endsWith(".md")) return "markdown";
    if (path.endsWith(".html")) return "html";
    if (path.endsWith(".css")) return "css";
    return "plaintext";
  }
}
