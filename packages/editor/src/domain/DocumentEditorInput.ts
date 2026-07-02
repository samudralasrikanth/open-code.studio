import type { IDocument } from "@ocs/document";
import type { WorkspaceUri } from "@ocs/workspace";
import { uriDisplayName, uriToPath } from "@ocs/workspace";

import { EditorInput } from "./EditorInput.js";

/**
 * An EditorInput that wraps a Document.
 */
export class DocumentEditorInput extends EditorInput {
  constructor(private readonly document: IDocument) {
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
}
