// Domain
export type { IDocument, DocumentType } from "./domain/Document.js";
export type { ITextDocument } from "./domain/TextDocument.js";
export type { IBinaryDocument } from "./domain/BinaryDocument.js";

// Application
export { DocumentRegistry } from "./application/DocumentRegistry.js";
export {
  DocumentFactory,
  TextDocumentImpl,
  BinaryDocumentImpl
} from "./application/DocumentFactory.js";
export { FileSystemDocumentResolver } from "./application/DocumentResolver.js";
export type { IDocumentResolver } from "./application/DocumentResolver.js";
export type { SaveDocumentCommandArgs } from "./application/SaveDocumentCommand.js";

// Events
export { DocumentEventTypes } from "./events/DocumentEvents.js";
export type {
  DocumentEventType,
  DocumentEvents,
  DocumentOpenedPayload,
  DocumentClosedPayload,
  DocumentSavedPayload,
  DocumentChangedPayload
} from "./events/DocumentEvents.js";
