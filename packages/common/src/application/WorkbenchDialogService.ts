export interface IDialogOptions {
  title?: string;
  message: string;
  detail?: string;
  type?: "info" | "warning" | "error" | "question";
  buttons?: string[];
  defaultId?: number;
  cancelId?: number;
}

export interface IDialogResult {
  response: number;
}

export class WorkbenchDialogService {
  private static _instance: WorkbenchDialogService;

  private constructor() {}

  public static getInstance(): WorkbenchDialogService {
    if (!WorkbenchDialogService._instance) {
      WorkbenchDialogService._instance = new WorkbenchDialogService();
    }
    return WorkbenchDialogService._instance;
  }

  public async showMessage(options: IDialogOptions): Promise<IDialogResult> {
    // In a real implementation this would bridge to Electron's dialog or web custom dialogs
    console.log("Dialog shown:", options);
    return { response: options.defaultId || 0 };
  }
}
