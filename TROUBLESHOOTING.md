# Troubleshooting

## Install Fails

Run `corepack enable`, then retry `pnpm install`.

If `pnpm install` prompts you to recreate `node_modules`, type `y`. This happens when the hoist settings in `.npmrc` do not match the cached metadata. After confirming, the install will complete cleanly.

## TypeScript Cannot Resolve a Package

Confirm the package has a `src/index.ts` entry point and is listed in `pnpm-workspace.yaml`. Then run `pnpm build` once so the `dist/` directory and `tsconfig.tsbuildinfo` are generated before your editor resolves the paths.

## Architecture Validation Fails

Check for missing package files or forbidden dependencies. Package boundary rules are defined in `scripts/validate-architecture.mjs`. Running `pnpm arch:check` prints each failure with the offending package and file.

## Hooks Do Not Run

Run `pnpm install` again. Husky installs hooks as part of the dependency setup.

## Turbo Cache Produces Stale Output

Force-clear the cache and rebuild:

```sh
pnpm clean
pnpm build
```

To inspect which tasks hit cache vs. were rebuilt, run:

```sh
pnpm graph
```

If remote caching is enabled, set `TURBO_TOKEN` and `TURBO_TEAM` in your environment.

## PNPM Workspace Conflicts

If `pnpm add` fails with a metadata mismatch about the `node_modules` directory, it means the `.npmrc` hoist settings were changed after the last install. Run:

```sh
pnpm install
```

Type `y` when prompted to recreate `node_modules`. Never edit `node_modules` directly.

---

## Windows

- **Line endings**: Ensure your editor and git are configured for LF, not CRLF. Add `.gitattributes` if needed.
- **Long paths**: Enable long path support in Windows: `git config --global core.longpaths true` and enable the Windows group policy for long paths.
- **Electron packaging**: Use `electron-builder` with the `win` target. Ensure you are running as an administrator or have the correct code signing certificate installed.
- **PowerShell scripts**: If `pnpm` scripts fail in PowerShell, try running them in Git Bash or WSL2.

---

## macOS

- **Gatekeeper**: On first launch of the packaged app, right-click → Open to bypass the unidentified developer warning. For distribution, a valid Apple Developer ID and notarization are required.
- **Xcode CLI tools**: If native dependencies fail to compile, run `xcode-select --install`.
- **M1/M2/M3 (Apple Silicon)**: Ensure you are using the arm64 build of Node.js. Run `node -p process.arch` — it should print `arm64`.
- **Electron white flash**: Set `backgroundColor` on `BrowserWindow` to match your app's background color. This is already done in `window-manager.ts`.

---

## Linux

- **Sandbox**: Electron may require `--no-sandbox` on systems without user namespaces. Prefer enabling user namespaces rather than disabling the sandbox.
- **Missing libraries**: Run `ldd dist/linux-unpacked/open-code.studio | grep "not found"` to identify missing shared libraries. Install the listed packages through your package manager.
- **GPU acceleration**: If the renderer is blank, try launching with `--disable-gpu`. This indicates a driver or compositor issue, not a code bug.
- **AppImage permissions**: Make the AppImage executable: `chmod +x Open-Code.Studio-*.AppImage`.

---

## Electron

- **Black window on startup**: This means the renderer is not loading. Open DevTools (`Ctrl+Shift+I` / `Cmd+Option+I`) and check the Console for CSP or module errors.
- **IPC handler not found**: Ensure the handler is registered in `src/main/ipc/handlers.ts` before any `BrowserWindow` is created. IPC handlers registered after `app.whenReady()` may miss early renderer calls.
- **Context bridge error**: If `window.ocs` is `undefined` in the renderer, confirm `contextIsolation: true` and that the preload path in `BrowserWindow.webPreferences.preload` is correct and pointing to the built `dist/preload/index.js`.
- **Hot reload not working**: In dev mode, `electron-vite` uses Vite's HMR for the renderer and restarts Electron on main process changes. If neither is triggering, kill the dev process and restart with `pnpm dev:studio`.
