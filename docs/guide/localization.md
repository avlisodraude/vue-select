## Right to Left

Vue Select supports RTL using the standard HTML API using the `dir` prop.

```html
<v-select dir="rtl"></v-select>
```

The `dir` prop accepts the same values as the [HTML spec](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir): 

  - `rtl`
  - `ltr`
  - `auto`

## Component Text

All of the text within the component has been wrapped within [slots](https://vuejs.org/v2/guide/components.html#Content-Distribution-with-Slots) and can be replaced in your app.

### Loading Spinner
*Slot Definition:*
```html
<slot name="spinner">
	<div class="spinner" v-show="mutableLoading">Loading...</div>
</slot>
```
*Implementation:*
```html
<v-select>
	<i slot="spinner" class="icon icon-spinner"></i>
</v-select>
```

### No Options Text
*Slot Definition:*
```html
<slot name="no-options">Sorry, no matching options.</slot>
```
*Implementation:*
```html
<v-select>
	<div slot="no-options">No Options Here!</div>
</v-select>
```

For a full list of component slots, view the [slots API docs](../api/slots.md).

## ARIA / Accessibility Strings

Slots only cover visible text. A few strings back `aria-label`/`title`
attributes instead — the search input's accessible name, the clear button,
each selected option's deselect button, and the no-options text as read by
assistive tech — and can't be overridden through slot content. Use the
`ariaLabels` prop to translate them:

```html
<v-select
  :options="options"
  :aria-labels="{
    search: 'Rechercher une option',
    clearSelection: 'Effacer la sélection',
    deselectOption: (label) => `Désélectionner ${label}`,
    noOptions: 'Aucune option correspondante.',
  }"
></v-select>
```

Any key you omit falls back to the English default. See the
[`ariaLabels` prop docs](../api/props.md#arialabels) for the full list of
keys.
