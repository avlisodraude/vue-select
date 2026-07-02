<template>
  <div>
    <v-select
      :options="countries"
      append-to-body
      :calculate-position="withFloatingUI"
    />

    <label for="position" style="display: block; margin: 1rem 0">
      <input
        id="position"
        v-model="placement"
        type="checkbox"
        true-value="top"
        false-value="bottom"
      />
      Position dropdown above
    </label>
  </div>
</template>

<script>
import countries from '../data/countries'
import { computePosition, autoUpdate, flip, shift, offset } from '@floating-ui/dom'

export default {
  data: () => ({ countries, placement: 'top' }),
  methods: {
    withFloatingUI(dropdownList, component, { width }) {
      /**
       * We need to explicitly define the dropdown width since
       * it is usually inherited from the parent with CSS.
       */
      dropdownList.style.width = width

      /**
       * Here we position the dropdownList relative to the $refs.toggle Element.
       *
       * `offset(-1)` overlaps the $refs.toggle and the dropdownList by 1 pixel,
       * matching the seam between the toggle and the menu.
       *
       * `flip()` swaps the placement (e.g. bottom -> top) when there isn't
       * enough room near a viewport edge, and `shift()` slides the dropdown
       * along the cross axis so it stays within view near the left/right edges.
       */
      const updatePosition = () => {
        computePosition(component.$refs.toggle, dropdownList, {
          placement: this.placement,
          middleware: [offset(-1), flip(), shift({ padding: 4 })],
        }).then(({ x, y, placement }) => {
          Object.assign(dropdownList.style, {
            position: 'absolute',
            left: `${x}px`,
            top: `${y}px`,
          })

          /**
           * Expose the resolved placement so we can style the dropdown when
           * it flips above the toggle. The 'drop-up' class on the Vue Select
           * wrapper handles the toggle's borders; the `data-placement`
           * attribute handles the dropdown menu's own styles.
           */
          dropdownList.setAttribute('data-placement', placement)
          component.$el.classList.toggle('drop-up', placement.startsWith('top'))
        })
      }

      /**
       * `autoUpdate` re-runs `updatePosition` whenever the toggle moves —
       * on scroll (including inside scrollable ancestor containers), on
       * resize, and when layout shifts. It returns a cleanup function.
       *
       * To prevent memory leaks the listeners need to be removed. If you
       * return a function from `calculatePosition`, it will be called just
       * before the dropdown is removed from the DOM.
       */
      return autoUpdate(component.$refs.toggle, dropdownList, updatePosition)
    },
  },
}
</script>

<style>
.v-select.drop-up.vs--open .vs__dropdown-toggle {
  border-radius: 0 0 4px 4px;
  border-top-color: transparent;
  border-bottom-color: rgba(60, 60, 60, 0.26);
}

[data-placement^='top'] {
  border-radius: 4px 4px 0 0;
  border-top-style: solid;
  border-bottom-style: none;
  box-shadow: 0 -3px 6px rgba(0, 0, 0, 0.15);
}
</style>
