import type { WorkspaceUri } from "@ocs/workspace";
import * as monaco from "monaco-editor";

/**
 * Manages the lifecycle of Monaco editor ITextModels, caching them by URI to avoid duplicate model errors.
 */
export class ModelManager {
  private readonly _models = new Map<string, monaco.editor.ITextModel>();

  /**
   * Retrieves an existing model if cached, or creates a new one.
   */
  public getOrCreateModel(
    uri: WorkspaceUri,
    content: string,
    languageId: string
  ): monaco.editor.ITextModel {
    const key = uri.toString();
    let model = this._models.get(key);

    if (!model) {
      const monacoUri = monaco.Uri.parse(key);
      // Clean up any existing model registered in Monaco directly under this URI to prevent duplicate errors
      const existing = monaco.editor.getModel(monacoUri);
      if (existing) {
        existing.dispose();
      }

      model = monaco.editor.createModel(content, languageId, monacoUri);
      this._models.set(key, model);
    }

    return model;
  }

  /**
   * Disposes and deletes the model for the given URI from the cache.
   */
  public disposeModel(uri: WorkspaceUri): void {
    const key = uri.toString();
    const model = this._models.get(key);
    if (model) {
      model.dispose();
      this._models.delete(key);
    }
  }

  /**
   * Checks if a model exists in the cache.
   */
  public hasModel(uri: WorkspaceUri): boolean {
    return this._models.has(uri.toString());
  }

  /**
   * Cleans up all managed models.
   */
  public disposeAll(): void {
    for (const model of this._models.values()) {
      model.dispose();
    }
    this._models.clear();
  }
}
