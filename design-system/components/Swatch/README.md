# Swatch

28px round product-color choice with a control border and a focus-style ring when selected.

## Classes

- `ce-swatches`: the row. `ce-swatch`: one color, bordered with `ce-color-border-control`.
- Selected: `aria-pressed="true"` draws a 2px ink outline with a 3px offset.

## The consumer supplies

The product's own color as an inline `background`, and the color's Spanish name as `aria-label` (“Blanco”, “Negro”). Product colors are data, not new brand colors.

## Do and don't

- Do keep the visible border so white and pale products stay distinguishable.
- Don't rely on the swatch alone: show the selected color's name nearby when it matters.
