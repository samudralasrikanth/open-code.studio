import type { OcsAPI } from "../../../preload/preload.js";

/**
 * Augment the global Window interface to expose the typed OCS API
 * injected by the preload script via contextBridge.
 */
declare global {
  interface Window {
    ocs: OcsAPI;
    electron: {
      ipcRenderer: {
        send: (channel: string, ...args: unknown[]) => void;
        invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
        on: (channel: string, listener: (...args: unknown[]) => void) => void;
        off: (channel: string, listener: (...args: unknown[]) => void) => void;
      };
    };
  }
}

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
