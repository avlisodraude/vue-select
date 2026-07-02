// Native TypeScript definitions for vue-select (Session 9 of the v4.0.0-beta plan).
//
// This file is the single source of truth for the package's shipped types. It
// is copied verbatim to `dist/vue-select.d.ts` by `scripts/copy-dts.mjs` as
// part of `npm run build` — see package.json's `types`/`exports` fields for
// how consumers resolve it. Edit this file, not the copy in `dist/`.
//
// Previously, consumers had to install the separate, community-maintained
// `@types/vue-select` package (22k+ weekly downloads on its own) to get any
// type information at all. This file replaces that need with first-party
// types that track the actual component, kept in one place instead of a
// separately-versioned package.

import type {
  Component,
  ComponentOptionsMixin,
  ComponentPublicInstance,
  DefineComponent,
} from 'vue'

/**
 * A single selectable option. Most consumers use plain objects (with a
 * `label` key, or whatever key the `label` prop points to), but any string
 * or number is also valid — vue-select falls back to using the value itself
 * as the label in that case.
 */
export type VueSelectOption = string | number | Record<string, any>

/**
 * The positioning values `calculatePosition` receives as its third argument.
 * All three are already-computed, ready-to-assign CSS pixel strings.
 */
export interface VueSelectPositionInfo {
  width: string
  top: string
  left: string
}

/**
 * Signature of the `calculatePosition` prop. If a function is returned, it is
 * called when the dropdown list is removed from the DOM — use it for any
 * cleanup (e.g. removing scroll/resize listeners set up by a custom
 * positioning implementation, such as floating-ui's `autoUpdate`).
 */
export type VueSelectCalculatePosition = (
  dropdownList: HTMLUListElement,
  component: VueSelectInstance,
  position: VueSelectPositionInfo
) => void | (() => void)

/**
 * Signature of the `dropdownShouldOpen` prop. Receives the component
 * instance and returns whether the dropdown menu should currently be open.
 */
export type VueSelectDropdownShouldOpen = (component: VueSelectInstance) => boolean

/** Public props accepted by `<v-select>` / `VueSelect`. */
export interface VueSelectProps {
  /**
   * The currently selected value. Bind with `v-model` rather than setting
   * this directly in most cases.
   */
  modelValue?: unknown

  /**
   * Overrides for any of the default child components (currently
   * `Deselect` and `OpenIndicator`). Keys are merged with the defaults, so
   * only the components you want to replace need to be included.
   */
  components?: Record<string, Component>

  /**
   * The choices available in the dropdown. Plain strings/numbers or objects
   * (using the key named by the `label` prop) are both supported.
   */
  options?: VueSelectOption[]

  /** Disable the entire component. */
  disabled?: boolean

  /** Whether the user can clear the selected value. */
  clearable?: boolean

  /** Allow deselecting an option by clicking it again from within the dropdown. */
  deselectFromDropdown?: boolean

  /**
   * EXPERIMENTAL — opt-in virtual scrolling for large option lists. See
   * `virtualScrollRowHeight`. Foundation-only: assumes a fixed row height and
   * does not yet handle variable-height rows, grouped options, or
   * keyboard-autoscroll perfectly.
   */
  virtualScroll?: boolean

  /**
   * EXPERIMENTAL — the assumed height, in pixels, of a single option row.
   * Only used when `virtualScroll` is enabled.
   */
  virtualScrollRowHeight?: number

  /** Enable/disable filtering the options as the user types. */
  searchable?: boolean

  /** Equivalent to the `multiple` attribute on a native `<select>`. */
  multiple?: boolean

  /** Equivalent to the `placeholder` attribute on a native `<input>`. */
  placeholder?: string

  /** Vue `<transition>` name applied to the dropdown menu. */
  transition?: string

  /** Clear the search text when an option is selected. */
  clearSearchOnSelect?: boolean

  /** Close the dropdown when an option is chosen. */
  closeOnSelect?: boolean

  /** The object key used to read an option's display label. */
  label?: string

  /** Value of the search input's `autocomplete` attribute. */
  autocomplete?: string

  /**
   * Transforms a selected option before it's emitted via `v-model`/
   * `update:modelValue` — e.g. reduce an object down to just its id.
   */
  reduce?: (option: VueSelectOption) => unknown

  /**
   * Determines whether a given option is selectable. Non-selectable options
   * are shown but disabled.
   */
  selectable?: (option: VueSelectOption) => boolean

  /** Returns the display label for a given option. */
  getOptionLabel?: (option: VueSelectOption) => string

  /** Returns a unique key for a given option. */
  getOptionKey?: (option: VueSelectOption) => string | number

