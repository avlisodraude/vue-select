// Copies the hand-authored type declarations (types/vue-select.d.ts, the
// source of truth) into dist/ so they ship with the published package. Run
// as the final step of `npm run build`, after `vite build` has produced the
// dist/ directory.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const src = join(rootDir, 'types', 'vue-select.d.ts')
const destDir = join(rootDir, 'dist')
const dest = join(destDir, 'vue-select.d.ts')

if (!existsSync(destDir)) {
  mkdirSync(destDir, { recursive: true })
}

copyFileSync(src, dest)

console.log(`[copy-dts] ${src} -> ${dest}`)
