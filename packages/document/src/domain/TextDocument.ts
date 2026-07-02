import type { IDocument } from "./Document.js";

/**
 * Represents a document containing text content.
 */
export interface ITextDocument extends IDocument {
  readonly type: "text";

  /**
   * The language mode (e.g., 'typescript', 'json').
   */
  readonly languageId: string;

  /**
   * The file encoding (e.g., 'utf-8').
   */
  readonly encoding: string;

  /**
   * Returns the entire text content.
   */
  getText(): string;

  /**
   * Sets the entire text content.
   */
  setText(text: string): void;

  /**
   * Returns the length of the text.
   */
  readonly length: number;
}
