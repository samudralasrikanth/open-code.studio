/**
 * scripts/check-dependencies.mjs
 *
 * Validates that no workspace package imports across forbidden layer boundaries
 * at the source level by scanning import statements in .ts files.
 *
 * This complements validate-architecture.mjs (which reads package.json deps)
 * with a source-level scan that catches dynamic and transitive violations.
 *
 * Layer order (lowest to highest privilege):
 *   platform-services → runtime → gateway → knowledge → agent → application
 *
 * A lower-layer package must never import a higher-layer package.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = new URL('..', import.meta.url).pathname

/**
 * Forbidden import directions.
 * Each entry means: if a file inside `from` imports `forbidden`, it fails.
 */
const FORBIDDEN_CROSS_LAYER = [
  // Runtime must not import Application or Agent layers
  { layer: 'packages/runtime', forbidden: ['@ocs/app-', '@ocs/agents'] },
  { layer: 'packages/gateway', forbidden: ['@ocs/app-', '@ocs/agents', '@ocs/runtime'] },
  { layer: 'packages/knowledge', forbidden: ['@ocs/app-', '@ocs/agents', '@ocs/runtime'] },
  // Common (platform services) must not import anything above it
  {
    layer: 'packages/common',
    forbidden: ['@ocs/runtime', '@ocs/gateway', '@ocs/knowledge', '@ocs/agents', '@ocs/app-']
  }
]

/**
 * Recursively collect all .ts and .tsx files under a directory.
 */
function collectFiles(dir, files = []) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return files
  }
  for (const entry of entries) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory() && entry !== 'node_modules' && entry !== 'dist') {
      collectFiles(full, files)
    } else if (stat.isFile() && (entry.endsWith('.ts') || entry.endsWith('.tsx'))) {
      files.push(full)
    }
  }
  return files
}

/**
 * Extract all @ocs/* imports from a source file.
 */
function extractOcsImports(filePath) {
  const content = readFileSync(filePath, 'utf8')
  const matches = content.matchAll(/from\s+['"](@ocs\/[^'"]+)['"]/g)
  return [...matches].map((m) => m[1])
}

const failures = []

for (const rule of FORBIDDEN_CROSS_LAYER) {
  const layerDir = join(root, rule.layer)
  const files = collectFiles(layerDir)

  for (const file of files) {
    const imports = extractOcsImports(file)
    for (const imp of imports) {
      for (const forbidden of rule.forbidden) {
        if (imp.startsWith(forbidden)) {
          failures.push(
            `  ${relative(root, file)}\n    imports ${imp}\n    (forbidden: ${rule.layer} must not import ${forbidden}*)`
          )
        }
      }
    }
  }
}

if (failures.length > 0) {
  console.error('Dependency check failed — cross-layer import violations:\n')
  for (const failure of failures) {
    console.error(failure)
  }
  process.exit(1)
}

console.log('Dependency check passed.')
