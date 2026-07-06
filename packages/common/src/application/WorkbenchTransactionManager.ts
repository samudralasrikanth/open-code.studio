export interface ITransactionParticipant {
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export interface ITransaction {
  id: string;
  name: string;
  participants: ITransactionParticipant[];
  addParticipant(participant: ITransactionParticipant): void;
  commit(): Promise<void>;
  undo(): Promise<void>;
  redo(): Promise<void>;
}

export class Transaction implements ITransaction {
  public participants: ITransactionParticipant[] = [];

  constructor(
    public readonly id: string,
    public readonly name: string
  ) {}

  addParticipant(participant: ITransactionParticipant): void {
    this.participants.push(participant);
  }

  async commit(): Promise<void> {
    for (const p of this.participants) {
      await p.commit();
    }
  }

  async undo(): Promise<void> {
    // Undo in reverse order
    for (let i = this.participants.length - 1; i >= 0; i--) {
      await this.participants[i]!.rollback();
    }
  }

  async redo(): Promise<void> {
    await this.commit();
  }
}

export class WorkbenchTransactionManager {
  private static _instance: WorkbenchTransactionManager;
  private undoStack: ITransaction[] = [];
  private redoStack: ITransaction[] = [];

  private constructor() {}

  public static getInstance(): WorkbenchTransactionManager {
    if (!WorkbenchTransactionManager._instance) {
      WorkbenchTransactionManager._instance = new WorkbenchTransactionManager();
    }
    return WorkbenchTransactionManager._instance;
  }

  public async executeTransaction(transaction: ITransaction): Promise<void> {
    try {
      await transaction.commit();
      this.undoStack.push(transaction);
      this.redoStack = []; // Clear redo stack on new action
    } catch (error) {
      // If commit fails, attempt to rollback what succeeded
      await transaction.undo();
      throw error;
    }
  }

  public async undo(): Promise<void> {
    const transaction = this.undoStack.pop();
    if (transaction) {
      await transaction.undo();
      this.redoStack.push(transaction);
    }
  }

  public async redo(): Promise<void> {
    const transaction = this.redoStack.pop();
    if (transaction) {
      await transaction.redo();
      this.undoStack.push(transaction);
    }
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
