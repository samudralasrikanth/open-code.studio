import type { WorkspaceUri } from "@ocs/workspace";

import type { IBinaryDocument } from "../domain/BinaryDocument.js";
import type { ITextDocument } from "../domain/TextDocument.js";

export class TextDocumentImpl implements ITextDocument {
  public readonly type = "text";
  public isDirty = false;

  constructor(
    public readonly id: string,
    public readonly uri: WorkspaceUri,
    public readonly languageId: string,
    public readonly encoding: string,
    private content: string,
    public readonly isReadonly: boolean = false
  ) {}

  public getText(): string {
    return this.content;
  }

  public setText(text: string): void {
    if (this.isReadonly) throw new Error("Document is readonly");
    if (this.content !== text) {
      this.content = text;
      this.isDirty = true;
    }
  }

  public get length(): number {
    return this.content.length;
  }

  public dispose(): void {
    // Release resources
  }
}

export class BinaryDocumentImpl implements IBinaryDocument {
  public readonly type = "binary";
  public isDirty = false;

  constructor(
    public readonly id: string,
    public readonly uri: WorkspaceUri,
    public readonly mimeType: string,
    private content: Uint8Array,
    public readonly isReadonly: boolean = false
  ) {}

  public getBuffer(): Uint8Array {
    return this.content;
  }

  public setBuffer(buffer: Uint8Array): void {
    if (this.isReadonly) throw new Error("Document is readonly");
    this.content = buffer;
    this.isDirty = true;
  }

  public get size(): number {
    return this.content.byteLength;
  }

  public dispose(): void {
    // Release resources
  }
}

/**
 * Factory for creating Document models.
 */
export class DocumentFactory {
  public createTextDocument(
    uri: WorkspaceUri,
    content: string,
    languageId: string = "plaintext",
    encoding: string = "utf-8",
    isReadonly: boolean = false
  ): ITextDocument {
    return new TextDocumentImpl(uri.toString(), uri, languageId, encoding, content, isReadonly);
  }

  public createBinaryDocument(
    uri: WorkspaceUri,
    content: Uint8Array,
    mimeType: string = "application/octet-stream",
    isReadonly: boolean = false
  ): IBinaryDocument {
    return new BinaryDocumentImpl(uri.toString(), uri, mimeType, content, isReadonly);
  }
}
