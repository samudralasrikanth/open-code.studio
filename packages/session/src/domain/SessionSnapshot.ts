export interface WindowState {
  readonly width: number;
  readonly height: number;
  readonly x: number;
  readonly y: number;
  readonly maximized: boolean;
  readonly fullscreen: boolean;
  readonly zoom: number;
}

export interface TabState {
  readonly uri: string;
  readonly cursorPosition?: { readonly lineNumber: number; readonly column: number };
  readonly scrollOffset?: { readonly scrollTop: number; readonly scrollLeft: number };
}

export interface EditorGroupState {
  readonly id: string;
  readonly activeTabUri?: string;
  readonly tabs: TabState[];
}

export interface EditorLayoutState {
  readonly activeGroupId?: string;
  readonly groups: EditorGroupState[];
  readonly splitRatio?: number[];
}

export interface TerminalTabState {
  readonly id: string;
  readonly title: string;
  readonly cwd: string;
  readonly shellType?: string;
}

export interface TerminalSessionState {
  readonly activeTabId?: string;
  readonly tabs: TerminalTabState[];
}

export interface ViewState {
  readonly sidebarWidth?: number;
  readonly bottomPanelHeight?: number;
  readonly activeActivityBarTab?: string;
  readonly expandedExplorerNodes?: string[];
}

export interface SessionSnapshot {
  readonly version: number;
  readonly workspaceId: string;
  readonly windowState: WindowState;
  readonly editorLayout: EditorLayoutState;
  readonly terminalState: TerminalSessionState;
  readonly viewState: ViewState;
  readonly activeThemeId?: string;
}
