export interface TerminalProfile {
  id: string;
  name: string;
  path: string;
  args?: string[];
  icon?: string;
  isDefault?: boolean;
}
