// Guards against accidental `npm install` in this yarn-managed repo. Running
// npm here doesn't just create a stray package-lock.json (already
// gitignored) — it also rewrites yarn.lock's registry URLs as a side effect
// (registry.yarnpkg.com -> registry.npmjs.org across thousands of lines),
// which has bitten multiple sessions and had to be manually reverted each
// time (`git checkout -- yarn.lock`). Enforcing yarn here removes the need
// to remember that by hand.
//
// Bypass (rare, e.g. CI environments that intentionally use npm for a
// one-off check) with: npm install --ignore-scripts
//
// Safety: this guard is for THIS repo only, it must never run for downstream
// consumers who install @alosha/vue-select as a dependency. Two backstops:
//   1. `scripts/` is excluded from the published tarball (see package.json
//      "files"), and the preinstall command no-ops when this file is absent.
//   2. If it somehow does get shipped, bail out when running from inside a
//      node_modules tree (i.e. installed as a dependency, not the repo root).
if (__dirname.includes('node_modules')) {
  process.exit(0)
}

const userAgent = process.env.npm_config_user_agent || ''

if (!userAgent.startsWith('yarn')) {
  console.error(
    '\n[verify-package-manager] This repo uses yarn (see yarn.lock, .github/workflows/*.yml).\n' +
      '  Please run `yarn install` instead of `npm install`.\n' +
      '  (npm install also rewrites yarn.lock registry URLs as a side effect.)\n' +
      '  If you really need npm for a one-off task, rerun with --ignore-scripts.\n'
  )
  process.exit(1)
}