  /**
   * @deprecated since 3.3 — use `selectOnKeyCodes` instead.
   */
  onTab?: () => void

  /** Enable creating new options from the current search text. */
  taggable?: boolean

  /** The `tabindex` of the search input. */
  tabindex?: number | null

  /** When true, newly created tags are added to the options list. */
  pushTags?: boolean

  /** Enable/disable filtering options by the search text. */
  filterable?: boolean

  /** Determines whether a given option matches the current search text. */
  filterBy?: (option: VueSelectOption, label: string, search: string) => boolean

  /** Filters the full option list down to the currently matching options. */
  filter?: (
    options: VueSelectOption[],
    search: string,
    vm: VueSelectInstance
  ) => VueSelectOption[]

  /** Builds a new option from the current search text when `taggable` is enabled. */
  createOption?: (search: string) => VueSelectOption

  /**
   * When falsy, updating `options` will not reset the selected value.
   * Accepts a boolean, or a function that receives the new/old options and
   * the current selection and returns a boolean.
   */
  resetOnOptionsChange?:
    | boolean
    | ((
        newOptions: VueSelectOption[],
        oldOptions: VueSelectOption[],
        selectedValue: VueSelectOption[]
      ) => boolean)

  /** Determines whether the search text should clear on blur. */
  clearSearchOnBlur?: (context: {
    clearSearchOnSelect: boolean
    multiple: boolean
  }) => boolean

  /** Disable the dropdown entirely (still shows the control, just no menu). */
  noDrop?: boolean

  /** Sets the `id` of the search input element. */
  inputId?: string

  /** Sets the `dir` (text direction) attribute. */
  dir?: 'ltr' | 'rtl' | 'auto' | (string & {})

  /**
   * @deprecated since 3.3 — use `selectOnKeyCodes` instead.
   */
  selectOnTab?: boolean

  /** Key codes that will select the currently highlighted option. */
  selectOnKeyCodes?: number[]

  /**
   * CSS selector used to find the search input when the `search` scoped
   * slot is used with a custom input element.
   */
  searchInputQuerySelector?: string

  /** Modify the default keydown-to-action mapping for the search input. */
  mapKeydown?: (
    map: Record<number, (event: KeyboardEvent) => unknown>,
    vm: VueSelectInstance
  ) => Record<number, (event: KeyboardEvent) => unknown>

  /** Append the dropdown element to the end of `<body>`. */
  appendToBody?: boolean

  /**
   * Positions the dropdown when `appendToBody` is true. Defaults to simple
   * top/left/width assignment; swap in a library like floating-ui for
   * viewport-aware positioning (see the `docs/guide/positioning.md` example).
   */
  calculatePosition?: VueSelectCalculatePosition

  /** Determines whether the dropdown should currently be open. */
  dropdownShouldOpen?: VueSelectDropdownShouldOpen

  /** A unique identifier used to generate element IDs. Auto-generated by default. */
  uid?: string | number

  /**
   * Automatically scroll the dropdown so the highlighted option stays in
   * view while navigating with the keyboard.
   */
  autoscroll?: boolean

  /** Adds a `loading` class to the component and shows the `spinner` slot. */
  loading?: boolean
}

/** Object-form `emits` used to derive fully-typed event payloads. */
export type VueSelectEmitsOptions = {
  open: () => true
  close: () => true
  'update:modelValue': (value: unknown) => true
  /**
   * Fired whenever the search text changes. `toggleLoading` optionally
   * accepts a boolean; called with no argument it flips the current
   * loading state.
   */
  search: (
    search: string,
    toggleLoading: (toggle?: boolean | null) => boolean
  ) => true
  'search:compositionstart': () => true
  'search:compositionend': () => true
  'search:keydown': () => true
  'search:blur': () => true
  'search:focus': () => true
  'search:input': () => true
  'option:created': (option: VueSelectOption) => true
  'option:selecting': (option: VueSelectOption) => true
  'option:selected': (option: VueSelectOption) => true
  'option:deselecting': (option: VueSelectOption) => true
  'option:deselected': (option: VueSelectOption) => true
}

/** Public instance methods exposed on the component (e.g. via a template ref). */
export interface VueSelectExposed {
  /** Select (or, if already selected and deselect-from-dropdown applies, deselect) the given option. */
  select(option: VueSelectOption): void

  /** Deselect the given option. */
  deselect(option: VueSelectOption): void

  /** Clear the current selection. */
  clearSelection(): void

  /**
   * Toggle the dropdown. Call with no argument to toggle it
   * programmatically via a template ref; the optional event argument is
   * used internally for the pointer-driven toggle behavior.
   */
  toggleDropdown(event?: Event): void

