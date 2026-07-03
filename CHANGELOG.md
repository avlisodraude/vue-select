# Changelog

## [4.0.0] — 2026-07-03

The first stable release of the Vue 3 line, published as `@alosha/vue-select`. This is a
community-maintained fork of [sagalbot/vue-select](https://github.com/sagalbot/vue-select) `4.x`,
which had been stuck on a beta npm tag since November 2022. The public prop/event/slot API is
**unchanged** from the `3.x` (Vue 2) line — see [`docs/guide/migration.md`](docs/guide/migration.md)
for the full v3 → v4 guide.

### Breaking Changes

- **Package renamed to `@alosha/vue-select`.** The original `vue-select` name on npm is owned by
  the upstream maintainer; this fork does not have publish rights to it. If you were tracking
  `vue-select@beta`, switch to `@alosha/vue-select@^4.0.0`. Nothing else about the install/import
  pattern changes beyond the package specifier.
- **Accessibility/focus behavior changed** to follow the WAI-ARIA 1.2 combobox authoring pattern:
  - `role="combobox"` and `aria-expanded` moved from the dropdown-toggle wrapper onto the search
    `<input>` itself.
  - Selecting an option or pressing <kbd>Escape</kbd> no longer blurs the search input — the
    dropdown closes but keyboard focus stays put, matching the spec. Code or tests relying on a
    blur after selection/Escape need updating.
  - `aria-selected` now reflects actual selection state, not the keyboard-highlighted option
    (which is conveyed via `aria-activedescendant` instead).
  
  None of this changes props, events, or slots — see the migration guide for details.

### New Features

- **Grouped options** (#1870): the `options` prop now accepts `{ label, options: [...] }` group
  objects. Group headers are non-selectable/non-highlightable, and search filters within each
  group.
- **`clear` slot** (#1871): customize the clear ("×") button on single selects.
- **`deselect` slot**: customize the per-tag deselect control in multi-select mode.
- **`openDropdown()` / `closeDropdown()` / `toggleDropdown()`** (#1860) exposed on the public
  component instance, so a parent can control the dropdown via a template ref.
- **Native TypeScript types**: hand-authored `dist/vue-select.d.ts`, resolved automatically via
  `package.json`'s `types`/`exports` fields. The community `@types/vue-select` package is no
  longer needed and should be removed if installed — it will shadow the more accurate bundled
  types.
- **Experimental opt-in virtual scrolling**: a `virtual-scroll` / `virtual-scroll-row-height` prop
  pair for windowing very large option lists. Foundation-only (fixed row height, no grouped-option
  support yet) — flagged as experimental in the docs.
- **Positioning now uses `@floating-ui/dom`** instead of Popper.js, which the library's own
  `calculatePosition` default never actually depended on in the first place (Popper was only ever
  a docs-site dependency). The Popper.js dependency has been removed entirely.

### Fixes

- **#1854** — a Chrome 130+ behavior change (keyboard-focusable scrollers) could close the dropdown
  when focus moved into its own scrollable menu. Blurs whose `relatedTarget` lands inside the
  dropdown menu no longer close it.
- **#1869** — `Cannot read properties of null (reading 'blur'/'focus'/'value')` crash when a custom
  `search` slot's input didn't match the default `[type=search]` selector. All call sites that read
  the resolved search element are now null-safe.
- **#1857** — passing a class-instance `option` through the `option`/`selected-option` slots'
  `v-bind` spread silently cloned it into a plain object, stripping getters and identity. Both
  slots now also expose the untouched reference directly as `slotProps.option`, and
  `getOptionLabel`'s default no longer requires an own (non-inherited) property.
- **#1866** — investigated and **not reproducible** in this line. The original report was filed
  against `vue-select@3.20.4` on Vue 2, and traces to a Vuetify `$vuetify.rtl` collision (Vuetify
  also registers a global `v-select`), not to this component. No code change made; flagged
  upstream.

### Performance

- **#1868** — dropdown hover/highlight was re-scanning every option on every hover regardless of
  list length. Pointer-independent per-option state is now cached in a computed, with an O(1) Set
  lookup for selection state, making hover cost independent of option count.
- Gzip bundle size: **7.42 KiB (ES)** / **6.56 KiB (UMD)** / **1.82 KiB (CSS)** — up from the
  pre-plan baseline of 6.54 KiB (ES) due to grouping, virtual-scroll groundwork, and the new
  slots/methods, still within the project's 8 KB budget.

### Internal

- **State management refactor**: selection state now follows a proper controlled-component
  pattern. Uncontrolled usage keeps one internal `data()` field; controlled usage (with or without
  a custom `reduce`) derives its value from `modelValue`/`options` via a pure computed instead of
  watcher-driven mutation. No public API change.
- Build/test tooling already used Vite/Vitest before this plan began (confirmed against git blame;
  the maintainer's original Webpack→Vite migration predates this fork).
- Test suite expanded from 176 to 246 tests across 24 files, closing coverage gaps in
  `appendToBody.js`, `pointerScroll.js`, and previously-uncalled `Select.vue` branches.
- Repo hygiene: enforced `yarn` as the committed package manager via a `preinstall` guard (plain
  `npm install` now fails with a pointer to `yarn install`); `.claude/` gitignored.

### Known issues (carried forward, not fixed in this release)

- The README's SCSS-import instructions (`@alosha/vue-select/src/scss/vue-select.scss`) reference
  a path that isn't included in the published npm tarball (`package.json`'s `files` field is
  `["dist"]` only) — inherited from the upstream docs, not introduced by this fork. Needs either a
  `files` change or a docs correction in a follow-up patch.
- `pointerScroll.js`'s scroll-to-highlighted-option logic indexes rendered DOM children directly,
  which silently no-ops once `virtualScroll` is enabled and the highlighted option is outside the
  rendered window. Pre-existing limitation of the experimental virtualization groundwork.
- A narrow staleness window was found (not fixed) in the controlled-value computed's tie-break
  state (`_lastResolvedValue`) on the very first evaluation after mount, before `created()` runs.
  Worked around in tests; flagged for a dedicated look.
