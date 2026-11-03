## Pull Requests 

Looks like you want to help out on vue-select.. awesome! Here's a few things to keep in mind when contributing.

- Vue Select uses semantic release to automate the release process. This means that good commit
 messages are critical. If you're unfamiliar with [conventional changelog](https://github.com/ajoslin/conventional-changelog) you can run `yarn commit` to generate a commit message.
- It's almost always better to ask before you jump into a PR if you want to add new functionality
. It's not fun for anyone when you spend time on something that doesn't end up in the component. 
- If your PR fixes or references an open issue, be sure to reference it in your message.
- If you're adding new functionality, make sure your code has good test coverage.

## Local checks

Install dependencies with `yarn install --frozen-lockfile`. Run
`yarn lint:check`, `yarn coverage`, `yarn typecheck`, `yarn typecheck:types`,
and `yarn typecheck:config` from the repository root.

For the Chromium suite, use Node 22 and run:

```sh
yarn --cwd tests/browser install --frozen-lockfile
yarn --cwd tests/browser playwright install chromium
yarn test:browser
```

The browser command builds the library first. The suite tests virtual-scroll
layout and runs both package entry points against the minimum supported Vue runtime.

:tada: Thanks for contributing, and an even bigger thanks for reading these guidelines! 
