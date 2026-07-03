/* eslint-disable */
import type { Container, Logger } from "@ocs/common";
import { CommandRegistry } from "@ocs/common";
import { DocumentService } from "@ocs/document/application";
import { SaveDocumentCommand } from "@ocs/document/application";
import { EditorService } from "@ocs/editor/application";

/**
 * Bootstraps Document, Editor, and Command infrastructure:
 * - DocumentService
 * - EditorService
 * - CommandRegistry (with SaveDocumentCommand)
 *
 * Registers singletons in the container under:
 *   Symbol.for("document"), Symbol.for("editor"), Symbol.for("commands")
 */
export function bootstrapDocument(container: Container, logger: Logger): void {
  logger.flow({ domain: "startup", source: "bootstrap", action: "document:start" });

  const workspaceFs = container.resolve<import("@ocs/workspace").LocalFileSystem>(
    Symbol.for("workspace.fs")
  );

  const documentService = new DocumentService(workspaceFs);
  const editorService = new EditorService();
  const commandRegistry = new CommandRegistry();
  commandRegistry.registerCommand(new SaveDocumentCommand(documentService));

  container.singleton(Symbol.for("document"), () => documentService);
  container.singleton(Symbol.for("editor"), () => editorService);
  container.singleton(Symbol.for("commands"), () => commandRegistry);

  logger.flow({ domain: "startup", source: "bootstrap", action: "document:done" });
}
