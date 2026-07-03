/* eslint-disable */
import type { Container } from "@ocs/common";
import { ipcMain } from "electron";
import { uriFromString } from "@ocs/workspace";
import { IpcChannels } from "../../../../shared/ipc-channels.js";

export function registerDocumentHandlers(container: Container): void {
  const documentService = container.resolve<import("@ocs/document/application").DocumentService>(
    Symbol.for("document")
  );

  ipcMain.handle(IpcChannels.DOCUMENT_OPEN, async (_, uriStr: string) => {
    const uri = uriFromString(uriStr);
    const doc = await documentService.openDocument(uri);
    return {
      uri: doc.uri.toString(),
      type: doc.type,
      isDirty: doc.isDirty,
      isReadonly: doc.isReadonly,
      content: doc.type === "text" ? (doc as import("@ocs/document").ITextDocument).getText() : null
    };
  });

  ipcMain.handle(IpcChannels.DOCUMENT_CLOSE, async (_, uriStr: string) => {
    documentService.closeDocument(uriFromString(uriStr));
  });

  ipcMain.handle(IpcChannels.DOCUMENT_SAVE, async (_, uriStr: string) => {
    await documentService.saveDocument(uriFromString(uriStr));
  });

  ipcMain.handle(IpcChannels.DOCUMENT_GET, async (_, uriStr: string) => {
    const doc = await documentService.openDocument(uriFromString(uriStr));
    return {
      uri: doc.uri.toString(),
      type: doc.type,
      isDirty: doc.isDirty,
      isReadonly: doc.isReadonly,
      content: doc.type === "text" ? (doc as import("@ocs/document").ITextDocument).getText() : null
    };
  });

  ipcMain.handle(IpcChannels.DOCUMENT_UPDATE, async (_, uriStr: string, content: string) => {
    await documentService.updateDocumentText(uriFromString(uriStr), content);
  });

  ipcMain.handle(IpcChannels.DOCUMENT_REVERT, async (_, uriStr: string) => {
    await documentService.revertDocument(uriFromString(uriStr));
  });
}
