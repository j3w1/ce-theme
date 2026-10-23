# Chip

Pill-shaped filter or navigation choice on a subtle grey ground, with an ink ring when selected.

## Classes

- `ce-chip`: `ce-color-surface-subtle` fill, 44px tall, pill radius.
- Selected: `aria-pressed="true"` on a toggle button or `aria-current="page"` on a navigation link draws a 2px ink ring.

## The consumer supplies

A group (`role="group"` with an `aria-label`) of native buttons or links with short Spanish labels (“Todos”, “Cocina”). The application implements the filtering or navigation and updates the pressed or current state.

## Do and don't

- Do show exactly one selected chip in a single-choice group.
- Don't use chips as primary actions.
