## Default

With the default CSS, Vue Select uses absolute positioning to render the dropdown menu. The root
`.v-select` container (the components `$el`) is used as the `relative` parent for the dropdown. The
dropdown will be displayed below the `$el` regardless of the available space.

This works for most cases, but you might run into issues placing into a modal or near the bottom of
the viewport. If you need more fine grain control, you can use calculated positioning.

## Calculated <Badge text="v3.7.0+" />

If you want more control over how the dropdown is rendered, or if you're running into z-index issues,
you may use the `appendToBody` boolean prop. When enabled, Vue Select will append the dropdown to
the document, outside of the `.v-select` container, and position it with Javscript.

When `appendToBody` is true, the positioning will be handled by the `calculatePosition` prop. This
function is responsible for setting top/left absolute positioning values for the dropdown. The
default implementation places the dropdown in the same position that it would normally appear.

## Floating UI Integration <Badge text="v3.7.0+" />

[Floating UI](https://floating-ui.com/) is a small, low-level library for positioning floating
elements (dropdowns, tooltips, popovers) relative to another element. It flips the dropdown near
viewport edges, keeps it anchored to the toggle on scroll and resize, and works correctly inside
scrollable containers.

By using the `appendToBody` and `calculatePosition` props, we're able to integrate directly with
Floating UI to calculate positioning for us.

<PositionedWithFloatingUI />

Check out the [Floating UI middleware docs](https://floating-ui.com/docs/middleware) to see the
`flip`, `shift`, and `offset` middleware being used below.

<<< @/.vuepress/components/PositionedWithFloatingUI.vue{25-71}
