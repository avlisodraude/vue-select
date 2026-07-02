// Type-only consumer smoke test for Session 9 (native TypeScript types).
//
// This file is never executed — it exists purely so `vue-tsc --noEmit -p
// tsconfig.types-test.json` (see package.json's `typecheck:types` script)
// can confirm the shipped declarations resolve and type-check the way a
// real consumer's code would, importing from the package name itself (path
// mapping in tsconfig.types-test.json points "vue-select" at
// types/vue-select.d.ts, standing in for the resolved dist/ types after
// `npm run build` runs scripts/copy-dts.mjs).
//
// Every public prop, emitted event, exposed method, and slot is exercised
// at least once below. If a future change to the component's public API
// isn't reflected in types/vue-select.d.ts, this file should fail to
// compile.

import { h, ref } from 'vue'
import VSelect, {
  type VueSelectClearSlotProps,
  type VueSelectDeselectSlotProps,
  type VueSelectHeaderFooterSlotProps,
  type VueSelectInstance,
  type VueSelectListHeaderFooterSlotProps,
  type VueSelectNoOptionsSlotProps,
  type VueSelectOpenIndicatorSlotProps,
  type VueSelectOption,
  type VueSelectOptionLikeSlotProps,
  type VueSelectProps,
  type VueSelectSearchSlotProps,
  type VueSelectSelectedOptionContainerSlotProps,
  type VueSelectSpinnerSlotProps,
} from 'vue-select'

// ---------------------------------------------------------------------------
// Props: exercise every prop from VueSelectProps at once.
// ---------------------------------------------------------------------------
const options: VueSelectOption[] = [
  { label: 'Foo', value: 1 },
  { label: 'Bar', value: 2 },
  'Baz',
]

const allProps: VueSelectProps = {
  modelValue: null,
  components: {},
  options,
  disabled: false,
  clearable: true,
  deselectFromDropdown: false,
  virtualScroll: false,
  virtualScrollRowHeight: 40,
  searchable: true,
  multiple: false,
  placeholder: 'Select an option',
  transition: 'vs__fade',
  clearSearchOnSelect: true,
  closeOnSelect: true,
  label: 'label',
  autocomplete: 'off',
  reduce: (option) => (typeof option === 'object' ? option.value : option),
  selectable: (_option) => true,
  getOptionLabel: (option) =>
    typeof option === 'object' ? String(option.label) : String(option),
  getOptionKey: (option) => (typeof option === 'object' ? option.value : option),
  taggable: false,
  tabindex: null,
  pushTags: false,
  filterable: true,
  filterBy: (_option, label, search) =>
    label.toLowerCase().includes(search.toLowerCase()),
  filter: (opts, search) =>
    opts.filter((o) => JSON.stringify(o).includes(search)),
  createOption: (search) => ({ label: search, value: search }),
  resetOnOptionsChange: (_newOptions, _oldOptions, _selectedValue) => false,
  clearSearchOnBlur: ({ clearSearchOnSelect, multiple }) =>
    clearSearchOnSelect && !multiple,
  noDrop: false,
  inputId: 'my-select',
  dir: 'auto',
  selectOnKeyCodes: [13],
  searchInputQuerySelector: '[type=search]',
  mapKeydown: (map, _vm) => map,
  appendToBody: false,
  calculatePosition: (dropdownList, _component, { width, top, left }) => {
    dropdownList.style.top = top
    dropdownList.style.left = left
    dropdownList.style.width = width
  },
  // `dropdownShouldOpen` receives the live component instance; only public
  // surface (props/exposed methods) is typed on VueSelectInstance, so a
  // type-safe override can only rely on those — internal reactive state
  // like the `open`/`mutableLoading` data fields used by the component's
  // own default implementation is deliberately not part of the public type.
  dropdownShouldOpen: ({ noDrop, loading }) => (noDrop ? false : !loading),
  uid: 'vs-1',
  autoscroll: true,
  loading: false,
}

// ---------------------------------------------------------------------------
// Emits: every event declared in VueSelectEmitsOptions, via h()'s onXxx
// props, with payload types checked.
// ---------------------------------------------------------------------------
const vnode = h(VSelect, {
  ...allProps,
  'onUpdate:modelValue': (value: unknown) => {
    void value
  },
  onOpen: () => {},
  onClose: () => {},
  onSearch: (search: string, toggleLoading: (toggle?: boolean | null) => boolean) => {
    toggleLoading(true)
    void search
  },
  'onSearch:compositionstart': () => {},
  'onSearch:compositionend': () => {},
  'onSearch:keydown': () => {},
  'onSearch:blur': () => {},
  'onSearch:focus': () => {},
  'onSearch:input': () => {},
  'onOption:created': (option: VueSelectOption) => void option,
  'onOption:selecting': (option: VueSelectOption) => void option,
  'onOption:selected': (option: VueSelectOption) => void option,
  'onOption:deselecting': (option: VueSelectOption) => void option,
  'onOption:deselected': (option: VueSelectOption) => void option,
})
void vnode

// ---------------------------------------------------------------------------
// Slots: one correctly-typed props object per slot declared on VueSelectSlots.
// ---------------------------------------------------------------------------
const headerFooterProps: VueSelectHeaderFooterSlotProps = {
  search: '',
  loading: false,
  searching: false,
  filteredOptions: options,
  deselect: (option) => void option,
}
void headerFooterProps

const listHeaderFooterProps: VueSelectListHeaderFooterSlotProps = {
  search: '',
  loading: false,
  searching: false,
  filteredOptions: options,
}
void listHeaderFooterProps

const noOptionsProps: VueSelectNoOptionsSlotProps = {
  search: '',
  loading: false,
  searching: false,
}
void noOptionsProps

const searchSlotProps: VueSelectSearchSlotProps = {
  attributes: { placeholder: 'Search' },
  events: { input: (e: Event) => void e },
}
void searchSlotProps

const clearSlotProps: VueSelectClearSlotProps = {
  attributes: { type: 'button' },
  canClear: true,
  clearSelection: () => {},
}
void clearSlotProps

const deselectSlotProps: VueSelectDeselectSlotProps = {
  option: { label: 'Foo', value: 1 },
  deselect: () => {},
  disabled: false,
}
void deselectSlotProps

const openIndicatorProps: VueSelectOpenIndicatorSlotProps = {
  attributes: { role: 'presentation' },
}
void openIndicatorProps

const spinnerProps: VueSelectSpinnerSlotProps = { loading: false }
void spinnerProps

const selectedOptionContainerProps: VueSelectSelectedOptionContainerSlotProps = {
  option: { label: 'Foo', value: 1 },
  deselect: (option) => void option,
  disabled: false,
  multiple: true,
}
void selectedOptionContainerProps

const optionLikeProps: VueSelectOptionLikeSlotProps = { label: 'Foo', value: 1 }
void optionLikeProps

// ---------------------------------------------------------------------------
// Exposed methods: accessible via a template ref typed as VueSelectInstance.
// ---------------------------------------------------------------------------
const selectRef = ref<VueSelectInstance | null>(null)

function exerciseExposedMethods() {
  const instance = selectRef.value
  if (!instance) return

  instance.select({ label: 'Foo', value: 1 })
  instance.deselect({ label: 'Foo', value: 1 })
  instance.clearSelection()
  instance.toggleDropdown()
  instance.openDropdown()
  instance.closeDropdown()
}
void exerciseExposedMethods
