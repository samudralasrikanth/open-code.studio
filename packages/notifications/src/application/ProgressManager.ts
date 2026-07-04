import type { NotificationService } from "./NotificationService.js";

export interface ProgressSession {
  readonly id: string;
  update(progress: number, message?: string): void;
  done(message?: string): void;
}

export class ProgressManager {
  constructor(private readonly service: NotificationService) {}

  public createSession(title: string, source?: string): ProgressSession {
    const id = this.service.create({
      title,
      severity: "info",
      source,
      progress: 0,
      persistent: true
    });

    return {
      id,
      update: (progress: number, message?: string) => {
        this.service.update(id, { progress, message });
      },
      done: (message?: string) => {
        this.service.update(id, { progress: 100, message: message || "Completed." });
        // Auto-dismiss progress notification after 2 seconds
        setTimeout(() => {
          this.service.dismiss(id);
        }, 2000);
      }
    };
  }
}
