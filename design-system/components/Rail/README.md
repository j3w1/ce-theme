# Rail

A horizontally scrolling list that shows part of the next card, so people know there is more. Used for product carousels, ideas and collections.

## Classes

- `ce-rail`: a native scroll container with snap points and a thin ink-on-grey track. Visible columns come from `--ce-columns` (1.4 on phones, 2.5 from 640px, 5.5 from 1024px); `ce-rail--wide` shows 3.5 on desktop. 20px gaps.
- `ce-rail-intro`: an optional first card on the subtle surface (or a campaign surface) with a heading and a `ce-arrow-link`.
- `ce-card-link`: image card with `ce-card-link-title` (label and arrow) below; `--contain` for catalogue cut-outs. `ce-pill-card` shows the label as a white pill over a 3:4 photo.
- `ce-rail-buttons`: prev/next `ce-icon-button`s from 640px, with `aria-controls` pointing at the rail; `enhanceRails()` scrolls by one view and disables them at the ends.
- `ce-section-head`: heading, short description and an outline button. Put a `ce-skip` link (“Saltar lista”) before long rails.

## The consumer supplies

The items (product cards or links), their images and the section heading.

## Do and don't

- Do keep the rail usable without the buttons: touch, trackpad and keyboard scrolling all work.
- Do label the list (`aria-label`) and every button.
- Don't auto-advance a rail.
