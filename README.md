# @alosha/vue-select ![Current Release](https://img.shields.io/github/package-json/v/avlisodraude/vue-select?style=flat-square) ![Release Date](https://img.shields.io/github/release-date/avlisodraude/vue-select?style=flat-square) ![Bundle Size](https://flat.badgen.net/bundlephobia/min/@alosha/vue-select) ![Monthly Downloads](https://img.shields.io/npm/dm/@alosha/vue-select.svg?style=flat-square) ![MIT License](https://img.shields.io/github/license/avlisodraude/vue-select.svg?style=flat-square)

> A maintained Vue 3 fork of [sagalbot/vue-select](https://github.com/sagalbot/vue-select) — the
> original Vue 3 line had been stuck on a beta tag since late 2022. This fork fixes the outstanding
> crashes, ships a controlled-component refactor, a full accessibility pass, floating-ui positioning,
> and native TypeScript types, and cuts it as a real `4.0.0` stable release. Full MIT attribution to
> the original author is preserved — see [CHANGELOG.md](./CHANGELOG.md) for what changed and why.

> **Everything you wish the HTML `<select>` element could do, wrapped up into a lightweight, zero
> dependency, extensible Vue component.**

Vue Select is a feature rich select/dropdown/typeahead component. It provides a default
template that fits most use cases for a filterable select dropdown. The component is designed to be as
lightweight as possible, while maintaining high standards for accessibility,
developer experience, and customization.

- Tagging
- Filtering / Searching
- Grouped options
- Vuex Support
- AJAX Support
- SSR Support
- Accessible (WAI-ARIA 1.2 combobox)
- First-party TypeScript types (no `@types/vue-select` needed)
- ~20kb Total / ~5kb CSS / ~15kb JS
- Select Single/Multiple Options
- Customizable with slots and SCSS variables
- Zero dependencies

> **Using Vue 2?** This is the Vue 3 line (`4.x`). For Vue 2, install the original `vue-select@3.x`
> from [sagalbot/vue-select](https://github.com/sagalbot/vue-select). Coming from that Vue 2 version?
> See the [v3 → v4 migration guide](./docs/guide/migration.md) — the public API is unchanged; only
> registration and a few accessibility behaviors differ.

## Documentation

Full guides live in [`docs/guide`](./docs/guide) in this repo (a hosted docs site is on the roadmap).

- **[Install & registration](./docs/guide/install.md)**
- **[v3 → v4 migration guide](./docs/guide/migration.md)**
- **[Vue 3 starter template](#vue-3-starter-template)** (see below)

## Credits

This fork builds directly on the work of [Jeff Sagal](https://github.com/sagalbot) and every
[contributor to the original project](https://github.com/sagalbot/vue-select/graphs/contributors) —
if the original component has saved you development time over the years, consider
[sponsoring Jeff](https://github.com/sponsors/sagalbot).

## Install

```bash
# Vue 3 (this line):
yarn add @alosha/vue-select

# or use npm
npm install @alosha/vue-select
```

Then, import and register the component. Vue 3 removed the global `Vue` object, so registration
happens on the app instance:

```js
import { createApp } from "vue";
import vSelect from "@alosha/vue-select";
import "@alosha/vue-select/dist/vue-select.css";
import App from "./App.vue";

const app = createApp(App);
app.component("v-select", vSelect);
app.mount("#app");
```

The component itself does not include any CSS. You'll need to include it separately:

```js
import "@alosha/vue-select/dist/vue-select.css";
```

Alternatively, you can import the scss for complete control of the component styles:

```scss
@import "@alosha/vue-select/src/scss/vue-select.scss";
```

You can also include vue-select directly in the browser. Check out the
[documentation for loading from CDN.](./docs/guide/install.md#in-the-browser).

## TypeScript

vue-select ships **first-party type declarations** (`dist/vue-select.d.ts`). They resolve with zero
configuration through the package's `types`/`exports` fields — nothing to install, nothing to point
at.

> **Remove the community `@types/vue-select` package if you have it.** It is no longer needed, and it
> will shadow the accurate, bundled types:
>
> ```bash
> yarn remove @types/vue-select
> ```

The main exported types:

```ts
import type {
  VueSelectProps, // the full public props interface
  VueSelectInstance, // the component instance (what a template ref resolves to)
  VueSelectOption, // string | number | Record<string, any>
} from "@alosha/vue-select";
```

`VueSelectInstance` is handy for typing a template ref so the exposed methods below are typed:

```ts
import { ref } from "vue";
import type { VueSelectInstance } from "@alosha/vue-select";

const select = ref<VueSelectInstance>();
// select.value?.openDropdown()
```

## Grouped options

The `options` prop accepts **groups** alongside plain options. A group is an object with a `label`
and a nested `options` array:

```vue
<v-select
  :options="[
    { label: 'Canada', code: 'ca' },
    {
      label: 'Europe',
      options: [
        { label: 'France', code: 'fr' },
        { label: 'Germany', code: 'de' },
      ],
    },
  ]"
/>
```

- Group headers render as non-selectable, non-highlightable rows (`role=\"presentation\"`).
- Searching filters options **within** each group; a group whose children all filter out is hidden
  entirely.
- Flat options and groups can be mixed freely in the same `options` array.

## Customization

Vue Select uses scoped slots for total control over the presentation layer. A few recent additions
are shown below.

### `clear` slot

Customize the clear ("×") button rendered in the actions area of a single select. Follows the same
convention as the `open-indicator` and `spinner` slots. The slot receives `attributes` (bind them to
your button to keep the default class, `ref`, disabled state and click handler), a `canClear` boolean
(true when the clear button would normally show), and a `clearSelection` function.

```vue
<v-select :options="['one', 'two', 'three']" v-model="value">
  <template #clear="{ canClear, clearSelection }">
    <button v-show="canClear" type="button" title="Clear" @click="clearSelection">
      ✕
    </button>
  </template>
</v-select>
```

### `deselect` slot

Customize the per-item deselect control shown on each selected tag in `multiple` mode. Vue Select
still renders the accessible `<button>` wrapper (with its label, disabled state and click handler) —
the slot replaces its *contents*, so you usually only need to swap the icon. The slot receives the
`option`, a pre-bound `deselect` function for that option, and the `disabled` state.

```vue
<v-select multiple :options="['one', 'two', 'three']" v-model="values">
  <template #deselect="{ option }">
    <span aria-hidden="true">×</span>
  </template>
</v-select>
```

### Controlling the dropdown via a template ref

The following methods are part of the public instance API and can be called through a
[template ref](https://vuejs.org/guide/essentials/template-refs.html) to control the dropdown from a
parent component:

- `openDropdown()` — open the dropdown (no-op while `disabled`).
- `closeDropdown()` — close the dropdown.
- `toggleDropdown()` — toggle the dropdown (call with no argument).

`openDropdown`/`closeDropdown` are named that way rather than `open`/`close` because `open` is already
the component's internal state flag.

```vue
<template>
  <v-select ref="select" :options="['one', 'two', 'three']" />
  <button @click="$refs.select.openDropdown()">Open</button>
  <button @click="$refs.select.closeDropdown()">Close</button>
  <button @click="$refs.select.toggleDropdown()">Toggle</button>
</template>
```

### `option` slot — `slotProps.option`

The `option` slot receives the current option and can be used to render custom dropdown rows. Read
the option through **`slotProps.option`** — it is the *original* option, passed by reference:

```vue
<v-select :options="people" label="name">
  <template #option="{ option }">
    <!-- option is the same object/instance you passed in -->
    {{ option.displayName /* getter still works */ }}
  </template>
</v-select>
```

This matters when your options are **class instances** (or otherwise carry getters or rely on object
identity). `v-bind`-ing the slot spread alone would clone a reactive option into a plain object,
stripping its prototype/getters and breaking `===` identity. `slotProps.option` preserves both, so
class-instance options keep their identity and getters intact. Prefer it over the spread props when
your options are anything richer than plain data.

### Customizing the whole selected value area

There is no dedicated slot to replace the selected value *and* its clear button together — use the
pre-existing `selected-option-container` slot, which wraps each selected option and lets you take full control of that region (e.g. to hide the
per-item deselect button). Use the `selected-option` slot instead if you only want to change the text.

### Virtual scrolling (experimental)

For very large option lists you can opt into DOM windowing so only the visible rows are rendered:

```vue
<v-select :options="thousandsOfOptions" virtual-scroll :virtual-scroll-row-height="40" />
```

> ⚠️ **Experimental.** `virtualScroll` is foundation-only: it assumes a **fixed** row height
> (`virtualScrollRowHeight`, default `40`) and does not yet handle variable-height rows, grouped
> options, or perfect keyboard-autoscroll alignment. Enable it only for large lists, and verify it
> behaves for your use case before relying on it.

## Migrating from the Vue 2 version (v3 → v4)

The public prop/event/slot API is **unchanged** from `3.x`. The differences are Vue 3 registration
(`createApp`) and a handful of accessibility behaviors. See the full
**[v3 → v4 migration guide](./docs/guide/migration.md)**.

## Vue 3 starter template

A minimal, self-contained page you can drop into [CodePen](https://codepen.io/pen/) (or any HTML
file) — current Vue 3 best practice using `createApp` and the browser (UMD) build:

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://unpkg.com/vue@3"></script>
    <script src="https://unpkg.com/@alosha/vue-select"></script>
    <link rel="stylesheet" href="https://unpkg.com/@alosha/vue-select/dist/vue-select.css" />
  </head>
  <body>
    <div id="app" style="max-width: 20rem; margin: 4rem auto">
      <v-select v-model="selected" :options="options"></v-select>
      <p>Selected: {{ selected }}</p>
    </div>

    <script>
      const { createApp, ref } = Vue;

      createApp({
        setup() {
          const selected = ref(null);
          const options = ref(["Canada", "United States", "Mexico"]);
          return { selected, options };
        },
      })
        // the UMD build registers the component under the window["vue-select"] global
        .component("v-select", window["vue-select"])
        .mount("#app");
    </script>
  </body>
</html>
```

## License

[MIT](./LICENSE.md)
