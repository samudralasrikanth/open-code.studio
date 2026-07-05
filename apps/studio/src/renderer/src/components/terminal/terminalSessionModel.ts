export interface TerminalSessionItem {
  id: string;
  name: string;
  shell?: string;
  cwd?: string;
  pid?: number;
  exitCode?: number;
  createdAt?: string | Date;
  buffer: string;
  exited: boolean;
}

function basename(value: string): string {
  const normalized = value.replace(/\\/g, "/");
  return normalized.split("/").filter(Boolean).pop() || value;
}

export function getDisplayTerminalName(name?: string, shell?: string): string {
  const trimmedName = name?.trim();
  const trimmedShell = shell?.trim();

  if (trimmedName && trimmedName.toLowerCase() !== "terminal") {
    return basename(trimmedName);
  }

  if (trimmedShell) {
    return basename(trimmedShell);
  }

  return "Terminal";
}

export function getNextActiveSessionId(
  sessions: readonly TerminalSessionItem[],
  activeId: string
): string | null {
  const remaining = sessions.filter((session) => session.id !== activeId);
  if (remaining.length === 0) return null;

  return remaining[remaining.length - 1]?.id ?? null;
}
