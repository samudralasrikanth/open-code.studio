/* eslint-disable */
import type { Container } from "@ocs/common";
import { ipcMain, webContents } from "electron";
import { uriFromString } from "@ocs/workspace";
import type { EditorGroup, EditorInput } from "@ocs/editor";
import { EditorEventTypes } from "@ocs/editor";
import { IpcChannels } from "../../../../shared/ipc-channels.js";

export function registerEditorHandlers(container: Container): void {
  const editorService = container.resolve<import("@ocs/editor/application").EditorService>(
    Symbol.for("editor")
  );
  const documentService = container.resolve<import("@ocs/document/application").DocumentService>(
    Symbol.for("document")
  );

  ipcMain.handle(
    IpcChannels.EDITOR_OPEN,
    async (
      _,
      inputStr: string,
      options?: { preview?: boolean; active?: boolean; group?: string | EditorGroup }
    ) => {
      console.log(`[EDITOR_OPEN] Called with inputStr: ${inputStr}`);

      if (inputStr.startsWith("extension://")) {
        console.log(`[EDITOR_OPEN] Handling extension scheme`);
        // Create a dummy extension EditorInput dynamically since it's not in @ocs/editor
        const { EditorInput } = await import("@ocs/editor");
        class ExtensionEditorInput extends EditorInput {
          public readonly id = inputStr;
          public readonly uri = inputStr as any; // Cast as any because it's not a true WorkspaceUri
          public getName(): string {
            return inputStr.replace("extension://", "");
          }
          public getTooltip(): string | undefined {
            return `Extension: ${this.getName()}`;
          }
          public isDirty(): boolean {
            return false;
          }
          public isReadonly(): boolean {
            return true;
          }
        }
        editorService.openEditor(new ExtensionEditorInput(), options);
        return;
      }

      const uri = uriFromString(inputStr);
      const doc = await documentService.openDocument(uri);
      const { DocumentEditorInput } = await import("@ocs/editor");
      editorService.openEditor(new DocumentEditorInput(doc), options);
    }
  );

  ipcMain.handle(IpcChannels.EDITOR_CLOSE, async (_, inputStr: string, groupId?: string) => {
    const uri = uriFromString(inputStr);
    const group = groupId
      ? editorService.groups.find((g: { id: string }) => g.id === groupId)
      : undefined;

    const performClose = async (input: EditorInput, g: EditorGroup) => {
      if (input.isDirty()) {
        const { dialog } = await import("electron");
        const result = await dialog.showMessageBox({
          type: "warning",
          buttons: ["Save", "Don't Save", "Cancel"],
          title: "Save changes?",
          message: `Do you want to save the changes you made to ${input.getName()}?`,
          detail: "Your changes will be lost if you don't save them.",
          cancelId: 2
        });

        if (result.response === 0) {
          await documentService.saveDocument(uri);
        } else if (result.response === 2) {
          return;
        }
      }
      editorService.closeEditor(input, g);
    };

    if (group) {
      const input = group.inputs.find((i: EditorInput) => i.id === uri.toString());
      if (input) await performClose(input, group);
    } else {
      for (const g of editorService.groups) {
        const input = g.inputs.find((i: EditorInput) => i.id === uri.toString());
        if (input) await performClose(input, g);
      }
    }
  });

  ipcMain.handle(IpcChannels.EDITOR_GET_STATE, () => ({
    layout: editorService.editorLayout,
    groups: editorService.groups.map(
      (g: {
        id: string;
        inputs: any[];
        activeInput?: { id: string };
        previewInput?: { id: string };
      }) => ({
        id: g.id,
        inputs: g.inputs.map((i) => i.id),
        activeInput: g.activeInput?.id,
        previewInput: g.previewInput?.id,
        dirtyInputs: g.inputs
          .filter((i) => typeof i.isDirty === "function" && i.isDirty())
          .map((i) => i.id)
      })
    ),
    activeGroup: editorService.activeGroup?.id
  }));

  const broadcastEditorState = () => {
    webContents.getAllWebContents().forEach((wc) => {
      wc.send(IpcChannels.EDITOR_STATE_CHANGED, {
        layout: editorService.editorLayout,
        groups: editorService.groups.map(
          (g: {
            id: string;
            inputs: any[];
            activeInput?: { id: string };
            previewInput?: { id: string };
          }) => ({
            id: g.id,
            inputs: g.inputs.map((i) => i.id),
            activeInput: g.activeInput?.id,
            previewInput: g.previewInput?.id,
            dirtyInputs: g.inputs
              .filter((i) => typeof i.isDirty === "function" && i.isDirty())
              .map((i) => i.id)
          })
        ),
        activeGroup: editorService.activeGroup?.id
      });
    });
  };

  editorService.eventBus.on("editor.opened", broadcastEditorState);
  editorService.eventBus.on("editor.closed", broadcastEditorState);
  editorService.eventBus.on(EditorEventTypes.EDITOR_ACTIVE_CHANGED, broadcastEditorState);
  documentService.eventBus.on("document.changed", broadcastEditorState);
}
