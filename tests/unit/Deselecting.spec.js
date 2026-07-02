import { it, describe, expect, vi } from 'vitest'
import { mountDefault, selectWithProps } from '@tests/helpers.js'

describe('Removing values', () => {
  it('can remove the given tag when its close icon is clicked', async () => {
    const Select = selectWithProps({ multiple: true })
    Select.vm.$data.uncontrolledValue = 'one'
    await Select.vm.$nextTick()

    Select.find('.vs__deselect').trigger('click')
    expect(Select.emitted()['update:modelValue']).toEqual([[[]]])
    expect(Select.vm.selectedValue).toEqual([])
  })

  it('should not remove tag when close icon is clicked and component is disabled', () => {
    const Select = selectWithProps({
      modelValue: ['one'],
      options: ['one', 'two', 'three'],
      multiple: true,
      disabled: true,
    })

    Select.find('.vs__deselect').trigger('click')
    expect(Select.vm.selectedValue).toEqual(['one'])
  })

  it('should remove the last item in the value array on delete keypress when multiple is true', () => {
    const Select = selectWithProps({
      multiple: true,
      options: ['one', 'two', 'three'],
    })

    Select.vm.$data.uncontrolledValue = ['one', 'two']

    Select.find('.vs__search').trigger('keydown.backspace')

    expect(Select.emitted()['update:modelValue']).toEqual([[['one']]])
    expect(Select.vm.selectedValue).toEqual(['one'])
  })

  it('should set value to null on delete keypress when multiple is false', () => {
    const Select = selectWithProps({
      options: ['one', 'two', 'three'],
    })

    Select.vm.$data.uncontrolledValue = 'one'

    Select.vm.maybeDeleteValue()
    expect(Select.vm.selectedValue).toEqual([])
  })

  it('will not emit update:modelValue event if value has not changed with backspace', () => {
    const Select = mountDefault()
    Select.vm.$data.uncontrolledValue = 'one'
    Select.get('input').trigger('keydown.backspace')
    expect(Select.emitted()['update:modelValue'].length).toBe(1)

    Select.get('input').trigger('keydown.backspace')
    Select.get('input').trigger('keydown.backspace')
    expect(Select.emitted()['update:modelValue'].length).toBe(1)
  })

  it('should deselect a selected option when clicked and deselectFromDropdown is true', async () => {
    const Select = selectWithProps({
      modelValue: 'one',
      options: ['one', 'two', 'three'],
      deselectFromDropdown: true,
    })
    const deselect = vi.spyOn(Select.vm, 'deselect')

    Select.vm.open = true
    await Select.vm.$nextTick()

    Select.find('.vs__dropdown-option--selected').trigger('click')
    await Select.vm.$nextTick()

    expect(deselect).toHaveBeenCalledWith('one')
  })

  it('should not deselect a selected option when clicked if clearable is false', async () => {
    const Select = selectWithProps({
      modelValue: 'one',
      options: ['one', 'two', 'three'],
      clearable: false,
      deselectFromDropdown: true,
    })
    const deselect = vi.spyOn(Select.vm, 'deselect')

    Select.vm.open = true
    await Select.vm.$nextTick()

    Select.find('.vs__dropdown-option--selected').trigger('click')
    await Select.vm.$nextTick()

    expect(deselect).not.toHaveBeenCalledWith('one')
  })

  it('should not deselect a selected option when clicked if deselectFromDropdown is false', async () => {
    const Select = selectWithProps({
      modelValue: 'one',
      options: ['one', 'two', 'three'],
      deselectFromDropdown: false,
    })
    const deselect = vi.spyOn(Select.vm, 'deselect')

    Select.vm.open = true
    await Select.vm.$nextTick()

    Select.find('.vs__dropdown-option--selected').trigger('click')
    await Select.vm.$nextTick()

    expect(deselect).not.toHaveBeenCalledWith('one')
  })

  describe('Keyboard operability', () => {
    //  Per the WAI-ARIA APG combobox pattern, per-tag remove controls and
    //  the clear-all control just need to be genuine native <button>
    //  elements in the tab order — browsers dispatch a click on Enter/Space
    //  automatically, so that's the real guarantee of keyboard operability
    //  here (not something a synthetic keydown test can meaningfully add).
    it('the per-tag deselect control is a native, tabbable button (not a div/span with only a click handler)', () => {
      const Select = selectWithProps({
        modelValue: ['one'],
        options: ['one', 'two', 'three'],
        multiple: true,
      })

      const deselectButton = Select.find('.vs__deselect')
      expect(deselectButton.element.tagName).toEqual('BUTTON')
      expect(deselectButton.attributes('type')).toEqual('button')
      expect(deselectButton.attributes('tabindex')).not.toEqual('-1')
      expect(deselectButton.attributes('aria-label')).toBeTruthy()
    })

    it('the clear-all control is a native, tabbable button', () => {
      const Select = selectWithProps({
        modelValue: 'foo',
        options: ['foo', 'bar'],
      })

      const clearButton = Select.find('button.vs__clear')
      expect(clearButton.element.tagName).toEqual('BUTTON')
      expect(clearButton.attributes('type')).toEqual('button')
      expect(clearButton.attributes('tabindex')).not.toEqual('-1')
      expect(clearButton.attributes('aria-label')).toBeTruthy()
    })

    it('removes the last tag via Backspace when the search input is empty (keyboard-only tag removal)', () => {
      const Select = selectWithProps({
        multiple: true,
        options: ['one', 'two', 'three'],
      })
      Select.vm.$data.uncontrolledValue = ['one', 'two']

      Select.get('input').trigger('keydown.backspace')

      expect(Select.vm.selectedValue).toEqual(['one'])
    })

    it('does not delete a tag via Backspace while the search input still has text', async () => {
      const Select = selectWithProps({
        multiple: true,
        options: ['one', 'two', 'three'],
      })
      Select.vm.$data.uncontrolledValue = ['one', 'two']
      Select.vm.search = 'partial query'
      await Select.vm.$nextTick()

      await Select.get('input').trigger('keydown.backspace')

      expect(Select.vm.selectedValue).toEqual(['one', 'two'])
    })
  })

  describe('Clear button', () => {
    it('should be displayed on single select when value is selected', () => {
      const Select = selectWithProps({
        options: ['foo', 'bar'],
        modelValue: 'foo',
      })

      expect(Select.vm.showClearButton).toEqual(true)
    })

    it('should not be displayed on multiple select', () => {
      const Select = selectWithProps({
        options: ['foo', 'bar'],
        modelValue: 'foo',
        multiple: true,
      })

      expect(Select.vm.showClearButton).toEqual(false)
    })

    it('should remove selected value when clicked', () => {
      const Select = selectWithProps({
        options: ['foo', 'bar'],
      })
      Select.vm.$data.uncontrolledValue = 'foo'

      expect(Select.vm.selectedValue).toEqual(['foo'])
      Select.find('button.vs__clear').trigger('click')

      expect(Select.emitted()['update:modelValue']).toEqual([[null]])
      expect(Select.vm.selectedValue).toEqual([])
    })

    it('should be disabled when component is disabled', () => {
      const Select = selectWithProps({
        options: ['foo', 'bar'],
        modelValue: 'foo',
        disabled: true,
      })

      expect(
        Select.find('button.vs__clear').attributes().disabled
      ).toBeDefined()
    })
  })
})
