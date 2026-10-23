# Table

Neutral data table for internal tools: subtle header, hairline rows and 16px cells.

## Classes

- `ce-table`: full width, 14px text, `ce-color-border-default` row rules; `th` on `ce-color-surface-subtle`.

## The consumer supplies

A native `<table>` with a `caption` (visible or `ce-sr-only`) and `scope` on header cells. Codes go in `ce-code`; states in `ce-status`. Wrap wide tables in their own horizontally scrolling container.

## Do and don't

- Do keep internal tools neutral; brand red is not an error color.
- Don't color whole rows to show state; use a `Status` cell.
