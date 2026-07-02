# vue-select ![Current Release](https://img.shields.io/github/release/sagalbot/vue-select.svg?style=flat-square) ![Release Date](https://img.shields.io/github/release-date/sagalbot/vue-select?style=flat-square) ![Bundle Size](https://flat.badgen.net/bundlephobia/min/vue-select) ![Monthly Downloads](https://img.shields.io/npm/dm/vue-select.svg?style=flat-square) [![Coverage Status](https://coveralls.io/repos/github/sagalbot/vue-select/badge.svg?branch=master)](https://coveralls.io/github/sagalbot/vue-select?branch=master) ![MIT License](https://img.shields.io/github/license/sagalbot/vue-select.svg?style=flat-square)

> **Everything you wish the HTML `<select>` element could do, wrapped up into a lightweight, zero
> dependency, extensible Vue component.**

Vue Select is a feature rich select/dropdown/typeahead component. It provides a default
template that fits most use cases for a filterable select dropdown. The component is designed to be as
lightweight as possible, while maintaining high standards for accessibility,
developer experience, and customization.

- Tagging
- Filtering / Searching
- Vuex Support
- AJAX Support
- SSR Support
- Accessible
- ~20kb Total / ~5kb CSS / ~15kb JS
- Select Single/Multiple Options
- Customizable with slots and SCSS variables
- Zero dependencies

## Documentation

Complete documentation and examples available at https://vue-select.org.

- **[API Documentation](https://vue-select.org)**
- **[CodePen Template](http://codepen.io/sagalbot/pen/NpwrQO)**

## Sponsors :tada:

It takes a lot of effort to maintain this project. If it has saved you development time, please consider [sponsoring the project](https://github.com/sponsors/sagalbot)
with GitHub sponsors!

Huge thanks to the [sponsors](https://github.com/sponsors/sagalbot) and [contributors](https://github.com/sagalbot/vue-select/graphs/contributors) that make Vue Select possible!

## Install

```bash
yarn add vue-select

# or use npm

npm install vue-select
```

Then, import and register the component:

```js
import Vue from "vue";
import vSelect from "vue-select";

Vue.component("v-select", vSelect);
```

The component itself does not include any CSS. You'll need to include it separately:

```js
import "vue-select/dist/vue-select.css";
```

Alternatively, you can import the scss for complete control of the component styles:

```scss
@import "vue-select/src/scss/vue-select.scss";
```

You can also include vue-select directly in the browser. Check out the
[documentation for loading from CDN.](https://vue-select.org/guide/install.html#in-the-browser).

## Customization

Vue Select uses scoped slots for total control over the presentation layer. Full documentation
lives at [vue-select.org](https://vue-select.org/api/slots.html); a few recent additions are shown
below.

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

## License

[MIT](https://github.com/sagalbot/vue-select/blob/master/LICENSE.md)
