export default {
  props: {
    autoscroll: {
      type: Boolean,
      default: true,
    },
  },

  watch: {
    typeAheadPointer() {
      if (this.autoscroll) {
        this.maybeAdjustScroll()
      }
    },
    open(open) {
      if (this.autoscroll && open) {
        this.$nextTick(() => this.maybeAdjustScroll())
      }
    },
  },

  methods: {
    /**
     * Adjust the scroll position of the dropdown list
     * if the current pointer is outside of the
     * overflow bounds.
     * @returns {*}
     */
    maybeAdjustScroll() {
      const menu = this.$refs.dropdownMenu
      const index = this.typeAheadPointer
      if (!menu || index < 0 || index >= this.filteredOptions.length) return

      const optionEl = menu.querySelector(`[data-option-index="${index}"]`)

      if (optionEl) {
        const bounds = this.getDropdownViewport()
        const { top, bottom, height } = optionEl.getBoundingClientRect()

        if (top < bounds.top) {
          menu.scrollTop = optionEl.offsetTop
        } else if (bottom > bounds.bottom) {
          menu.scrollTop = optionEl.offsetTop - (bounds.height - height)
        }
      } else if (this.virtualScroll) {
        menu.scrollTop = index * this.virtualScrollRowHeight
      }

      if (this.virtualScroll) {
        this.virtualScrollTop = menu.scrollTop
      }
    },

    /**
     * The currently viewable portion of the dropdownMenu.
     * @returns {{top: (string|*|number), bottom: *}}
     */
    getDropdownViewport() {
      return this.$refs.dropdownMenu
        ? this.$refs.dropdownMenu.getBoundingClientRect()
        : {
            height: 0,
            top: 0,
            bottom: 0,
          }
    },
  },
}
