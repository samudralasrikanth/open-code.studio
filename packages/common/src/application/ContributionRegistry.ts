export interface IContribution {
  id: string;
}

export interface ICommandContribution extends IContribution {
  command: string;
  title: string;
  category?: string;
  icon?: string;
}

export interface IMenuContribution extends IContribution {
  menuId: string;
  command: string;
  group?: string;
  when?: string; // Evaluated context condition
}

export interface IViewContribution extends IContribution {
  viewId: string;
  name: string;
  containerId: string;
}

export class ContributionRegistry {
  private static _instance: ContributionRegistry;

  private commands = new Map<string, ICommandContribution>();
  private menus = new Map<string, IMenuContribution[]>();
  private views = new Map<string, IViewContribution>();

  private constructor() {}

  public static getInstance(): ContributionRegistry {
    if (!ContributionRegistry._instance) {
      ContributionRegistry._instance = new ContributionRegistry();
    }
    return ContributionRegistry._instance;
  }

  public registerCommand(contribution: ICommandContribution): void {
    this.commands.set(contribution.id, contribution);
  }

  public registerMenu(contribution: IMenuContribution): void {
    let group = this.menus.get(contribution.menuId);
    if (!group) {
      group = [];
      this.menus.set(contribution.menuId, group);
    }
    group.push(contribution);
  }

  public registerView(contribution: IViewContribution): void {
    this.views.set(contribution.id, contribution);
  }

  public getCommands(): ICommandContribution[] {
    return Array.from(this.commands.values());
  }

  public getMenuItems(menuId: string): IMenuContribution[] {
    return this.menus.get(menuId) || [];
  }

  public getViews(): IViewContribution[] {
    return Array.from(this.views.values());
  }
}
