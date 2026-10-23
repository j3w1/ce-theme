# CategoryRail

Category shortcuts: a scrolling row of pills with round thumbnails, and square category tiles on the subtle surface at the top of a listing.

## Classes

- `ce-category-rail`: a horizontally scrolling list (no visible scrollbar) of `ce-category-link` pills, 48px tall on `ce-color-surface-subtle`, with a 40px round thumbnail (`img`) or an icon. `aria-current` marks the current category with an ink ring.
- `ce-category-tiles` > `ce-category-tile`: square-cornered tiles with a contained product cut-out and a label; they scroll on phones and wrap into a grid from 640px.

## The consumer supplies

The category tree, labels and one approved cut-out per category from the catalogue.

## Do and don't

- Do keep labels short and in sentence case.
- Do wrap the rail in a `nav` with a label (“Categorías”).
- Don't use lifestyle photos in the pill thumbnails; they become unreadable at 40px.
