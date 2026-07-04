import { ipcMain } from "electron";
import type { Container } from "@ocs/common";
import { KeybindingRegistry } from "@ocs/keybindings";
import { IpcChannels } from "../../../../shared/ipc-channels.js";

export function registerKeybindingHandlers(container: Container): void {
  const registry = container.resolve<KeybindingRegistry>(Symbol.for("KeybindingRegistry"));

  ipcMain.handle(IpcChannels.KEYBINDINGS_GET, async () => {
    return registry.getAll();
  });

  ipcMain.handle(IpcChannels.KEYBINDINGS_SET, async (_, binding: any) => {
    registry.registerUser(binding);
    return registry.getAll();
  });
}
