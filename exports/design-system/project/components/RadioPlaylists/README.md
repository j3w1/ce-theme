# RadioPlaylists

The CE Radio playlist sheet: two groups of official playlists, opened from the playlist chip.

## Classes

- `ce-radio-sheet` with `ce-radio-groups` and the footer `ce-radio-sheet-footer` (its close button never scrolls away).
- `ce-radio-group`, `ce-radio-group-title`, `ce-radio-cards` (three columns), `ce-radio-card` (`aria-current="true"` for the current list, with a `ce-radio-live` dot while it plays).
- `ce-radio-group--navidad`: the Christmas group's own pine surface and striped edge.

## The consumer supplies

The playlist names and groups, in the application's order. Choosing a card plays that list and closes the sheet.

## Do and don't

- Do keep card names on one line with an ellipsis; the full name is available to assistive technology.
- Don't add playlists or rename them here; the application owns the official list.
