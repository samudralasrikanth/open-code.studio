export interface CancellationToken {
  readonly isCancellationRequested: boolean;
  onCancellationRequested(listener: (e: any) => any): { dispose(): void };
}

export class CancellationTokenSource {
  private _token?: CancellationToken;
  private _isCancelled: boolean = false;
  private _listeners: Set<(e: any) => any> = new Set();

  get token(): CancellationToken {
    if (!this._token) {
      this._token = {
        get isCancellationRequested(): boolean {
          return false; // Will be overridden
        },
        onCancellationRequested: (listener: (e: any) => any) => {
          this._listeners.add(listener);
          if (this._isCancelled) {
            listener(undefined);
          }
          return {
            dispose: () => {
              this._listeners.delete(listener);
            }
          };
        }
      };

      // Bind the getter context to the source instance
      Object.defineProperty(this._token, "isCancellationRequested", {
        get: () => this._isCancelled
      });
    }
    return this._token;
  }

  cancel(): void {
    if (this._isCancelled) return;
    this._isCancelled = true;
    for (const listener of this._listeners) {
      try {
        listener(undefined);
      } catch (e) {
        console.error("Error in cancellation listener", e);
      }
    }
    this._listeners.clear();
  }

  dispose(): void {
    this.cancel();
  }
}