  /** Open the dropdown programmatically. No-op while `disabled`. */
  openDropdown(): void

  /** Close the dropdown programmatically. */
  closeDropdown(): void
}

/** Props passed to the `search` slot. */
export interface VueSelectSearchSlotProps {
  /** Bind with `v-bind="attributes"` on your input element. */
  attributes: Record<string, unknown>
  /** Bind with `v-on="events"` on your input element. */
  events: Record<string, (...args: any[]) => void>
}

/** Props passed to the `clear` slot. */
export interface VueSelectClearSlotProps {
  /** Bind with `v-bind="attributes"` to inherit the default class, ref, disabled state, and click handler. */
  attributes: Record<string, unknown>
  /** Whether the default clear button would normally be displayed. */
  canClear: boolean
  /** Clears the current selection. */
  clearSelection: () => void
}

/** Props passed to the `deselect` slot (the per-tag deselect control). */
export interface VueSelectDeselectSlotProps {
  /** The selected option this control belongs to. */
  option: Record<string, any>
  /** Deselects this option — pre-bound, call with no arguments. */
  deselect: () => void
  /** Whether the component is disabled. */
  disabled: boolean
}

/** Props passed to the `open-indicator` slot. */
export interface VueSelectOpenIndicatorSlotProps {
  attributes: Record<string, unknown>
}

/** Props passed to the `spinner` slot. */
export interface VueSelectSpinnerSlotProps {
  loading: boolean
}

/** Props passed to the `no-options` slot. */
export interface VueSelectNoOptionsSlotProps {
  search: string
  loading: boolean
  searching: boolean
}

/** Props passed to the `header`/`footer` slots. */
export interface VueSelectHeaderFooterSlotProps {
  search: string
  loading: boolean
  searching: boolean
  filteredOptions: VueSelectOption[]
  /** Deselects the given option. */
  deselect: (option: VueSelectOption) => void
}

/** Props passed to the `list-header`/`list-footer` slots. */
export interface VueSelectListHeaderFooterSlotProps {
  search: string
  loading: boolean
  searching: boolean
  filteredOptions: VueSelectOption[]
}

/** Props passed to the `selected-option-container` slot. */
export interface VueSelectSelectedOptionContainerSlotProps {
  /** The currently iterated selected option. */
  option: Record<string, any>
  /** Deselects the given option (only meaningful when `multiple` is true). */
  deselect: (option: VueSelectOption) => void
  /** Whether the component is disabled. */
  disabled: boolean
  /** Whether the component supports selecting multiple values. */
  multiple: boolean
}

/**
 * Slots whose default content is the option object itself, spread as
 * individual props via `v-bind` (e.g. `{ label: 'Foo', value: 1 }` becomes
 * `label`/`value` props, not a single `option` prop). Since option shapes
 * are consumer-defined, these are typed as an open string-keyed bag.
 */
export type VueSelectOptionLikeSlotProps = Record<string, any>

/** All scoped slots exposed by `<v-select>` / `VueSelect`. */
export interface VueSelectSlots {
  header(props: VueSelectHeaderFooterSlotProps): any
  'selected-option-container'(
    props: VueSelectSelectedOptionContainerSlotProps
  ): any
  'selected-option'(props: VueSelectOptionLikeSlotProps): any
  deselect(props: VueSelectDeselectSlotProps): any
  search(props: VueSelectSearchSlotProps): any
  clear(props: VueSelectClearSlotProps): any
  'open-indicator'(props: VueSelectOpenIndicatorSlotProps): any
  spinner(props: VueSelectSpinnerSlotProps): any
  'list-header'(props: VueSelectListHeaderFooterSlotProps): any
  option(props: VueSelectOptionLikeSlotProps): any
  'no-options'(props: VueSelectNoOptionsSlotProps): any
  'list-footer'(props: VueSelectListHeaderFooterSlotProps): any
  footer(props: VueSelectHeaderFooterSlotProps): any
}

declare const VueSelect: {
  new (): {
    $props: VueSelectProps
    $slots: VueSelectSlots
  }
} & DefineComponent<
  VueSelectProps,
  {},
  {},
  {},
  VueSelectExposed,
  ComponentOptionsMixin,
  ComponentOptionsMixin,
  VueSelectEmitsOptions
>

/** The type of a mounted `VueSelect` instance — handy for typing template refs. */
export type VueSelectInstance = ComponentPublicInstance<
  VueSelectProps,
  {},
  {},
  {},
  VueSelectExposed,
  VueSelectEmitsOptions
> &
  VueSelectExposed

export default VueSelect
