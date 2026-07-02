import { it, describe, expect, vi } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import VueSelect from '@/components/Select.vue'
import { mountDefault } from '@tests/helpers.js'

describe('When reduce prop is defined', () => {
  it('determines when a reducer has been supplied', async () => {
    const Select = mountDefault()
    expect(Select.vm.isReducingValues).toBeFalsy()

    await Select.setProps({ reduce: () => {} })
    expect(Select.vm.isReducingValues).toBeTruthy()
  })

  //  isTrackingValues is a deprecated alias kept for backwards
  //  compatibility (see the doc comment in Select.vue) — nothing in
  //  the component itself calls it anymore since the Session 3
  //  controlled-component refactor, but it's still public API.
  it('isTrackingValues stays in sync with isControlled/isReducingValues (deprecated alias)', async () => {
    const Select = shallowMount(VueSelect, {
      props: { options: ['one'] },
    })

    //  Uncontrolled (no modelValue bound) -> always tracking.
    expect(Select.vm.isControlled).toBe(false)
    expect(Select.vm.isTrackingValues).toBe(true)

    //  Controlled, no reduce -> not tracking.
    await Select.setProps({ modelValue: 'one' })
    expect(Select.vm.isControlled).toBe(true)
    expect(Select.vm.isReducingValues).toBe(false)
    expect(Select.vm.isTrackingValues).toBe(false)

    //  Controlled + reduce -> tracking again.
    await Select.setProps({ reduce: (option) => option })
    expect(Select.vm.isReducingValues).toBe(true)
    expect(Select.vm.isTrackingValues).toBe(true)
  })

  it('can accept an array of objects and pre-selected value (single)', () => {
    const Select = shallowMount(VueSelect, {
      props: {
        reduce: (option) => option.value,
        modelValue: 'foo',
        options: [{ label: 'This is Foo', value: 'foo' }],
      },
    })
    expect(Select.vm.selectedValue).toEqual([
      { label: 'This is Foo', value: 'foo' },
    ])
  })

  it('can determine if an object is pre-selected', () => {
    const Select = shallowMount(VueSelect, {
      props: {
        reduce: (option) => option.id,
        modelValue: 'foo',
        options: [
          {
            id: 'foo',
            label: 'This is Foo',
          },
        ],
      },
    })

    expect(
      Select.vm.isOptionSelected({
        id: 'foo',
        label: 'This is Foo',
      })
    ).toEqual(true)
  })

  it('can determine if an object is selected after its been chosen', () => {
    const Select = shallowMount(VueSelect, {
      props: {
        reduce: (option) => option.id,
        options: [{ id: 'foo', label: 'FooBar' }],
      },
    })

    Select.vm.select({ id: 'foo', label: 'FooBar' })

    expect(
      Select.vm.isOptionSelected({
        id: 'foo',
        label: 'This is FooBar',
      })
    ).toEqual(true)
  })

  it('can accept an array of objects and pre-selected values (multiple)', () => {
    const Select = shallowMount(VueSelect, {
      props: {
        multiple: true,
        reduce: (option) => option.value,
        modelValue: ['foo'],
        options: [
          { label: 'This is Foo', value: 'foo' },
          { label: 'This is Bar', value: 'bar' },
        ],
      },
    })

    expect(Select.vm.selectedValue).toEqual([
      { label: 'This is Foo', value: 'foo' },
    ])
  })

  it('can deselect a pre-selected object', () => {
    const Select = shallowMount(VueSelect, {
      props: {
        multiple: true,
        reduce: (option) => option.value,
        options: [
          { label: 'This is Foo', value: 'foo' },
          { label: 'This is Bar', value: 'bar' },
        ],
      },
    })

    Select.vm.$data.uncontrolledValue = ['foo', 'bar']

    Select.vm.deselect('foo')
    expect(Select.vm.selectedValue).toEqual(['bar'])
  })

  it('can deselect an option when multiple is false', () => {
    const Select = shallowMount(VueSelect, {
      props: {
        reduce: (option) => option.value,
        options: [
          { label: 'This is Foo', value: 'foo' },
          { label: 'This is Bar', value: 'bar' },
        ],
      },
    })

    Select.vm.deselect('foo')
    expect(Select.vm.selectedValue).toEqual([])
  })

  it('can use v-model syntax for a two way binding to a parent component', async () => {
    const Parent = mount({
      data: () => ({
        reduce: (option) => option.value,
        current: 'foo',
        options: [
          { label: 'This is Foo', value: 'foo' },
          { label: 'This is Bar', value: 'bar' },
          { label: 'This is Baz', value: 'baz' },
        ],
      }),
      components: { 'v-select': VueSelect },
      computed: {
        value: {
          get() {
            return this.current
          },
          set(value) {
            if (value == 'baz') return
            this.current = value
          },
        },
      },
      template: `
        <v-select
          v-model="value"
          :reduce="option => option.value"
          :options="options"
        />
      `,
    })
    const Select = Parent.getComponent({ name: 'v-select' })

    expect(Select.vm.modelValue).toEqual('foo')
    expect(Select.vm.selectedValue).toEqual([
      { label: 'This is Foo', value: 'foo' },
    ])

    Select.vm.select({ label: 'This is Bar', value: 'bar' })
    await Select.vm.$nextTick()
    expect(Parent.vm.value).toEqual('bar')
    expect(Select.vm.selectedValue).toEqual([
      { label: 'This is Bar', value: 'bar' },
    ])

    // Parent denies to set baz
    Select.vm.select({ label: 'This is Baz', value: 'baz' })
    await Select.vm.$nextTick()
    expect(Select.vm.selectedValue).toEqual([
      { label: 'This is Bar', value: 'bar' },
    ])
    expect(Parent.vm.value).toEqual('bar')
  })

  it('can generate labels using a custom label key', () => {
    const Select = shallowMount(VueSelect, {
      props: {
        multiple: true,
        reduce: (option) => option.value,
        modelValue: ['CA'],
        label: 'name',
        options: [
          { value: 'CA', name: 'Canada' },
          { value: 'US', name: 'United States' },
        ],
      },
    })

    expect(Select.find('.vs__selected').text()).toContain('Canada')
  })

  it('can find the original option within this.options', () => {
    const optionToFind = { id: 1, label: 'Foo' }
    const Select = shallowMount(VueSelect, {
      props: {
        reduce: (option) => option.id,
        options: [optionToFind, { id: 2, label: 'Bar' }],
      },
    })

    expect(Select.vm.findOptionFromReducedValue(1)).toEqual(optionToFind)
    expect(Select.vm.findOptionFromReducedValue(optionToFind)).toEqual(
      optionToFind
    )
  })

  it('can work with falsey values', () => {
    const option = { value: 0, label: 'No' }
    const Select = shallowMount(VueSelect, {
      props: {
        reduce: (option) => option.value,
        options: [option, { value: 1, label: 'Yes' }],
        modelValue: 0,
      },
    })

    expect(Select.vm.findOptionFromReducedValue(option)).toEqual(option)
    expect(Select.vm.selectedValue).toEqual([option])
  })

  it('works with null values', () => {
    const option = { value: null, label: 'No' }
    const Select = shallowMount(VueSelect, {
      props: {
        reduce: (option) => option.value,
        options: [option, { value: 1, label: 'Yes' }],
        modelValue: null,
      },
    })

    expect(Select.vm.findOptionFromReducedValue(option)).toEqual(option)
    expect(Select.vm.selectedValue).toEqual([option])
  })

  describe('And when a reduced option is a nested object', () => {
    it('can determine if an object is pre-selected', () => {
      const nestedOption = { value: { nested: true }, label: 'foo' }
      const Select = shallowMount(VueSelect, {
        props: {
          reduce: (option) => option.value,
          modelValue: {
            nested: true,
          },
          options: [nestedOption],
        },
      })

      expect(Select.vm.selectedValue).toEqual([nestedOption])
    })

    it('can determine if an object is selected after it is chosen', () => {
      const nestedOption = { value: { nested: true }, label: 'foo' }
      const Select = shallowMount(VueSelect, {
        props: {
          reduce: (option) => option.value,
          options: [nestedOption],
        },
      })

      Select.vm.select(nestedOption)
      expect(Select.vm.isOptionSelected(nestedOption)).toEqual(true)
    })
  })

  it('reacts correctly when value property changes', async () => {
    const optionToChangeTo = { id: 1, label: 'Foo' }
    const Select = shallowMount(VueSelect, {
      props: {
        modelValue: 2,
        reduce: (option) => option.id,
        options: [optionToChangeTo, { id: 2, label: 'Bar' }],
      },
    })

    Select.setProps({ modelValue: optionToChangeTo.id })
    await Select.vm.$nextTick()

    expect(Select.vm.selectedValue).toEqual([optionToChangeTo])
  })

  describe('Reducing Tags', () => {
    it('tracks values that have been created by the user', async () => {
      const Parent = mount({
        data: () => ({ selected: null, options: [] }),
        template: `
          <v-select
            v-model="selected"
            :options="options"
            taggable
            :reduce="name => name.value"
            :create-option="label => ({ label, value: -1 })"
          />
        `,
        components: { 'v-select': VueSelect },
      })
      const Select = Parent.getComponent({ name: 'v-select' })

      //  When
      await Select.get('input').trigger('focus')

      Select.vm.search = 'hello'
      await Select.vm.$nextTick()

      Select.vm.typeAheadSelect()
      await Select.vm.$nextTick()

      //  Then
      expect(Select.vm.selectedValue).toEqual([{ label: 'hello', value: -1 }])
      expect(Select.vm.$refs.selectedOptions.textContent.trim()).toEqual(
        'hello'
      )
      expect(Parent.vm.selected).toEqual(-1)
    })
  })

  //  Regression coverage for the reduce-collision tie-break documented in
  //  findOptionFromReducedValue (see
  //  https://github.com/sagalbot/vue-select/issues/1089#issuecomment-597238735).
  //  When two different option objects reduce to the same value (taggable +
  //  reduce with a create-option that isn't unique), a naive `matches[0]`
  //  lookup would silently pick whichever one happens to be first in the
  //  array. The real fix disambiguates using `_lastResolvedValue` — the
  //  option resolved on the *previous* read — so a stable selection doesn't
  //  flip to a different option just because the options array was
  //  reordered. This path had zero test coverage before this session.
  describe('Reduce collision tie-break (#1089)', () => {
    it('prefers the previously-resolved option over the first array match when two options share a reduced value', async () => {
      const optionA = { id: 1, label: 'A' }
      const optionB = { id: 2, label: 'B' }

      const Select = shallowMount(VueSelect, {
        props: {
          reduce: () => 'dup',
          modelValue: 'dup',
          options: [optionA, optionB],
        },
      })

      //  Establish optionA as the previously-resolved match (this is
      //  `_lastResolvedValue` bookkeeping — a plain instance field, not
      //  reactive state — normally populated by a prior `resolvedValue`
      //  read; set directly here so the test is deterministic about what
      //  it's exercising instead of depending on incidental mount timing).
      Select.vm._lastResolvedValue = optionA

      //  Both options reduce to the same value, so `matches.length` is 2
      //  and the tie-break in `findOptionFromReducedValue` must run. optionB
      //  is first in the array — if the tie-break were absent (or just
      //  returned matches[0]), this would resolve to optionB instead of
      //  the previously-resolved optionA.
      await Select.setProps({ options: [optionB, optionA] })

      expect(Select.vm.selectedValue).toEqual([optionA])
    })

    it('falls back to the raw value when there is no previously-resolved match to disambiguate with', () => {
      const optionA = { id: 1, label: 'A' }
      const optionB = { id: 2, label: 'B' }

      //  getOptionKey(null) can't stringify a null option and warns —
      //  expected here since `_lastResolvedValue` starts out null.
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      //  Mounting directly with a collision already present and no prior
      //  resolution: `_lastResolvedValue` is still null, so the `.find()`
      //  tie-break can't match anything and falls through to `|| value`.
      const Select = shallowMount(VueSelect, {
        props: {
          reduce: () => 'dup',
          modelValue: 'dup',
          options: [optionB, optionA],
        },
      })

      expect(Select.vm.selectedValue).toEqual(['dup'])

      warnSpy.mockRestore()
    })
  })
})
