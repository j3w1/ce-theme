# IconButton

48px circular button holding a single outlined icon, for compact actions such as save, add to bag or next.

## Classes

- `ce-icon-button`: white, `ce-color-border-default` ring, subtle fill on hover.
- `ce-icon-button--ink`: ink fill with a white icon, for a strong “go” arrow.

## The consumer supplies

An accessible name (`aria-label` in Spanish, such as “Guardar producto”) and one inline SVG from Assets → Icons drawn with `stroke="currentColor"`, `aria-hidden="true"` and `focusable="false"`. Inside a product card it sits at the bottom right of `ce-product-media`.

## Do and don't

- Do use the 24px outlined icon set at its 1.7 stroke.
- Don't use an icon button without an accessible name, or for an action people won't recognise from the icon alone.
