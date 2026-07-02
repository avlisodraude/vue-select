import { it, describe, expect, vi, afterEach } from 'vitest'
import { h } from 'vue'
import { selectWithProps, mountDefault } from '@tests/helpers.js'
import OpenIndicator from '@/components/OpenIndicator.vue'
import VueSelect from '@/components/Select.vue'

const preventDefault = vi.fn()

function clickEvent(currentTarget) {
  return { currentTarget, preventDefault }
}

describe('Toggling Dropdown', () => {
  let spy
  afterEach(() => {
    if (spy) spy.mockClear()
  })

  it('should not open the dropdown when the el is clicked but the component is disabled', () => {
    const Select = selectWithProps({ disabled: true })
    Select.vm.toggleDropdown(clickEvent(Select.vm.$refs.search))
    expect(Select.vm.open).toEqual(false)
  })

  it('should open the dropdown when the el is clicked', () => {
    const Select = selectWithProps({
      modelValue: [{ label: 'one' }],
      options: [{ label: 'one' }],
    })

    Select.vm.toggleDropdown(clickEvent(Select.vm.$refs.search))
    expect(Select.vm.open).toEqual(true)
  })

  it('should open the dropdown when the selected tag is clicked', () => {
    const Select = selectWithProps({
      modelValue: [{ label: 'one' }],
      options: [{ label: 'one' }],
    })

    const selectedTag = Select.find('.vs__selected').element

    Select.vm.toggleDropdown(clickEvent(selectedTag))
    expect(Select.vm.open).toEqual(true)
  })

  it('can close the dropdown when the el is clicked', () => {
    const Select = selectWithProps()
    const spy = vi.spyOn(Select.vm.$refs.search, 'blur')

    Select.vm.open = true
    Select.vm.toggleDropdown(clickEvent(Select.vm.$el))

    expect(spy).toHaveBeenCalled()
  })

  it('closes the dropdown when an option is selected, multiple is true, and closeOnSelect option is true', () => {
    const Select = selectWithProps({
      modelValue: [],
      options: ['one', 'two', 'three'],
      multiple: true,
    })

    Select.vm.open = true
    Select.vm.select('one')

    expect(Select.vm.open).toEqual(false)
  })

  //  Per the WAI-ARIA APG combobox pattern, choosing an option closes the
  //  popup but DOM focus should remain on the combobox. onAfterSelect used
  //  to force `searchEl.blur()` on every selection (mouse or keyboard),
  //  stripping focus even though the dropdown's own mousedown.prevent
  //  handler already protects mouse-click selections from a native blur.
  it('does not blur the search input after a selection closes the dropdown', () => {
    const Select = selectWithProps({
      options: ['one', 'two', 'three'],
    })
    const spy = vi.spyOn(Select.vm.$refs.search, 'blur')

    Select.vm.open = true
    Select.vm.select('one')

    expect(Select.vm.open).toEqual(false)
    expect(spy).not.toHaveBeenCalled()
  })

  //  onAfterSelect previously did `this.open = !this.open`, which would
  //  incorrectly *open* the dropdown if select() ran while already closed
  //  (e.g. a programmatic call). closeOnSelect should always mean closed.
  it('leaves the dropdown closed after a selection even if it was already closed beforehand', () => {
    const Select = selectWithProps({
      options: ['one', 'two', 'three'],
    })

    Select.vm.open = false
    Select.vm.select('one')

    expect(Select.vm.open).toEqual(false)
  })

  it('does not close the dropdown when the el is clicked, multiple is true, and closeOnSelect option is false', () => {
    const Select = selectWithProps({
      modelValue: [],
      options: ['one', 'two', 'three'],
      multiple: true,
      closeOnSelect: false,
    })

    Select.vm.open = true
    Select.vm.select('one')

    expect(Select.vm.open).toEqual(true)
  })

  it('should close the dropdown on search blur', async () => {
    const Select = selectWithProps({
      options: [{ label: 'one' }],
    })

    Select.vm.open = true
    await Select.get('input').trigger('blur')

    expect(Select.vm.open).toEqual(false)
  })

  it('will close the dropdown and emit the search:blur event from onSearchBlur', () => {
    spy = vi.spyOn(VueSelect.methods, 'onSearchBlur')
    const Select = selectWithProps()

    Select.vm.open = true
    Select.vm.onSearchBlur()

    expect(Select.vm.open).toEqual(false)
    expect(spy).toHaveBeenCalled()
  })

  //  Regression guard for #1854. Chrome's "keyboard focusable scrollers"
  //  (default since Chrome 130) makes the scrollable dropdown menu focusable,
  //  so interacting with its scrollbar can move focus off the search input.
  it('renders the dropdown menu with tabindex="-1" so it is not keyboard focusable', async () => {
    const Select = selectWithProps({ options: ['one', 'two', 'three'] })

    Select.vm.open = true
    await Select.vm.$nextTick()

    expect(Select.find('.vs__dropdown-menu').attributes('tabindex')).toEqual(
      '-1'
    )
  })

  it('keeps the dropdown open when focus moves into the dropdown menu on blur', async () => {
    const Select = selectWithProps({ options: ['one', 'two', 'three'] })
    const focusSpy = vi.spyOn(Select.vm.$refs.search, 'focus')

    Select.vm.open = true
    await Select.vm.$nextTick()

    const menu = Select.vm.$refs.dropdownMenu
    const optionInMenu = menu.querySelector('.vs__dropdown-option')

    //  Emulate the browser moving focus onto the scrollable menu.
    Select.vm.onSearchBlur({ relatedTarget: optionInMenu })

    expect(Select.vm.open).toEqual(true)
    expect(focusSpy).toHaveBeenCalled()
  })

  it('still closes the dropdown when focus leaves the component entirely', () => {
    const Select = selectWithProps({ options: ['one', 'two', 'three'] })

    Select.vm.open = true
    //  Focus moving to an element outside the component (or nowhere) must close.
    Select.vm.onSearchBlur({ relatedTarget: document.body })

    expect(Select.vm.open).toEqual(false)
  })

  it('will open the dropdown and emit the search:focus event from onSearchFocus', () => {
    spy = vi.spyOn(VueSelect.methods, 'onSearchFocus')
    const Select = selectWithProps()

    Select.vm.onSearchFocus()

    expect(Select.vm.open).toEqual(true)
    expect(spy).toHaveBeenCalled()
  })

  it('will close the dropdown on escape, if search is empty', () => {
    const Select = selectWithProps()

    Select.vm.open = true
    Select.vm.onEscape()

    expect(Select.vm.open).toEqual(false)
  })

  //  Per the WAI-ARIA APG combobox pattern, Escape closes the popup but
  //  DOM focus must remain on the combobox — blurring would force keyboard
  //  users to re-tab into the field to interact with it again.
  it('does not blur the search input on escape, so focus stays on the combobox', () => {
    const Select = selectWithProps()
    const spy = vi.spyOn(Select.vm.$refs.search, 'blur')

    Select.vm.open = true
    Select.vm.onEscape()

    expect(spy).not.toHaveBeenCalled()
  })

  it('should remove existing search text on escape keydown', () => {
    const Select = selectWithProps({
      modelValue: [{ label: 'one' }],
      options: [{ label: 'one' }],
    })

    Select.vm.search = 'foo'
    Select.find('.vs__search').trigger('keydown.esc')
    expect(Select.vm.search).toEqual('')
  })

  it('should have an open class when dropdown is active', () => {
    const Select = selectWithProps()

    expect(Select.vm.stateClasses['vs--open']).toEqual(false)

    Select.vm.open = true
    expect(Select.vm.stateClasses['vs--open']).toEqual(true)
  })

  it('should not display the dropdown if noDrop is true', async () => {
    const Select = selectWithProps({
      noDrop: true,
    })

    Select.vm.toggleDropdown(clickEvent(Select.vm.$refs.search))

    expect(Select.vm.open).toEqual(true)
    await Select.vm.$nextTick()

    expect(Select.find('.vs__dropdown-menu').exists()).toBeFalsy()
    expect(Select.find('.vs__dropdown-option').exists()).toBeFalsy()
    expect(Select.find('.vs__no-options').exists()).toBeFalsy()
    expect(Select.vm.stateClasses['vs--open']).toBeFalsy()
  })

  it('should hide the open indicator if noDrop is true', () => {
    const Select = selectWithProps({
      noDrop: true,
    })
    expect(Select.findComponent(OpenIndicator).exists()).toBeFalsy()
  })

  it('should not add the searchable state class when noDrop is true', () => {
    const Select = selectWithProps({
      noDrop: true,
    })
    expect(Select.classes('vs--searchable')).toBeFalsy()
  })

  it('should not add the searching state class when noDrop is true', () => {
    const Select = selectWithProps({
      noDrop: true,
    })

    Select.vm.search = 'Canada'

    expect(Select.classes('vs--searching')).toBeFalsy()
  })

  it('can be opened with dropdownShouldOpen', () => {
    const Select = selectWithProps({
      noDrop: true,
      dropdownShouldOpen: () => true,
      options: ['one'],
    })

    expect(Select.classes('vs--open')).toBeTruthy()
    expect(Select.find('.vs__dropdown-menu li')).toBeTruthy()
  })

  //  Regression guard for #1869: "Cannot read properties of null
  //  (reading 'blur')" inside toggleDropdown, and the same class of
  //  crash in onAfterSelect / onEscape / maybeDeleteValue. `searchEl`
  //  does a live `querySelector(searchInputQuerySelector)` whenever a
  //  custom `search` slot is used, and returns null (not undefined)
  //  when no element inside `.vs__selected-options` matches the
  //  selector — e.g. a custom slot input without `type="search"`.
  describe('searchEl null-safety (#1869)', () => {
    const nonMatchingSearchSlot = {
      search: () => h('input', { type: 'text', class: 'vs__search' }),
    }

    it('searchEl is null when the custom search slot input does not match searchInputQuerySelector', () => {
      const Select = mountDefault({}, { slots: nonMatchingSearchSlot })

      expect(Select.vm.searchEl).toBeNull()
    })

    it('toggleDropdown does not throw when searchEl is null', () => {
      const Select = mountDefault({}, { slots: nonMatchingSearchSlot })

      expect(() =>
        Select.vm.toggleDropdown(clickEvent(Select.vm.$el))
      ).not.toThrow()
    })

    it('onAfterSelect does not throw when searchEl is null and closeOnSelect is true', () => {
      const Select = mountDefault(
        { closeOnSelect: true },
        { slots: nonMatchingSearchSlot }
      )

      expect(() => Select.vm.onAfterSelect('one')).not.toThrow()
    })

    it('onEscape does not throw when searchEl is null', () => {
      const Select = mountDefault({}, { slots: nonMatchingSearchSlot })

      expect(() => Select.vm.onEscape()).not.toThrow()
    })

    it('maybeDeleteValue does not throw when searchEl is null', () => {
      const Select = mountDefault(
        { modelValue: [{ label: 'one' }], multiple: true },
        { slots: nonMatchingSearchSlot }
      )

      expect(() => Select.vm.maybeDeleteValue()).not.toThrow()
    })
  })

  describe('Public instance methods (#1860)', () => {
    it('openDropdown() opens the dropdown', () => {
      const Select = selectWithProps()
      Select.vm.openDropdown()
      expect(Select.vm.open).toEqual(true)
    })

    it('openDropdown() does nothing when disabled', () => {
      const Select = selectWithProps({ disabled: true })
      Select.vm.openDropdown()
      expect(Select.vm.open).toEqual(false)
    })

    it('closeDropdown() closes the dropdown', () => {
      const Select = selectWithProps()
      Select.vm.open = true
      Select.vm.closeDropdown()
      expect(Select.vm.open).toEqual(false)
    })

    //  Matches the WAI-ARIA APG fix applied to onEscape/onAfterSelect in the
    //  accessibility session: closing the popup must not strip DOM focus.
    it('closeDropdown() does not blur the search input', () => {
      const Select = selectWithProps()
      const spy = vi.spyOn(Select.vm.$refs.search, 'blur')

      Select.vm.open = true
      Select.vm.closeDropdown()

      expect(spy).not.toHaveBeenCalled()
    })

    it('toggleDropdown() with no event toggles the open state', () => {
      const Select = selectWithProps()
      expect(Select.vm.open).toEqual(false)

      Select.vm.toggleDropdown()
      expect(Select.vm.open).toEqual(true)

      Select.vm.toggleDropdown()
      expect(Select.vm.open).toEqual(false)
    })
  })
})
