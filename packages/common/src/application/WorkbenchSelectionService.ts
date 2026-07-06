import { URI } from "../domain/URI.js";

export interface SelectionModel {
  selectedUris: URI[];
  activeUri: URI | null;
}

export class WorkbenchSelectionService {
  private static _instance: WorkbenchSelectionService;
  private _selection: SelectionModel = { selectedUris: [], activeUri: null };
  private _listeners: Set<(selection: SelectionModel) => void> = new Set();

  private constructor() {}

  public static getInstance(): WorkbenchSelectionService {
    if (!WorkbenchSelectionService._instance) {
      WorkbenchSelectionService._instance = new WorkbenchSelectionService();
    }
    return WorkbenchSelectionService._instance;
  }

  public setSelection(uris: URI[], activeUri?: URI): void {
    this._selection = {
      selectedUris: [...uris],
      activeUri: activeUri || (uris.length > 0 ? (uris[0] as URI) : null)
    };
    this.notify();
  }

  public getSelection(): SelectionModel {
    return this._selection;
  }

  public clearSelection(): void {
    this._selection = { selectedUris: [], activeUri: null };
    this.notify();
  }

  public onSelectionChanged(listener: (selection: SelectionModel) => void): {
    dispose: () => void;
  } {
    this._listeners.add(listener);
    return {
      dispose: () => {
        this._listeners.delete(listener);
      }
    };
  }

  private notify(): void {
    for (const listener of this._listeners) {
      try {
        listener(this._selection);
      } catch (e) {
        console.error("Error in selection listener", e);
      }
    }
  }
}
