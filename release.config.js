const { createRequire } = require('node:module')
const releaseRequire = createRequire(require.resolve('./scripts/release/package.json'))

module.exports = {
  branches: ['main', 'next'],
  plugins: [
    releaseRequire.resolve('@semantic-release/npm'),
    releaseRequire.resolve('@semantic-release/commit-analyzer'),
    releaseRequire.resolve('@semantic-release/release-notes-generator'),
    [
      releaseRequire.resolve('@semantic-release/github'),
      {
        assets: ['dist/**'],
        failComment: false,
      },
    ],
    [
      releaseRequire.resolve('@semantic-release/git'),
      {
        assets: ['package.json'],
        message: 'chore(🚀): ${nextRelease.version}',
      },
    ],
  ],
}
