import type { IDocument } from "./Document.js";

/**
 * Represents a document containing binary content (like an image).
 */
export interface IBinaryDocument extends IDocument {
  readonly type: "binary";

  /**
   * The MIME type of the binary content, if known.
   */
  readonly mimeType?: string;

  /**
   * Retrieves the binary content.
   */
  getBuffer(): Uint8Array;

  /**
   * Sets the binary content.
   */
  setBuffer(buffer: Uint8Array): void;

  /**
   * Returns the length of the binary buffer in bytes.
   */
  readonly size: number;
}
