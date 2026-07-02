import type { ICommand } from "@ocs/common";
import type { WorkspaceUri } from "@ocs/workspace";

import type { DocumentService } from "./DocumentService.js";

export interface SaveDocumentCommandArgs {
  uri: WorkspaceUri;
}

export class SaveDocumentCommand implements ICommand<SaveDocumentCommandArgs, void> {
  public readonly id = "document.save";

  constructor(private readonly documentService: DocumentService) {}

  public async execute(args: SaveDocumentCommandArgs): Promise<void> {
    await this.documentService.saveDocument(args.uri);
  }
}
