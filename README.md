# @alosha/vue-select

> Everything you wish the HTML `<select>` element could do, wrapped up into a lightweight, zero dependency, extensible Vue component.

`@alosha/vue-select` is a feature rich select/dropdown/typeahead component. It provides a default template that fits most use cases for a filterable select dropdown.

Customizable with slots and SCSS variables. Zero dependencies.

## Get started

Requires Vue 3.2.0 or later in the Vue 3 series. Both ESM and UMD builds
are smoke-tested against Vue 3.2.0.

Install the package via npm or yarn:

```bash
# Using npm
npm install @alosha/vue-select

# Using yarn
yarn add @alosha/vue-select
```

Then, import and register the component:

```ts
// main.ts or main.js
import { createApp } from "vue";
import App from "./App.vue";
import VueSelect from "@alosha/vue-select";

createApp(App)
  .component("v-select", VueSelect)
  .mount("#app");
```

The component itself does not include any CSS by default. You will need to include it separately inside your setup or component file:

```vue
<style>
@import "@alosha/vue-select/dist/vue-select.css";
</style>
```

## Usage examples

### Basic usage

Bind an array of options and track the selection with `v-model`:

```vue
<script setup>
import { ref } from "vue";

const selected = ref(null);
const options = ["Canada", "United States", "Mexico"];
</script>

<template>
  <v-select v-model="selected" :options="options" placeholder="Pick a country" />
</template>
```

### Options as objects (`label` + `reduce`)

When your options are objects, `label` tells the component which key to display, and `reduce` lets you store just the value you care about in `v-model` instead of the whole object:

```vue
<script setup>
import { ref } from "vue";

const country = ref("CA");
const options = [
  { code: "CA", name: "Canada" },
  { code: "US", name: "United States" },
  { code: "MX", name: "Mexico" }
];
</script>

<template>
  <v-select
    v-model="country"
    :options="options"
    label="name"
    :reduce="(option) => option.code"
  />
</template>
```

### Multiple selection with tagging

Set `multiple` to select several options, and `taggable` (plus `push-tags`) to let users create new options on the fly:

```vue
<script setup>
import { ref } from "vue";

const tags = ref(["vue"]);
const options = ref(["vue", "typescript", "vite"]);
</script>

<template>
  <v-select
    v-model="tags"
    :options="options"
    multiple
    taggable
    push-tags
    placeholder="Add tags"
  />
</template>
```

### Grouped options and large lists

Pass groups as `{ label, options }` objects. With `reduce`, a selected
child's ID can stay in `v-model` while the component displays its label,
even when the current search hides that child.

For very large lists with fixed-height rows, enable the experimental
`virtual-scroll` prop and set `virtual-scroll-row-height` to the rendered
row height in pixels. With autoscroll enabled, keyboard navigation brings the
active row into view, including across virtual windows.

See the [project site](https://vue-select.alosha.dev/) and the
[changelog](https://github.com/avlisodraude/vue-select/blob/main/CHANGELOG.md)
for compatibility and upgrade details.

## License

MIT
