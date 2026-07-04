import { resolve } from "path";

import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

/**
 * Workspace packages that should be BUNDLED into the main process (not
 * externalized) because they are TypeScript source-only and don't have a
 * built CJS dist that Electron can require() at runtime.
 */
const WORKSPACE_PACKAGES = [
  "@ocs/common",
  "@ocs/workspace",
  "@ocs/explorer",
  "@ocs/document",
  "@ocs/editor",
  "@ocs/editor-monaco",
  "@ocs/ui",
  "@ocs/terminal",
  "@ocs/git",
  "@ocs/commands",
  "@ocs/search",
  "@ocs/settings",
  "@ocs/theme",
  "@ocs/notifications",
  "@ocs/keybindings",
  "@ocs/session",
  "@ocs/extensions"
];

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        exclude: WORKSPACE_PACKAGES
      })
    ],
    resolve: {
      alias: [
        {
          find: /^@ocs\/common\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/common/$1/src/index.ts")
        },
        {
          find: "@ocs/common",
          replacement: resolve(__dirname, "../../packages/common/src/index.ts")
        },
        {
          find: /^@ocs\/workspace\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/workspace/src/$1/index.ts")
        },
        {
          find: "@ocs/workspace",
          replacement: resolve(__dirname, "../../packages/workspace/src/index.ts")
        },
        {
          find: /^@ocs\/explorer\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/explorer/src/$1/index.ts")
        },
        {
          find: "@ocs/explorer",
          replacement: resolve(__dirname, "../../packages/explorer/src/index.ts")
        },
        {
          find: /^@ocs\/document\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/document/src/$1/index.ts")
        },
        {
          find: "@ocs/document",
          replacement: resolve(__dirname, "../../packages/document/src/index.ts")
        },
        {
          find: /^@ocs\/editor\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/editor/src/$1/index.ts")
        },
        {
          find: "@ocs/editor",
          replacement: resolve(__dirname, "../../packages/editor/src/index.ts")
        },
        {
          find: /^@ocs\/editor-monaco\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/editor-monaco/src/$1/index.ts")
        },
        {
          find: "@ocs/editor-monaco",
          replacement: resolve(__dirname, "../../packages/editor-monaco/src/index.ts")
        },
        {
          find: "@ocs/ui",
          replacement: resolve(__dirname, "../../packages/ui/src/index.ts")
        },
        {
          find: /^@ocs\/terminal\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/terminal/src/$1/index.ts")
        },
        {
          find: "@ocs/terminal",
          replacement: resolve(__dirname, "../../packages/terminal/src/index.ts")
        },
        {
          find: /^@ocs\/git\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/git/src/$1/index.ts")
        },
        {
          find: "@ocs/git",
          replacement: resolve(__dirname, "../../packages/git/src/index.ts")
        },
        {
          find: /^@ocs\/commands\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/commands/src/$1/index.ts")
        },
        {
          find: "@ocs/commands",
          replacement: resolve(__dirname, "../../packages/commands/src/index.ts")
        },
        {
          find: /^@ocs\/search\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/search/src/$1/index.ts")
        },
        {
          find: "@ocs/search",
          replacement: resolve(__dirname, "../../packages/search/src/index.ts")
        },
        {
          find: /^@ocs\/settings\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/settings/src/$1/index.ts")
        },
        {
          find: "@ocs/settings",
          replacement: resolve(__dirname, "../../packages/settings/src/index.ts")
        },
        {
          find: "@ocs/theme",
          replacement: resolve(__dirname, "../../packages/theme/src/index.ts")
        },
        {
          find: "@ocs/notifications",
          replacement: resolve(__dirname, "../../packages/notifications/src/index.ts")
        },
        {
          find: "@ocs/keybindings",
          replacement: resolve(__dirname, "../../packages/keybindings/src/index.ts")
        },
        {
          find: "@ocs/session",
          replacement: resolve(__dirname, "../../packages/session/src/index.ts")
        },
        {
          find: /^@ocs\/extensions\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/extensions/src/$1/index.ts")
        },
        {
          find: "@ocs/extensions",
          replacement: resolve(__dirname, "../../packages/extensions/src/index.ts")
        }
      ]
    },
    build: {
      outDir: "dist/main",
      rollupOptions: {
        external: ["@parcel/watcher"],
        input: {
          index: resolve(__dirname, "src/main/main.ts")
        }
      }
    }
  },
  preload: {
    plugins: [
      externalizeDepsPlugin({
        exclude: WORKSPACE_PACKAGES
      })
    ],
    resolve: {
      alias: [
        {
          find: /^@ocs\/common\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/common/$1/src/index.ts")
        },
        {
          find: "@ocs/common",
          replacement: resolve(__dirname, "../../packages/common/src/index.ts")
        },
        {
          find: /^@ocs\/workspace\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/workspace/src/$1/index.ts")
        },
        {
          find: "@ocs/workspace",
          replacement: resolve(__dirname, "../../packages/workspace/src/index.ts")
        },
        {
          find: /^@ocs\/explorer\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/explorer/src/$1/index.ts")
        },
        {
          find: "@ocs/explorer",
          replacement: resolve(__dirname, "../../packages/explorer/src/index.ts")
        },
        {
          find: /^@ocs\/document\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/document/src/$1/index.ts")
        },
        {
          find: "@ocs/document",
          replacement: resolve(__dirname, "../../packages/document/src/index.ts")
        },
        {
          find: /^@ocs\/editor\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/editor/src/$1/index.ts")
        },
        {
          find: "@ocs/editor",
          replacement: resolve(__dirname, "../../packages/editor/src/index.ts")
        },
        {
          find: /^@ocs\/editor-monaco\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/editor-monaco/src/$1/index.ts")
        },
        {
          find: "@ocs/editor-monaco",
          replacement: resolve(__dirname, "../../packages/editor-monaco/src/index.ts")
        },
        {
          find: "@ocs/ui",
          replacement: resolve(__dirname, "../../packages/ui/src/index.ts")
        },
        {
          find: /^@ocs\/terminal\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/terminal/src/$1/index.ts")
        },
        {
          find: "@ocs/terminal",
          replacement: resolve(__dirname, "../../packages/terminal/src/index.ts")
        },
        {
          find: /^@ocs\/git\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/git/src/$1/index.ts")
        },
        {
          find: "@ocs/git",
          replacement: resolve(__dirname, "../../packages/git/src/index.ts")
        },
        {
          find: /^@ocs\/commands\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/commands/src/$1/index.ts")
        },
        {
          find: "@ocs/commands",
          replacement: resolve(__dirname, "../../packages/commands/src/index.ts")
        },
        {
          find: /^@ocs\/search\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/search/src/$1/index.ts")
        },
        {
          find: "@ocs/search",
          replacement: resolve(__dirname, "../../packages/search/src/index.ts")
        },
        {
          find: /^@ocs\/settings\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/settings/src/$1/index.ts")
        },
        {
          find: "@ocs/settings",
          replacement: resolve(__dirname, "../../packages/settings/src/index.ts")
        },
        {
          find: "@ocs/theme",
          replacement: resolve(__dirname, "../../packages/theme/src/index.ts")
        },
        {
          find: "@ocs/notifications",
          replacement: resolve(__dirname, "../../packages/notifications/src/index.ts")
        },
        {
          find: "@ocs/keybindings",
          replacement: resolve(__dirname, "../../packages/keybindings/src/index.ts")
        },
        {
          find: "@ocs/session",
          replacement: resolve(__dirname, "../../packages/session/src/index.ts")
        },
        {
          find: /^@ocs\/extensions\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/extensions/src/$1/index.ts")
        },
        {
          find: "@ocs/extensions",
          replacement: resolve(__dirname, "../../packages/extensions/src/index.ts")
        }
      ]
    },
    build: {
      outDir: "dist/preload",
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/preload/preload.ts")
        }
      }
    }
  },
  renderer: {
    root: "src/renderer",
    build: {
      outDir: "dist/renderer"
    },
    resolve: {
      alias: [
        {
          find: "@renderer",
          replacement: resolve(__dirname, "src/renderer/src")
        },
        {
          find: /^@ocs\/common\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/common/$1/src/index.ts")
        },
        {
          find: "@ocs/common",
          replacement: resolve(__dirname, "../../packages/common/src/index.ts")
        },
        {
          find: /^@ocs\/workspace\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/workspace/src/$1/index.ts")
        },
        {
          find: "@ocs/workspace",
          replacement: resolve(__dirname, "../../packages/workspace/src/index.ts")
        },
        {
          find: /^@ocs\/explorer\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/explorer/src/$1/index.ts")
        },
        {
          find: "@ocs/explorer",
          replacement: resolve(__dirname, "../../packages/explorer/src/index.ts")
        },
        {
          find: /^@ocs\/document\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/document/src/$1/index.ts")
        },
        {
          find: "@ocs/document",
          replacement: resolve(__dirname, "../../packages/document/src/index.ts")
        },
        {
          find: /^@ocs\/editor\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/editor/src/$1/index.ts")
        },
        {
          find: "@ocs/editor",
          replacement: resolve(__dirname, "../../packages/editor/src/index.ts")
        },
        {
          find: /^@ocs\/editor-monaco\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/editor-monaco/src/$1/index.ts")
        },
        {
          find: "@ocs/editor-monaco",
          replacement: resolve(__dirname, "../../packages/editor-monaco/src/index.ts")
        },
        {
          find: "@ocs/ui",
          replacement: resolve(__dirname, "../../packages/ui/src/index.ts")
        },
        {
          find: /^@ocs\/terminal\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/terminal/src/$1/index.ts")
        },
        {
          find: "@ocs/terminal",
          replacement: resolve(__dirname, "../../packages/terminal/src/index.ts")
        },
        {
          find: /^@ocs\/git\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/git/src/$1/index.ts")
        },
        {
          find: "@ocs/git",
          replacement: resolve(__dirname, "../../packages/git/src/index.ts")
        },
        {
          find: /^@ocs\/commands\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/commands/src/$1/index.ts")
        },
        {
          find: "@ocs/commands",
          replacement: resolve(__dirname, "../../packages/commands/src/index.ts")
        },
        {
          find: /^@ocs\/search\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/search/src/$1/index.ts")
        },
        {
          find: "@ocs/search",
          replacement: resolve(__dirname, "../../packages/search/src/index.ts")
        },
        {
          find: /^@ocs\/settings\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/settings/src/$1/index.ts")
        },
        {
          find: "@ocs/settings",
          replacement: resolve(__dirname, "../../packages/settings/src/index.ts")
        },
        {
          find: "@ocs/theme",
          replacement: resolve(__dirname, "../../packages/theme/src/index.ts")
        },
        {
          find: "@ocs/notifications",
          replacement: resolve(__dirname, "../../packages/notifications/src/index.ts")
        },
        {
          find: "@ocs/keybindings",
          replacement: resolve(__dirname, "../../packages/keybindings/src/index.ts")
        },
        {
          find: "@ocs/session",
          replacement: resolve(__dirname, "../../packages/session/src/index.ts")
        },
        {
          find: /^@ocs\/extensions\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/extensions/src/$1/index.ts")
        },
        {
          find: "@ocs/extensions",
          replacement: resolve(__dirname, "../../packages/extensions/src/index.ts")
        }
      ]
    },
    plugins: [react()]
  }
});
