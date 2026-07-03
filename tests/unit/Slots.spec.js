import { it, test, describe, expect, vi } from 'vitest'
import { h, reactive, toRaw } from 'vue'
import { mountDefault } from '@tests/helpers.js'

describe('Scoped Slots', () => {
  it('receives an option object to the selected-option-container slot', () => {
    const Select = mountDefault(
      { modelValue: 'one' },
      {
        slots: {
          'selected-option-container': (slotProps) =>
            h(
              'span',
              { slot: 'selected-option-container' },
              slotProps.option.label
            ),
        },
      }
    )

    expect(Select.get('.vs__selected-options').text()).toEqual('one')
  })

  describe('Slot: selected-option', () => {
    it('receives an option object to the selected-option slot', () => {
      const Select = mountDefault(
        { modelValue: 'one' },
        {
          slots: {
            'selected-option': (slotProps) =>
              h('span', { slot: 'selected-option' }, slotProps.label),
          },
        }
      )

      expect(Select.get('.vs__selected').text()).toEqual('one')
    })

    it('opens the dropdown when clicking an option in selected-option slot', () => {
      const Select = mountDefault(
        { modelValue: 'one' },
        {
          slots: {
            'selected-option': (slotProps) =>
              h('span', { class: 'my-option' }, slotProps.label),
          },
        }
      )

      Select.get('.my-option').trigger('mousedown')
      expect(Select.vm.open).toEqual(true)
    })
  })

  describe('Slot: clear', () => {
    it('renders the default clear button when the slot is not provided', () => {
      const Select = mountDefault({ modelValue: 'one' })
      expect(Select.find('.vs__clear').exists()).toEqual(true)
    })

    it('default clear button registers its ref and clears on click', async () => {
      const Select = mountDefault({ modelValue: 'one' })

      //  `ref`/`onClick` now come from `scope.clear.attributes`; make sure
      //  binding them via `v-bind` still wires the ref (used by
      //  `toggleDropdown`) and the click handler.
      expect(Select.vm.$refs.clearButton).toBeTruthy()

      await Select.get('.vs__clear').trigger('click')
      expect(Select.emitted('update:modelValue')[0]).toEqual([null])
    })

    it('replaces the clear button with custom content', () => {
      const Select = mountDefault(
        { modelValue: 'one' },
        {
          slots: {
            clear: (slotProps) =>
              h(
                'button',
                { class: 'my-clear', onClick: slotProps.clearSelection },
                'x'
              ),
          },
        }
      )

      expect(Select.find('.vs__clear').exists()).toEqual(false)
      expect(Select.get('.my-clear').text()).toEqual('x')
    })

    it('exposes clear state and a clearSelection function to the slot', () => {
      const clear = vi.fn()
      mountDefault({ modelValue: 'one' }, { slots: { clear } })

      const slotProps = clear.mock.calls[0][0]
      expect(slotProps.canClear).toEqual(true)
      expect(typeof slotProps.clearSelection).toEqual('function')
    })

    it('clears the selection when the slotted clearSelection is called', async () => {
      const Select = mountDefault(
        { modelValue: 'one' },
        {
          slots: {
            clear: (slotProps) =>
              h('button', {
                class: 'my-clear',
                onClick: slotProps.clearSelection,
              }),
          },
        }
      )

      await Select.get('.my-clear').trigger('click')
      expect(Select.emitted('update:modelValue')[0]).toEqual([null])
    })
  })

  describe('Slot: deselect', () => {
    it('customizes the per-tag deselect button in multiple mode', () => {
      const Select = mountDefault(
        { multiple: true, modelValue: ['one'] },
        {
          slots: {
            deselect: (slotProps) =>
              h('span', { class: 'my-deselect' }, slotProps.option.label),
          },
        }
      )

      expect(Select.get('.my-deselect').text()).toEqual('one')
    })

    it('deselects the option when the slotted deselect is called', async () => {
      const Select = mountDefault(
        { multiple: true, modelValue: ['one', 'two'] },
        {
          slots: {
            deselect: (slotProps) =>
              h('span', {
                class: 'my-deselect',
                onClick: () => slotProps.deselect(),
              }),
          },
        }
      )

      await Select.get('.my-deselect').trigger('click')
      expect(Select.emitted('update:modelValue')[0]).toEqual([['two']])
    })
  })

  it('receives an option object to the option slot in the dropdown menu', async () => {
    const Select = mountDefault(
      { modelValue: 'one' },
      {
        slots: {
          option: (slotProps) => h('span', { slot: 'option' }, slotProps.label),
        },
      }
    )

    Select.vm.open = true
    await Select.vm.$nextTick()

    expect(Select.get('.vs__dropdown-menu').text()).toEqual('onetwothree')
  })

  it('noOptions slot receives the current search text', async () => {
    const noOptions = vi.fn()
    const Select = mountDefault(
      {},
      {
        slots: { 'no-options': noOptions },
      }
    )

    Select.vm.search = 'something not there'
    Select.vm.open = true
    await Select.vm.$nextTick()

    expect(noOptions).toHaveBeenCalledWith({
      loading: false,
      search: 'something not there',
      searching: true,
    })
  })

  test('header slot props', async () => {
    const header = vi.fn()
    const Select = mountDefault(
      {},
      {
        slots: { header: header },
      }
    )
    await Select.vm.$nextTick()
    expect(Object.keys(header.mock.calls[0][0])).toEqual([
      'search',
      'loading',
      'searching',
      'filteredOptions',
      'deselect',
    ])
  })

  test('footer slot props', async () => {
    const footer = vi.fn()
    const Select = mountDefault(
      {},
      {
        slots: { footer: footer },
      }
    )
    await Select.vm.$nextTick()
    expect(Object.keys(footer.mock.calls[0][0])).toEqual([
      'search',
      'loading',
      'searching',
      'filteredOptions',
      'deselect',
    ])
  })

  test('list-header slot props', async () => {
    const header = vi.fn()
    const Select = mountDefault(
      {},
      {
        slots: { 'list-header': header },
      }
    )
    Select.vm.open = true
    await Select.vm.$nextTick()
    expect(Object.keys(header.mock.calls[0][0])).toEqual([
      'search',
      'loading',
      'searching',
      'filteredOptions',
    ])
  })

  describe('Class-instance options keep identity and getters (#1857)', () => {
    //  Model class with "virtual" prototype getters, as commonly produced
    //  by ORMs (Sequelize/Mongoose) or domain model classes.
    class Person {
      constructor(firstName, lastName) {
        this.firstName = firstName
        this.lastName = lastName
      }
      get label() {
        return this.fullName
      }
      get fullName() {
        return `${this.firstName} ${this.lastName}`
      }
    }

    it('option slot receives the original instance via the `option` slot prop', async () => {
      const alice = new Person('Alice', 'Smith')
      const option = vi.fn(() => null)
      const Select = mountDefault({ options: [alice] }, { slots: { option } })

      Select.vm.open = true
      await Select.vm.$nextTick()

      const slotProps = option.mock.calls[0][0]
      expect(toRaw(slotProps.option)).toBe(alice)
      expect(slotProps.option.fullName).toBe('Alice Smith')
    })

    it('keeps getters usable when options are reactive (the #1857 repro)', async () => {
      //  The reporter bound options from a ref()/reactive() array. Vue's
      //  renderSlot clones reactive slot-prop objects with a plain-object
      //  spread, which strips prototype getters — the raw `option` slot
      //  prop must survive that.
      const alice = new Person('Alice', 'Smith')
      const option = vi.fn(() => null)
      const Select = mountDefault(
        { options: reactive([alice]) },
        { slots: { option } }
      )

      Select.vm.open = true
      await Select.vm.$nextTick()

      const slotProps = option.mock.calls[0][0]
      expect(slotProps.option.fullName).toBe('Alice Smith')
      expect(toRaw(slotProps.option)).toBe(alice)
    })

    it('selected-option slot receives the original instance via `option`', () => {
      const alice = new Person('Alice', 'Smith')
      const selectedOption = vi.fn(() => null)
      mountDefault(
        { options: [alice], modelValue: alice },
        { slots: { 'selected-option': selectedOption } }
      )

      const slotProps = selectedOption.mock.calls[0][0]
      expect(toRaw(slotProps.option)).toBe(alice)
      expect(slotProps.option.fullName).toBe('Alice Smith')
    })

    it('getOptionLabel resolves a label defined as a prototype getter', () => {
      const alice = new Person('Alice', 'Smith')
      const spy = vi.spyOn(console, 'warn')
      const Select = mountDefault({ options: [alice], modelValue: alice })

      expect(Select.vm.getOptionLabel(alice)).toBe('Alice Smith')
      expect(Select.get('.vs__selected').text()).toBe('Alice Smith')
      expect(spy).not.toHaveBeenCalled()

      //  Filtering goes through getOptionLabel too.
      Select.vm.search = 'smith'
      expect(Select.vm.filteredOptions).toEqual([alice])

      spy.mockRestore()
    })
  })

  test('list-footer slot props', async () => {
    const footer = vi.fn()
    const Select = mountDefault(
      {},
      {
        slots: { 'list-footer': footer },
      }
    )
    Select.vm.open = true
    await Select.vm.$nextTick()
    expect(Object.keys(footer.mock.calls[0][0])).toEqual([
      'search',
      'loading',
      'searching',
      'filteredOptions',
    ])
  })
})
