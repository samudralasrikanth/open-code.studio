import type { WorkspaceUri } from "@ocs/workspace";

import type { IBinaryDocument } from "../domain/BinaryDocument.js";
import { SaveState } from "../domain/Document.js";
import type { ITextDocument } from "../domain/TextDocument.js";

export class TextDocumentImpl implements ITextDocument {
  public readonly type = "text";
  public saveState: SaveState = SaveState.Clean;

  constructor(
    public readonly id: string,
    public readonly uri: WorkspaceUri,
    public readonly languageId: string,
    public readonly encoding: string,
    private content: string,
    public readonly isReadonly: boolean = false,
    public diskMtimeMs: number | undefined = undefined
  ) {}

  public get isDirty(): boolean {
    return this.saveState === SaveState.Dirty;
  }

  public getText(): string {
    return this.content;
  }

  public revertContent(content: string): void {
    this.content = content;
    this.saveState = SaveState.Clean;
  }

  public setText(text: string): void {
    if (this.isReadonly) throw new Error("Document is readonly");
    if (this.content !== text) {
      this.content = text;
      this.saveState = SaveState.Dirty;
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
  public saveState: SaveState = SaveState.Clean;

  constructor(
    public readonly id: string,
    public readonly uri: WorkspaceUri,
    public readonly mimeType: string,
    private content: Uint8Array,
    public readonly isReadonly: boolean = false,
    public diskMtimeMs: number | undefined = undefined
  ) {}

  public get isDirty(): boolean {
    return this.saveState === SaveState.Dirty;
  }

  public getBuffer(): Uint8Array {
    return this.content;
  }

  public setBuffer(buffer: Uint8Array): void {
    if (this.isReadonly) throw new Error("Document is readonly");
    this.content = buffer;
    this.saveState = SaveState.Dirty;
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
    isReadonly: boolean = false,
    diskMtimeMs?: number
  ): ITextDocument {
    return new TextDocumentImpl(
      uri.toString(),
      uri,
      languageId,
      encoding,
      content,
      isReadonly,
      diskMtimeMs
    );
  }

  public createBinaryDocument(
    uri: WorkspaceUri,
    content: Uint8Array,
    mimeType: string = "application/octet-stream",
    isReadonly: boolean = false,
    diskMtimeMs?: number
  ): IBinaryDocument {
    return new BinaryDocumentImpl(uri.toString(), uri, mimeType, content, isReadonly, diskMtimeMs);
  }
}
