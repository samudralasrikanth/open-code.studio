import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";
import type { SessionSnapshot } from "../domain/SessionSnapshot.js";

export class SessionStore {
  private readonly sessionsDir: string;

  constructor(userDataPath: string) {
    this.sessionsDir = path.join(userDataPath, "OpenCodeStudio", "Sessions");
    this.ensureDirectoryExists();
  }

  public async save(workspaceId: string, snapshot: SessionSnapshot): Promise<void> {
    const filePath = this.getFilePath(workspaceId);
    const serialized = JSON.stringify(snapshot, null, 2);
    await fs.promises.writeFile(filePath, serialized, "utf8");
  }

  public async load(workspaceId: string): Promise<SessionSnapshot | null> {
    const filePath = this.getFilePath(workspaceId);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const content = await fs.promises.readFile(filePath, "utf8");
      const snapshot = JSON.parse(content) as SessionSnapshot;

      // Automated version migration/validation
      if (snapshot.version !== 1) {
        // Future migrations can be placed here. For version 1, we just return it.
        return this.migrate(snapshot);
      }

      return snapshot;
    } catch {
      return null; // Fault-tolerant: return null on corruption
    }
  }

  public delete(workspaceId: string): void {
    const filePath = this.getFilePath(workspaceId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  private getFilePath(workspaceId: string): string {
    const hash = createHash("md5").update(workspaceId).digest("hex");
    return path.join(this.sessionsDir, `${hash}.json`);
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.sessionsDir)) {
      fs.mkdirSync(this.sessionsDir, { recursive: true });
    }
  }

  private migrate(oldSnapshot: any): SessionSnapshot {
    // Basic migration logic: ensures structure matches target version
    return {
      version: 1,
      workspaceId: oldSnapshot.workspaceId || "",
      windowState: oldSnapshot.windowState || {
        width: 1024,
        height: 768,
        x: 0,
        y: 0,
        maximized: false,
        fullscreen: false,
        zoom: 1
      },
      editorLayout: oldSnapshot.editorLayout || { groups: [] },
      terminalState: oldSnapshot.terminalState || { tabs: [] },
      viewState: oldSnapshot.viewState || {},
      activeThemeId: oldSnapshot.activeThemeId
    };
  }
}
