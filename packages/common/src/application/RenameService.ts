import { URI } from "../domain/URI.js";

export interface RenameValidationResult {
  valid: boolean;
  errorMessage?: string;
}

export class RenameService {
  private static _instance: RenameService;
  private _activeRenameUri: URI | null = null;
  private _listeners: Set<(uri: URI | null) => void> = new Set();

  // Pluggable validators
  private _validators: Array<(uri: URI, newName: string) => Promise<RenameValidationResult>> = [];

  private constructor() {}

  public static getInstance(): RenameService {
    if (!RenameService._instance) {
      RenameService._instance = new RenameService();
    }
    return RenameService._instance;
  }

  public startRename(uri: URI): void {
    this._activeRenameUri = uri;
    this.notify();
  }

  public getActiveRename(): URI | null {
    return this._activeRenameUri;
  }

  public cancelRename(): void {
    this._activeRenameUri = null;
    this.notify();
  }

  public registerValidator(
    validator: (uri: URI, newName: string) => Promise<RenameValidationResult>
  ): { dispose: () => void } {
    this._validators.push(validator);
    return {
      dispose: () => {
        this._validators = this._validators.filter((v) => v !== validator);
      }
    };
  }

  public async validateRename(uri: URI, newName: string): Promise<RenameValidationResult> {
    if (!newName || newName.trim() === "") {
      return { valid: false, errorMessage: "Name cannot be empty" };
    }

    for (const validator of this._validators) {
      const result = await validator(uri, newName);
      if (!result.valid) {
        return result;
      }
    }

    return { valid: true };
  }

  public onRenameSessionChanged(listener: (uri: URI | null) => void): { dispose: () => void } {
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
        listener(this._activeRenameUri);
      } catch (e) {
        console.error("Error in rename listener", e);
      }
    }
  }
}
