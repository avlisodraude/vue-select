import { it, describe, expect, vi, afterEach } from 'vitest'
import pointerScroll from '@/mixins/pointerScroll.js'
import { mountDefault } from '@tests/helpers.js'

describe('Automatic Scrolling', () => {
  let spy

  afterEach(() => {
    if (spy) spy.mockClear()
  })

  it('should check if the scroll position needs to be adjusted on up arrow keyUp', async () => {
    //  Given
    spy = vi.spyOn(pointerScroll.methods, 'maybeAdjustScroll')
    const Select = mountDefault()
    Select.vm.typeAheadPointer = 1

    //  When
    await Select.get('input').trigger('keydown.up')

    //  Then
    expect(spy).toHaveBeenCalled()
  })

  it('should check if the scroll position needs to be adjusted on down arrow keyUp', async () => {
    //  Given
    spy = vi.spyOn(pointerScroll.methods, 'maybeAdjustScroll')
    const Select = mountDefault()
    Select.vm.typeAheadPointer = 1

    //  When
    await Select.get('input').trigger('keydown.down')

    //  Then
    expect(spy).toHaveBeenCalled()
  })

  it('should check if the scroll position needs to be adjusted when filtered options changes', async () => {
    //  Given
    spy = vi.spyOn(pointerScroll.methods, 'maybeAdjustScroll')
    const Select = mountDefault()
    Select.vm.typeAheadPointer = 1

    //  When
    Select.vm.search = 'two'
    await Select.vm.$nextTick()

    //  Then
    expect(spy).toHaveBeenCalled()
  })

  it('should not adjust scroll position when autoscroll is false', async () => {
    //  Given
    spy = vi.spyOn(pointerScroll.methods, 'maybeAdjustScroll')
    const Select = mountDefault({
      autoscroll: false,
    })
    Select.vm.typeAheadPointer = 1

    // When
    Select.vm.search = 'two'
    await Select.vm.$nextTick()

    //  Then
    expect(spy).toHaveBeenCalledTimes(0)
  })

  //  The tests above only assert that maybeAdjustScroll() was *called* —
  //  none of them exercise its actual scroll-adjustment math (the
  //  above/below-viewport branches in pointerScroll.js), so that logic
  //  had zero coverage. jsdom doesn't compute real layout, so
  //  getBoundingClientRect() is stubbed per-element to simulate an
  //  option sitting above or below the visible dropdown viewport.
  describe('maybeAdjustScroll scroll-position math', () => {
    it('scrolls up when the pointed-to option is above the visible viewport', async () => {
      const Select = mountDefault({ options: ['one', 'two', 'three'] })
      Select.vm.open = true
      await Select.vm.$nextTick()
      const menu = Select.vm.$refs.dropdownMenu
      const optionEl = menu.children[1]

      vi.spyOn(menu, 'getBoundingClientRect').mockReturnValue({
        top: 50,
        bottom: 150,
        height: 100,
      })
      vi.spyOn(optionEl, 'getBoundingClientRect').mockReturnValue({
        top: 10, // above the viewport's top (50)
        bottom: 40,
        height: 30,
      })
      Object.defineProperty(optionEl, 'offsetTop', { value: 5, configurable: true })
      menu.scrollTop = 100

      Select.vm.typeAheadPointer = 1
      Select.vm.maybeAdjustScroll()

      expect(menu.scrollTop).toEqual(5)
    })

    it('scrolls down when the pointed-to option is below the visible viewport', async () => {
      const Select = mountDefault({ options: ['one', 'two', 'three'] })
      Select.vm.open = true
      await Select.vm.$nextTick()
      const menu = Select.vm.$refs.dropdownMenu
      const optionEl = menu.children[2]

      vi.spyOn(menu, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        bottom: 100,
        height: 100,
      })
      vi.spyOn(optionEl, 'getBoundingClientRect').mockReturnValue({
        top: 90,
        bottom: 140, // below the viewport's bottom (100)
        height: 50,
      })
      Object.defineProperty(optionEl, 'offsetTop', { value: 200, configurable: true })
      menu.scrollTop = 0

      Select.vm.typeAheadPointer = 2
      Select.vm.maybeAdjustScroll()

      //  optionEl.offsetTop - (viewport.height - optionEl.height) = 200 - (100 - 50) = 150
      expect(menu.scrollTop).toEqual(150)
    })

    it('does nothing when the option is already fully within the viewport', async () => {
      const Select = mountDefault({ options: ['one', 'two', 'three'] })
      Select.vm.open = true
      await Select.vm.$nextTick()
      const menu = Select.vm.$refs.dropdownMenu
      const optionEl = menu.children[0]

      vi.spyOn(menu, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        bottom: 100,
        height: 100,
      })
      vi.spyOn(optionEl, 'getBoundingClientRect').mockReturnValue({
        top: 10,
        bottom: 40,
        height: 30,
      })
      menu.scrollTop = 5

      Select.vm.typeAheadPointer = 0
      Select.vm.maybeAdjustScroll()

      expect(menu.scrollTop).toEqual(5)
    })

    it('getDropdownViewport falls back to a zeroed rect when the dropdown menu ref is absent', () => {
      const Select = mountDefault({ options: ['one'] })

      //  Dropdown is closed, so $refs.dropdownMenu is undefined — this
      //  fallback branch had zero coverage before this session.
      expect(Select.vm.open).toEqual(false)
      expect(Select.vm.getDropdownViewport()).toEqual({
        height: 0,
        top: 0,
        bottom: 0,
      })
    })

    it('maybeAdjustScroll is a no-op when there is no option at the current pointer', async () => {
      const Select = mountDefault({ options: ['one', 'two', 'three'] })
      Select.vm.open = true
      await Select.vm.$nextTick()
      const menu = Select.vm.$refs.dropdownMenu
      menu.scrollTop = 42

      //  Pointer index has no corresponding rendered option.
      Select.vm.typeAheadPointer = 99

      expect(() => Select.vm.maybeAdjustScroll()).not.toThrow()
      expect(menu.scrollTop).toEqual(42)
    })
  })
})
