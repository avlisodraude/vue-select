import { it, describe, expect, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import VueSelect from '@/components/Select.vue'

/**
 * Regression coverage for #1868 — hovering options in the dropdown
 * was O(n) in the option count because every `@mouseover` (which only
 * moves `typeAheadPointer`) re-ran `getOptionKey`/`isOptionSelected`/
 * `selectable`/`getOptionLabel` for *every* option in the render.
 *
 * The fix hoists all pointer-independent per-option work into the
 * cached `renderableOptions` computed, so moving the pointer no longer
 * recomputes any of it.
 */
describe('Hover performance (#1868)', () => {
  const objectOptions = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    label: `Option ${i}`,
  }))

  it('does not recompute per-option data when only the pointer moves', async () => {
    const getOptionKey = vi.fn((option) => option.id)

    const Select = shallowMount(VueSelect, {
      props: { options: objectOptions, getOptionKey },
    })
    Select.vm.open = true
    await Select.vm.$nextTick()

    // Prime `renderableOptions`.
    Select.vm.renderableOptions // eslint-disable-line no-unused-expressions
    await Select.vm.$nextTick()

    const callsAfterFirstRender = getOptionKey.mock.calls.length

    // Simulate a burst of hover events across the list.
    for (let i = 0; i < objectOptions.length; i++) {
      Select.vm.typeAheadPointer = i
      await Select.vm.$nextTick()
    }

    // Moving the pointer must not trigger any new key generation.
    expect(getOptionKey.mock.calls.length).toEqual(callsAfterFirstRender)
  })

  it('exposes highlight state through a cheap pointer compare', async () => {
    const Select = shallowMount(VueSelect, {
      props: { options: objectOptions },
    })
    Select.vm.open = true
    await Select.vm.$nextTick()
    Select.vm.typeAheadPointer = 3
    await Select.vm.$nextTick()

    const highlighted = Select.findAll('.vs__dropdown-option--highlight')
    expect(highlighted).toHaveLength(1)
    expect(highlighted[0].attributes('id')).toContain('__option-3')
  })

  it('answers isOptionSelected via an O(1) key lookup', () => {
    const Select = shallowMount(VueSelect, {
      props: { options: objectOptions, modelValue: objectOptions[5] },
    })

    expect(Select.vm.isOptionSelected(objectOptions[5])).toBe(true)
    expect(Select.vm.isOptionSelected(objectOptions[6])).toBe(false)
    // Nothing selected -> short-circuits without keying the option.
    const Empty = shallowMount(VueSelect, { props: { options: objectOptions } })
    expect(Empty.vm.isOptionSelected(null)).toBe(false)
  })
})

describe('Virtual scroll (experimental)', () => {
  const manyOptions = Array.from({ length: 500 }, (_, i) => `Option ${i}`)

  it('renders every option when virtual-scroll is disabled (default)', async () => {
    const Select = shallowMount(VueSelect, { props: { options: manyOptions } })
    Select.vm.open = true
    await Select.vm.$nextTick()

    expect(Select.vm.visibleOptions).toHaveLength(manyOptions.length)
    expect(Select.findAll('.vs__dropdown-option')).toHaveLength(
      manyOptions.length
    )
  })

  it('windows the option list when virtual-scroll is enabled', async () => {
    const Select = shallowMount(VueSelect, {
      props: {
        options: manyOptions,
        virtualScroll: true,
        virtualScrollRowHeight: 40,
      },
    })
    Select.vm.open = true
    await Select.vm.$nextTick()
    Select.vm.virtualScrollViewportHeight = 350
    await Select.vm.$nextTick()

    // A ~350px viewport at 40px/row plus buffer renders a small slice,
    // not all 500 rows.
    expect(Select.vm.visibleOptions.length).toBeLessThan(40)
    expect(Select.vm.visibleOptions.length).toBeGreaterThan(0)
    expect(Select.findAll('.vs__dropdown-option').length).toBeLessThan(40)
  })

  it('preserves original indices and scrollbar size while windowed', async () => {
    const Select = shallowMount(VueSelect, {
      props: {
        options: manyOptions,
        virtualScroll: true,
        virtualScrollRowHeight: 40,
      },
    })
    Select.vm.open = true
    await Select.vm.$nextTick()
    Select.vm.virtualScrollViewportHeight = 350
    Select.vm.virtualScrollTop = 4000 // scrolled 100 rows down
    await Select.vm.$nextTick()

    const first = Select.vm.visibleOptions[0]
    expect(first.index).toBeGreaterThan(0)

    // Spacers stand in for the un-rendered rows so total height is
    // preserved: top + rendered + bottom == full list height.
    const rendered = Select.vm.visibleOptions.length * 40
    const total =
      Select.vm.virtualScrollPadding.top +
      rendered +
      Select.vm.virtualScrollPadding.bottom
    expect(total).toEqual(manyOptions.length * 40)
  })
})
