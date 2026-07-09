import { it, describe, expect } from 'vitest'
import { mountDefault, selectWithProps } from '@tests/helpers.js'

/**
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
 */
describe('WAI-ARIA combobox pattern', () => {
  it('puts role="combobox" on the search input itself, not a wrapper element', () => {
    const Select = mountDefault()

    expect(Select.get('input').attributes('role')).toEqual('combobox')
    expect(Select.find('.vs__dropdown-toggle').attributes('role')).toEqual(
      undefined
    )
  })

  it('reflects the dropdown open state via aria-expanded on the combobox input', async () => {
    const Select = mountDefault()

    expect(Select.get('input').attributes('aria-expanded')).toEqual('false')

    Select.vm.open = true
    await Select.vm.$nextTick()

    expect(Select.get('input').attributes('aria-expanded')).toEqual('true')
  })

  it('does not duplicate aria-expanded onto the wrapper element', () => {
    const Select = mountDefault()

    expect(
      Select.find('.vs__dropdown-toggle').attributes('aria-expanded')
    ).toEqual(undefined)
  })

  it('gives the combobox input an accessible name via aria-label', () => {
    const Select = mountDefault()

    expect(Select.get('input').attributes('aria-label')).toBeTruthy()
  })

  it('points aria-controls at the listbox id', () => {
    const Select = mountDefault({ uid: 'combo' })

    expect(Select.get('input').attributes('aria-controls')).toEqual(
      'vscombo__listbox'
    )
  })

  it('marks the currently selected option with aria-selected, independent of typeahead highlight position', async () => {
    const Select = selectWithProps({
      modelValue: 'one',
      options: ['one', 'two', 'three'],
    })

    Select.vm.open = true
    //  Move the keyboard highlight (typeAheadPointer) to a *different*
    //  option than the actual selected value — the highlighted option
    //  is communicated via aria-activedescendant, not aria-selected.
    Select.vm.typeAheadPointer = 2
    await Select.vm.$nextTick()

    const options = Select.findAll('[role="option"]')
    expect(options[0].attributes('aria-selected')).toEqual('true')
    expect(options[1].attributes('aria-selected')).toEqual(undefined)
    expect(options[2].attributes('aria-selected')).toEqual(undefined)
  })

  it('marks non-selectable options with aria-disabled', async () => {
    const Select = selectWithProps({
      options: ['one', 'two', 'three'],
      selectable: (option) => option !== 'two',
    })

    Select.vm.open = true
    await Select.vm.$nextTick()

    const options = Select.findAll('[role="option"]')
    expect(options[0].attributes('aria-disabled')).toEqual(undefined)
    expect(options[1].attributes('aria-disabled')).toEqual('true')
    expect(options[2].attributes('aria-disabled')).toEqual(undefined)
  })

  it('sets aria-multiselectable on the listbox when multiple is true', async () => {
    const Select = selectWithProps({
      options: ['one', 'two'],
      multiple: true,
    })

    Select.vm.open = true
    await Select.vm.$nextTick()

    expect(
      Select.find('[role="listbox"]').attributes('aria-multiselectable')
    ).toEqual('true')
  })

  it('does not set aria-multiselectable on a single-select listbox', async () => {
    const Select = selectWithProps({ options: ['one', 'two'] })

    Select.vm.open = true
    await Select.vm.$nextTick()

    expect(
      Select.find('[role="listbox"]').attributes('aria-multiselectable')
    ).toEqual(undefined)
  })
})

describe('Search Slot Scope', () => {
  /**
   * @see https://www.w3.org/WAI/PF/aria/states_and_properties#aria-activedescendant
   */
  describe('aria-activedescendant', () => {
    it('adds the active descendant attribute only when the dropdown is open and there is a typeAheadPointer value', async () => {
      const Select = mountDefault()

      expect(
        Select.vm.scope.search.attributes['aria-activedescendant']
      ).toEqual(undefined)

      Select.vm.open = true
      await Select.vm.$nextTick()

      expect(
        Select.vm.scope.search.attributes['aria-activedescendant']
      ).toEqual(undefined)
    })

    it("adds the active descendant attribute when there's a typeahead value and an open dropdown", async () => {
      const Select = mountDefault({ modelValue: 'three' }, [
        'one',
        'two',
        'three',
      ])

      Select.vm.open = true
      Select.vm.typeAheadPointer = 1
      await Select.vm.$nextTick()

      expect(
        Select.vm.scope.search.attributes['aria-activedescendant']
      ).toEqual(`vs${Select.vm.uid}__option-2`)
    })
  })
})

describe('ariaLabels prop', () => {
  it('defaults every string to English', () => {
    const Select = selectWithProps({
      modelValue: ['one'],
      options: ['one', 'two'],
      multiple: true,
    })

    expect(Select.get('input').attributes('aria-label')).toEqual(
      'Search for option'
    )
    expect(Select.get('button.vs__clear').attributes('aria-label')).toEqual(
      'Clear Selected'
    )
    expect(Select.get('button.vs__deselect').attributes('aria-label')).toEqual(
      'Deselect one'
    )
  })

  it('merges overrides on top of the English defaults, leaving omitted keys untranslated', () => {
    const Select = selectWithProps({
      modelValue: ['one'],
      options: ['one', 'two'],
      multiple: true,
      ariaLabels: {
        search: 'Rechercher une option',
        deselectOption: (label) => `Désélectionner ${label}`,
      },
    })

    expect(Select.get('input').attributes('aria-label')).toEqual(
      'Rechercher une option'
    )
    expect(Select.get('button.vs__deselect').attributes('aria-label')).toEqual(
      'Désélectionner one'
    )
    //  `clearSelection` was not overridden — still falls back to English.
    expect(Select.get('button.vs__clear').attributes('aria-label')).toEqual(
      'Clear Selected'
    )
  })

  it('overrides the no-options text', async () => {
    const Select = selectWithProps({
      options: ['one'],
      ariaLabels: { noOptions: 'Aucune option correspondante.' },
    })

    Select.vm.search = 'nonexistent'
    Select.vm.open = true
    await Select.vm.$nextTick()

    expect(Select.find('.vs__no-options').text()).toEqual(
      'Aucune option correspondante.'
    )
  })
})

describe('UID', () => {
  it('works with strings', () => {
    const Select = mountDefault({ uid: 'hello' })
    expect(Select.find('#vshello__combobox').exists()).toBeTruthy()
  })

  it('works with numbers', () => {
    const Select = mountDefault({ uid: 2 })
    expect(Select.find('#vs2__combobox').exists()).toBeTruthy()
  })
})
