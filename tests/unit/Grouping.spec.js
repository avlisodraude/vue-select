import { it, describe, expect } from 'vitest'
import { selectWithProps } from '@tests/helpers.js'

//  Grouped options, e.g.:
//  [{ label: 'Fruits', options: [{ label: 'Apple', value: 1 }, ...] }, ...]
//  @see https://github.com/sagalbot/vue-select/issues/1870
const groupedOptions = [
  {
    label: 'Fruits',
    options: [
      { label: 'Apple', value: 1 },
      { label: 'Banana', value: 2 },
      { label: 'Orange', value: 3 },
    ],
  },
  {
    label: 'Vegetables',
    options: [
      { label: 'Carrot', value: 4 },
      { label: 'Spinach', value: 5 },
      { label: 'Broccoli', value: 6 },
    ],
  },
]

describe('Grouped options (#1870)', () => {
  it('flattens group children into filteredOptions, not just the group labels', () => {
    const Select = selectWithProps({ options: groupedOptions })

    const labels = Select.vm.filteredOptions.map((option) =>
      Select.vm.getOptionLabel(option)
    )

    expect(labels).toEqual([
      'Fruits',
      'Apple',
      'Banana',
      'Orange',
      'Vegetables',
      'Carrot',
      'Spinach',
      'Broccoli',
    ])
  })

  it('renders both group headers and their child options in the dropdown', async () => {
    const Select = selectWithProps({ options: groupedOptions })

    Select.vm.open = true
    await Select.vm.$nextTick()

    const rows = Select.findAll('.vs__dropdown-menu li:not(.vs__no-options)')
    expect(rows).toHaveLength(8)
    expect(rows[1].text()).toBe('Apple')
    expect(rows[4].text()).toBe('Vegetables')
  })

  it('marks group headers with a modifier class and presentation role', async () => {
    const Select = selectWithProps({ options: groupedOptions })

    Select.vm.open = true
    await Select.vm.$nextTick()

    const headers = Select.findAll('.vs__dropdown-option--group')
    expect(headers).toHaveLength(2)
    expect(headers[0].text()).toBe('Fruits')
    expect(headers[0].attributes('role')).toBe('presentation')

    const child = Select.findAll('.vs__dropdown-menu li')[1]
    expect(child.attributes('role')).toBe('option')
  })

  it('does not select a group header when clicked', async () => {
    const Select = selectWithProps({ options: groupedOptions })

    Select.vm.open = true
    await Select.vm.$nextTick()

    await Select.find('.vs__dropdown-menu li:first-child').trigger('click')

    expect(Select.vm.selectedValue).toEqual([])
  })

  it('selects a child option when clicked', async () => {
    const Select = selectWithProps({ options: groupedOptions })

    Select.vm.open = true
    await Select.vm.$nextTick()

    await Select.findAll('.vs__dropdown-menu li')[1].trigger('click')

    expect(Select.vm.selectedValue).toEqual([{ label: 'Apple', value: 1 }])
  })

  it('skips group headers during keyboard navigation', async () => {
    const Select = selectWithProps({ options: groupedOptions })

    Select.vm.open = true
    await Select.vm.$nextTick()

    //  First arrow down skips the 'Fruits' header (index 0)
    //  and lands on Apple (index 1).
    Select.vm.typeAheadDown()
    expect(Select.vm.typeAheadPointer).toBe(1)

    //  Arrow down 3x: Banana (2), Orange (3), then over the
    //  'Vegetables' header (4) straight to Carrot (5).
    Select.vm.typeAheadDown()
    Select.vm.typeAheadDown()
    Select.vm.typeAheadDown()
    expect(Select.vm.typeAheadPointer).toBe(5)

    //  Arrow back up: straight over the header to Orange (3).
    Select.vm.typeAheadUp()
    expect(Select.vm.typeAheadPointer).toBe(3)
  })

  it('filters child options and drops group headers with no matches', () => {
    const Select = selectWithProps({ options: groupedOptions })

    Select.vm.search = 'carrot'

    const labels = Select.vm.filteredOptions.map((option) =>
      Select.vm.getOptionLabel(option)
    )
    expect(labels).toEqual(['Vegetables', 'Carrot'])
  })

  it('keeps every matching group when the search spans groups', () => {
    const Select = selectWithProps({ options: groupedOptions })

    Select.vm.search = 'a' // all fruits + Carrot, Spinach

    const labels = Select.vm.filteredOptions.map((option) =>
      Select.vm.getOptionLabel(option)
    )
    expect(labels).toEqual([
      'Fruits',
      'Apple',
      'Banana',
      'Orange',
      'Vegetables',
      'Carrot',
      'Spinach',
    ])
  })

  it('shows the no-options message when no child matches', async () => {
    const Select = selectWithProps({ options: groupedOptions })

    Select.vm.open = true
    Select.vm.search = 'xyz'
    await Select.vm.$nextTick()

    expect(Select.vm.filteredOptions).toEqual([])
    expect(Select.find('.vs__no-options').exists()).toBe(true)
  })

  it('supports mixing flat options with grouped options', () => {
    const Select = selectWithProps({
      options: [{ label: 'Standalone', value: 0 }, ...groupedOptions],
    })

    const labels = Select.vm.filteredOptions.map((option) =>
      Select.vm.getOptionLabel(option)
    )
    expect(labels[0]).toBe('Standalone')
    expect(labels).toHaveLength(9)

    Select.vm.search = 'standalone'
    expect(Select.vm.filteredOptions).toEqual([{ label: 'Standalone', value: 0 }])
  })

  it('leaves ungrouped (flat) option lists completely untouched', () => {
    const Select = selectWithProps({
      options: [{ label: 'Foo' }, { label: 'Bar' }],
    })

    expect(Select.vm.filteredOptions).toEqual([{ label: 'Foo' }, { label: 'Bar' }])
    expect(Select.vm.isOptionSelectable({ label: 'Foo' })).toBe(true)
  })

  it('respects a custom selectable() for child options', async () => {
    const Select = selectWithProps({
      options: groupedOptions,
      selectable: (option) => option.label !== 'Apple',
    })

    Select.vm.open = true
    await Select.vm.$nextTick()

    await Select.findAll('.vs__dropdown-menu li')[1].trigger('click')
    expect(Select.vm.selectedValue).toEqual([])

    await Select.findAll('.vs__dropdown-menu li')[2].trigger('click')
    expect(Select.vm.selectedValue).toEqual([{ label: 'Banana', value: 2 }])
  })
})
