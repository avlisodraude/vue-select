## Yarn / NPM

Install with yarn or npm:

```bash
# vue 2
yarn add vue-select

# vue 3
yarn add vue-select@beta

# or, using NPM
npm install vue-select
```

Then, import and register the component. On Vue 3 (vue-select `4.x`), register it on the app
instance created by `createApp`:

```js
import { createApp } from 'vue'
import vSelect from 'vue-select'
import App from './App.vue'

const app = createApp(App)
app.component('v-select', vSelect)
app.mount('#app')
```

The component itself does not include any CSS. You'll need to include it separately:

```js
import 'vue-select/dist/vue-select.css';
```

## In the Browser

vue-select ships as a UMD module that is accessible in the browser. When loaded
this way it registers itself on the `window['vue-select']` global. You'll need to load Vue 3,
vue-select JS & vue-select CSS.

```html
<!-- include Vue 3 first -->
<script src="https://unpkg.com/vue@3"></script>

<!-- the Vue 3 (beta) vue-select release -->
<script src="https://unpkg.com/vue-select@beta"></script>
<link rel="stylesheet" href="https://unpkg.com/vue-select@beta/dist/vue-select.css">
```

Then create your app and register the component from the global:

```js
Vue.createApp({
  /* ... */
})
  .component('v-select', window['vue-select'])
  .mount('#app')
```

## Vue Compatibility

- Vue `2.x`, use vue-select `3.x`.
- Vue `3.x`, use vue-select `4.x` (currently published under the `beta` tag).
