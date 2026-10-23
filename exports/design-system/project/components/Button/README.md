# Button

Pill-shaped native button or link for the main action in a context; use one primary button per view.

## Classes

- `ce-button`: primary. `ce-color-action-primary-bg` fill, white label, darkens on hover (`-hover`) and press (`-active`).
- `ce-button--secondary`: white with a `ce-color-border-control` border, for supporting actions.
- `ce-button--ink`: ink fill (`ce-color-surface-inverse`) for actions on yellow or photographic grounds.
- Native `disabled` drops to 45% opacity; `aria-busy="true"` shows a progress cursor.

## The consumer supplies

A native `<button type="button">` (or `<a>` for navigation) with a short Spanish verb phrase in sentence case: “Ver productos”, “Conocer más”. An icon may follow the label inside the button. The application wires the action.

## Do and don't

- Do keep the minimum 48px height and pill radius (`ce-radius-pill`).
- Don't fill a button with `ce-color-brand-red`; small white text needs the darker action red.
- Don't place two primary buttons side by side.
