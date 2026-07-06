import type { IDocument } from "@ocs/document";
import type { DocumentService } from "@ocs/document/application";
import type { WorkspaceUri } from "@ocs/workspace";
import { uriDisplayName, uriToPath } from "@ocs/workspace";

import { EditorInput } from "./EditorInput.js";

/**
 * An EditorInput that wraps a Document.
 */
export class DocumentEditorInput extends EditorInput {
  constructor(
    public readonly document: IDocument,
    private readonly documentService?: DocumentService,
    private readonly syncProvider?: () => Promise<void>
  ) {
    super();
  }

  public get id(): string {
    return this.document.uri.toString();
  }

  public get uri(): WorkspaceUri {
    return this.document.uri;
  }

  public getName(): string {
    return uriDisplayName(this.document.uri);
  }

  public getTooltip(): string | undefined {
    return uriToPath(this.document.uri);
  }

  public isDirty(): boolean {
    return this.document.isDirty;
  }

  public isReadonly(): boolean {
    return this.document.isReadonly;
  }

  public override async save(): Promise<void> {
    if (!this.documentService) {
      throw new Error("DocumentService not injected into DocumentEditorInput");
    }

    // 1. Await IPC roundtrip: Request frontend to flush pending edits
    if (this.syncProvider) {
      await this.syncProvider();
    }

    // 2. Await document save
    await this.documentService.saveDocument(this.document.uri);
  }
}
