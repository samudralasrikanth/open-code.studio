import { resolve } from "path";

import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

/**
 * Workspace packages that should be BUNDLED into the main process (not
 * externalized) because they are TypeScript source-only and don't have a
 * built CJS dist that Electron can require() at runtime.
 */
const WORKSPACE_PACKAGES = ["@ocs/common", "@ocs/workspace", "@ocs/explorer"];

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
          replacement: resolve(__dirname, "../../packages/workspace/$1/src/index.ts")
        },
        {
          find: "@ocs/workspace",
          replacement: resolve(__dirname, "../../packages/workspace/src/index.ts")
        },
        {
          find: /^@ocs\/explorer\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/explorer/$1/src/index.ts")
        },
        {
          find: "@ocs/explorer",
          replacement: resolve(__dirname, "../../packages/explorer/src/index.ts")
        }
      ]
    },
    build: {
      outDir: "dist/main",
      rollupOptions: {
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
          replacement: resolve(__dirname, "../../packages/workspace/$1/src/index.ts")
        },
        {
          find: "@ocs/workspace",
          replacement: resolve(__dirname, "../../packages/workspace/src/index.ts")
        },
        {
          find: /^@ocs\/explorer\/(.*)$/,
          replacement: resolve(__dirname, "../../packages/explorer/$1/src/index.ts")
        },
        {
          find: "@ocs/explorer",
          replacement: resolve(__dirname, "../../packages/explorer/src/index.ts")
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
      alias: {
        "@renderer": resolve(__dirname, "src/renderer/src")
      }
    },
    plugins: [react()]
  }
});
