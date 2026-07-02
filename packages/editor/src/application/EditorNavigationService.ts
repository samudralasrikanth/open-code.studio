import type { EditorInput } from "../domain/EditorInput.js";

interface HistoryEntry {
  input: EditorInput;
  timestamp: number;
}

/**
 * Tracks the history of active editors across groups for Back/Forward navigation.
 */
export class EditorNavigationService {
  private history: HistoryEntry[] = [];
  private currentIndex: number = -1;

  /**
   * Log that an input became active.
   */
  public logNavigation(input: EditorInput): void {
    // If we've navigated back and now navigate to a new thing, truncate the forward history
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Don't log if it's the same as the current active
    if (this.currentIndex >= 0) {
      const current = this.history[this.currentIndex];
      if (current && current.input === input) {
        return;
      }
    }

    this.history.push({ input, timestamp: Date.now() });

    // Limit history
    if (this.history.length > 50) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }

  public get canGoBack(): boolean {
    return this.currentIndex > 0;
  }

  public get canGoForward(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  public goBack(): EditorInput | undefined {
    if (!this.canGoBack) return undefined;
    this.currentIndex--;
    return this.history[this.currentIndex]?.input;
  }

  public goForward(): EditorInput | undefined {
    if (!this.canGoForward) return undefined;
    this.currentIndex++;
    return this.history[this.currentIndex]?.input;
  }
}
