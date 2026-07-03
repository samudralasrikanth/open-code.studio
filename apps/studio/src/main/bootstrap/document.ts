/* eslint-disable */
import type { Container, Logger } from "@ocs/common";
import { CommandRegistry } from "@ocs/common";
import { DocumentService } from "@ocs/document/application";
import { SaveDocumentCommand } from "@ocs/document/application";
import {
  EditorService,
  OpenEditorCommand,
  CloseEditorCommand,
  PinEditorCommand,
  SplitRightCommand,
  SplitDownCommand,
  RevertDocumentCommand
} from "@ocs/editor/application";

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

  commandRegistry.registerCommand(new OpenEditorCommand(editorService, documentService));
  commandRegistry.registerCommand(new CloseEditorCommand(editorService));
  commandRegistry.registerCommand(new PinEditorCommand(editorService));
  commandRegistry.registerCommand(new SplitRightCommand(editorService));
  commandRegistry.registerCommand(new SplitDownCommand(editorService));
  commandRegistry.registerCommand(new RevertDocumentCommand(documentService));

  const eventBus = container.resolve<import("@ocs/common").EventBus>(Symbol.for("events"));
  eventBus.subscribe("workspace.opened", async (event: any) => {
    logger.info("Event workspace.opened captured, restoring editor layout state");
    const layout = event.payload.workspace.configuration?.settings?.layout;
    if (layout) {
      await editorService.restoreState(layout, async (uriStr) => {
        const { uriFromString } = await import("@ocs/workspace");
        const doc = await documentService.openDocument(uriFromString(uriStr));
        const { DocumentEditorInput } = await import("@ocs/editor");
        return new DocumentEditorInput(doc);
      });
    }
  });

  container.singleton(Symbol.for("document"), () => documentService);
  container.singleton(Symbol.for("editor"), () => editorService);
  container.singleton(Symbol.for("commands"), () => commandRegistry);

  logger.flow({ domain: "startup", source: "bootstrap", action: "document:done" });
}
