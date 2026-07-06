import { expect, test, describe } from "vitest";
import {
  WorkbenchTransactionManager,
  Transaction
} from "../src/application/WorkbenchTransactionManager.js";

describe("WorkbenchTransactionManager", () => {
  test("should execute and undo transaction", async () => {
    const manager = WorkbenchTransactionManager.getInstance();
    manager.clear();

    let committed = false;
    let rolledBack = false;

    const tx = new Transaction("tx1", "Test Transaction");
    tx.addParticipant({
      commit: async () => {
        committed = true;
      },
      rollback: async () => {
        rolledBack = true;
      }
    });

    await manager.executeTransaction(tx);
    expect(committed).toBe(true);
    expect(rolledBack).toBe(false);

    await manager.undo();
    expect(rolledBack).toBe(true);
  });
});
