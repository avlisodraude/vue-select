import { it, describe, expect, vi, afterEach } from 'vitest'
import appendToBody from '@/directives/appendToBody.js'

//  appendToBody had zero test coverage before this session (0/32 lines
//  in the coverage report) — nothing exercised either lifecycle hook.
//  It's tested directly as a plain directive object here (mounted/
//  unmounted are just functions of (el, { instance })) rather than via
//  a full Select mount, since jsdom doesn't compute real layout and the
//  directive's own contract is simple enough to stub directly.
describe('appendToBody directive', () => {
  afterEach(() => {
    //  Some tests really do append into document.body; keep the real DOM
    //  clean between tests regardless of pass/fail.
    document.querySelectorAll('ul[data-test-dropdown]').forEach((el) => {
      el.remove()
    })
  })

  function makeInstance(overrides = {}) {
    return {
      appendToBody: true,
      calculatePosition: vi.fn((dropdownList, component, { width, top, left }) => {
        dropdownList.style.top = top
        dropdownList.style.left = left
        dropdownList.style.width = width
      }),
      $refs: {
        toggle: {
          getBoundingClientRect: () => ({
            height: 40,
            top: 100,
            left: 50,
            width: 200,
          }),
        },
      },
      ...overrides,
    }
  }

  function makeEl() {
    const el = document.createElement('ul')
    el.setAttribute('data-test-dropdown', '')
    return el
  }

  describe('mounted', () => {
    it('appends the element to document.body and positions it via calculatePosition when appendToBody is true', () => {
      const el = makeEl()
      const instance = makeInstance()

      appendToBody.mounted(el, { instance })

      expect(el.parentNode).toEqual(document.body)
      expect(instance.calculatePosition).toHaveBeenCalledWith(
        el,
        instance,
        expect.objectContaining({
          width: '200px',
          //  scrollX/scrollY default to 0 in this jsdom environment.
          left: '50px',
          top: '140px', // scrollY(0) + top(100) + height(40)
        })
      )
      expect(el.style.width).toEqual('200px')
    })

    it('stores whatever calculatePosition returns as el.unbindPosition', () => {
      const el = makeEl()
      const unbindFn = vi.fn()
      const instance = makeInstance({
        calculatePosition: vi.fn(() => unbindFn),
      })

      appendToBody.mounted(el, { instance })

      expect(el.unbindPosition).toEqual(unbindFn)
    })

    it('does nothing when appendToBody is false', () => {
      const el = makeEl()
      const instance = makeInstance({ appendToBody: false })

      appendToBody.mounted(el, { instance })

      expect(el.parentNode).toBeNull()
      expect(instance.calculatePosition).not.toHaveBeenCalled()
      expect(el.unbindPosition).toBeUndefined()
    })
  })

  describe('unmounted', () => {
    it('calls el.unbindPosition() when it is a function', () => {
      const el = makeEl()
      const unbindFn = vi.fn()
      el.unbindPosition = unbindFn
      document.body.appendChild(el)
      const instance = makeInstance()

      appendToBody.unmounted(el, { instance })

      expect(unbindFn).toHaveBeenCalledTimes(1)
    })

    it('removes the element from its parent', () => {
      const el = makeEl()
      document.body.appendChild(el)
      expect(el.parentNode).toEqual(document.body)
      const instance = makeInstance()

      appendToBody.unmounted(el, { instance })

      expect(el.parentNode).toBeNull()
    })

    it('does not throw when unbindPosition was never set (the default calculatePosition returns nothing)', () => {
      const el = makeEl()
      document.body.appendChild(el)
      const instance = makeInstance()

      expect(() => appendToBody.unmounted(el, { instance })).not.toThrow()
      expect(el.parentNode).toBeNull()
    })

    it('does nothing when appendToBody is false, even if unbindPosition/parentNode are set', () => {
      const el = makeEl()
      const unbindFn = vi.fn()
      el.unbindPosition = unbindFn
      document.body.appendChild(el)
      const instance = makeInstance({ appendToBody: false })

      appendToBody.unmounted(el, { instance })

      expect(unbindFn).not.toHaveBeenCalled()
      expect(el.parentNode).toEqual(document.body)
    })
  })
})
