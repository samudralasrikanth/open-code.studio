import type { ICommand } from "@ocs/common";
import type { DocumentService } from "@ocs/document/application";
import type { WorkspaceUri } from "@ocs/workspace";

import { DocumentEditorInput } from "../domain/DocumentEditorInput.js";

import type { EditorService } from "./EditorService.js";

export interface OpenEditorCommandArgs {
  uri: WorkspaceUri;
  preview?: boolean;
  active?: boolean;
  group?: string;
}

export class OpenEditorCommand implements ICommand<OpenEditorCommandArgs, void> {
  public readonly id = "editor.open";

  constructor(
    private readonly editorService: EditorService,
    private readonly documentService: DocumentService
  ) {}

  public async execute(args: OpenEditorCommandArgs): Promise<void> {
    const doc = await this.documentService.openDocument(args.uri);
    const options: { preview?: boolean; active?: boolean; group?: string } = {};
    if (args.preview !== undefined) options.preview = args.preview;
    if (args.active !== undefined) options.active = args.active;
    if (args.group !== undefined) options.group = args.group;

    this.editorService.openEditor(new DocumentEditorInput(doc), options);
  }
}

export interface CloseEditorCommandArgs {
  uri: WorkspaceUri;
  groupId?: string;
}

export class CloseEditorCommand implements ICommand<CloseEditorCommandArgs, void> {
  public readonly id = "editor.close";

  constructor(private readonly editorService: EditorService) {}

  public execute(args: CloseEditorCommandArgs): void {
    const group = args.groupId
      ? this.editorService.groups.find((g) => g.id === args.groupId)
      : undefined;

    if (group) {
      const input = group.inputs.find((i) => i.id === args.uri.toString());
      if (input) {
        this.editorService.closeEditor(input, group);
      }
    } else {
      for (const g of this.editorService.groups) {
        const input = g.inputs.find((i) => i.id === args.uri.toString());
        if (input) {
          this.editorService.closeEditor(input, g);
        }
      }
    }
  }
}

export interface PinEditorCommandArgs {
  uri: WorkspaceUri;
  groupId?: string;
}

export class PinEditorCommand implements ICommand<PinEditorCommandArgs, void> {
  public readonly id = "editor.pin";

  constructor(private readonly editorService: EditorService) {}

  public execute(args: PinEditorCommandArgs): void {
    const group = args.groupId
      ? this.editorService.groups.find((g) => g.id === args.groupId)
      : this.editorService.activeGroup;

    if (group) {
      const input = group.inputs.find((i) => i.id === args.uri.toString());
      if (input) {
        group.pinInput(input);
      }
    }
  }
}

export class SplitRightCommand implements ICommand<void, void> {
  public readonly id = "editor.splitRight";

  constructor(private readonly editorService: EditorService) {}

  public execute(): void {
    const newGroupId = `group-${Date.now()}`;
    this.editorService.splitActiveGroup("horizontal", newGroupId);
  }
}

export class SplitDownCommand implements ICommand<void, void> {
  public readonly id = "editor.splitDown";

  constructor(private readonly editorService: EditorService) {}

  public execute(): void {
    const newGroupId = `group-${Date.now()}`;
    this.editorService.splitActiveGroup("vertical", newGroupId);
  }
}

export interface RevertDocumentCommandArgs {
  uri: WorkspaceUri;
}

export class RevertDocumentCommand implements ICommand<RevertDocumentCommandArgs, void> {
  public readonly id = "document.revert";

  constructor(private readonly documentService: DocumentService) {}

  public async execute(args: RevertDocumentCommandArgs): Promise<void> {
    await this.documentService.revertDocument(args.uri);
  }
}
