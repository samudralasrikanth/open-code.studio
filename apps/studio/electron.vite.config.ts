import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

/**
 * Workspace packages that should be BUNDLED into the main process (not
 * externalized) because they are TypeScript source-only and don't have a
 * built CJS dist that Electron can require() at runtime.
 */
const WORKSPACE_PACKAGES = ['@ocs/common']

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        exclude: WORKSPACE_PACKAGES
      })
    ],
    resolve: {
      alias: {
        '@ocs/common': resolve(__dirname, '../../packages/common/src/index.ts')
      }
    },
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/main.ts')
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
      alias: {
        '@ocs/common': resolve(__dirname, '../../packages/common/src/index.ts')
      }
    },
    build: {
      outDir: 'dist/preload',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/preload.ts')
        }
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    build: {
      outDir: 'dist/renderer'
    },
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
