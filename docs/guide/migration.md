# Migrating from v3 (Vue 2) to v4 (Vue 3)

Vue Select `4.x` is the Vue 3 line. If you already know the Vue 2 version (`3.x`), this guide
covers **only what changed** — you can skip anything not mentioned, because it still works the way
it always has.

::: tip Upgrading within v2/v3?
If you're still on Vue 2 and moving from vue-select `2.x` to `3.x`, you want the
[2.x → 3.x upgrade notes](./upgrading.md) instead. This page is specifically about the Vue 2 → Vue 3
(`3.x` → `4.x`) jump.
:::

## TL;DR

- **The public prop/event/slot API is unchanged.** The big internal refactor in this line did not
  touch the API surface. `v-model`, `options`, `label`, `reduce`, `multiple`, `@search`, `@option:*`,
  every slot — all identical to `3.x`.
- **Vue 3 is now a peer dependency.** You install `@alosha/vue-select` `4.x` (this fork's package
  name — see the note on package naming below) and register it with `createApp` instead of the
  global `Vue` object.
- **A few accessibility behaviors changed** (focus handling, ARIA roles/attributes). These are the
  only runtime differences most apps will notice, and only if you assert on them in tests or custom
  focus logic.
- **Tooling moved to Vite/Vitest** — relevant only if you build from source or contribute.

## Installation & registration

The only required code change for a typical app is how you register the component. Vue 3 removed the
global `Vue` object, so the `Vue.component()` call becomes a `createApp(...).component()` call.

```bash
# Vue 2 → original vue-select 3.x
yarn add vue-select

# Vue 3 → this fork, @alosha/vue-select 4.x
yarn add @alosha/vue-select
```

```js
// v3 (Vue 2, original package)
import Vue from 'vue'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

Vue.component('v-select', vSelect)
```

```js
// v4 (Vue 3, this fork)
import { createApp } from 'vue'
import vSelect from '@alosha/vue-select'
import '@alosha/vue-select/dist/vue-select.css'
import App from './App.vue'

const app = createApp(App)
app.component('v-select', vSelect)
app.mount('#app')
```

> **Why `@alosha/vue-select` and not `vue-select@4`?** This fork publishes under a new scoped
> package name rather than the original unscoped `vue-select`, since that name is owned by the
> original maintainer and this project doesn't have publish rights to it. The component itself,
> its API, and its behavior continue directly from the original v4 beta line — only the npm
> package identity differs.

The CSS import is unchanged. As before, you can import the SCSS source
(`@alosha/vue-select/src/scss/vue-select.scss`) instead if you want to drive it with your own
variables.

## The public API is intentionally unchanged

This line rebuilt how the component manages its selection state internally: it moved from mutating an
internal copy of the value to a **controlled-component pattern**, where the parent's `v-model` is the
single source of truth and the component asks the parent to update it.

**This is an internal change. It does not change the public API.** Every prop, event, and slot keeps
the same name, arguments, and semantics as `3.x`. You do not need to touch your `<v-select>` usage
because of it.

The one thing worth knowing: because selection is now strictly controlled, the component renders
exactly what your `v-model` says at all times. If you were relying on the component holding on to a
selection that your bound value contradicted, it will now reflect the bound value. In practice this
matches how `3.x` already behaved for the overwhelming majority of apps — it's called out here only
for completeness.

## Accessibility & focus behavior changes

The accessibility overhaul is the one area with visible **runtime behavior** changes. The component
now follows the current WAI-ARIA APG combobox pattern (ARIA 1.2). If you have integration tests that
assert on ARIA attributes or on where focus lands, read this section carefully — these are the
changes most likely to require a small test update.

### `role="combobox"` moved onto the search input

Under ARIA 1.2, the combobox role belongs on the text input itself, which owns
`aria-expanded` / `aria-controls` / `aria-activedescendant`. The older ARIA 1.1 "compound widget"
pattern that split the role across a wrapper element has been retired.

```html
<!-- what the search input now renders as -->
<input role="combobox" aria-expanded="…" aria-controls="…" aria-activedescendant="…" />
```

If a test queried the combobox by role and expected it on the wrapper, point it at the input.

### Escape and selecting an option no longer blur the input

Per the combobox pattern, choosing an option (or pressing <kbd>Escape</kbd> to close the popup)
closes the dropdown but **leaves DOM focus on the search input**. Previously these actions blurred
the input.

This is what makes keyboard flow feel right — you can immediately keep typing or reopen — but it
means:

- Tests asserting the input is blurred after selection/Escape need updating.
- If you had custom `@blur`/`@search:blur` logic wired to "the user picked something," move it to the
  relevant `@option:*` or `@search` event instead.

### `aria-selected` now reflects real selection, not the highlight

`aria-selected="true"` is now applied to the option(s) that are **actually selected**, not to the
option currently highlighted by keyboard navigation. The keyboard highlight is conveyed separately
(via `aria-activedescendant` on the input and the `vs__dropdown-option--highlight` class), which is
the correct division under the spec. A test that read the highlighted row's `aria-selected` should
read the highlight class (or `aria-activedescendant`) instead.

## Tooling (only if you build from source)

The library's own build and test stack moved to the Vue 3 ecosystem. This affects contributors and
anyone building vue-select from source — **not** apps that consume the published package.

- **Build:** Vite (was rollup/webpack).
- **Tests:** Vitest (was Jest). Run them with `yarn test`.
- **Peer dependency:** Vue `^3`. There is no `@vue/composition-api` shim and no Vue 2 fallback in
  this line — use vue-select `3.x` if you're still on Vue 2.
- **`@vue/compat`:** the package forces Vue 3 mode when run under the migration build, so a
  half-migrated app won't accidentally load it in Vue 2 mode.

## First-party TypeScript types

vue-select `4.x` ships its own type declarations (`dist/vue-select.d.ts`), resolved with zero config
through the package's `types`/`exports` fields. **Uninstall the community `@types/vue-select`
package** — it will shadow the bundled, accurate types.

```bash
yarn remove @types/vue-select
```

See the [README](../../README.md#typescript) for the exported type names
(`VueSelectProps`, `VueSelectInstance`, `VueSelectOption`, …).

## What did **not** change

To be explicit, none of these needed touching for the Vue 3 jump:

- `v-model`, `options`, `label`, `reduce`, `getOptionLabel`, `multiple`, `taggable`, `filterable`,
  `selectable`, `calculatePosition`, `dropdownShouldOpen`, and the rest of the props.
- The `@search`, `@open`, `@close`, and `@option:*` events (including `@search` still firing on an
  empty search string, as introduced in `3.x`).
- Every slot — `option`, `selected-option`, `selected-option-container`, `open-indicator`,
  `spinner`, `no-options`, `list-header`, `list-footer`, and the newer `clear` / `deselect` slots.
- The `vs__` CSS class prefix and all SCSS variables.
