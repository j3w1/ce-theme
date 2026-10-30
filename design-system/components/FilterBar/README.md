# FilterBar

Listing controls: quick filter chips with the result count, removable active filters, and from 1024px a sticky sidebar of filter groups. On smaller screens the groups move into a filter drawer.

## Classes

- `ce-listing`: one column, then from 1024px a 264px `ce-listing-aside` (sticky, scrolls on its own) beside the results. Listing grids show 2 / 3 / 3 + sidebar / 4 + sidebar (from 1300px) columns.
- `ce-filter-bar` (`--sticky`) > `ce-filter-chips`: a scrolling group of `ce-chip` buttons. Toggle chips use `aria-pressed`; the “Filtros” chip opens the drawer (add `data-ce-filters` to hide it when the sidebar shows); `ce-chip-count` shows active filters.
- `ce-result-count`: `role="status"` text such as “4 productos”.
- `ce-active-filters`: removable `ce-token`s with a named remove button.
- Groups: `ce-disclosure` with `ce-option-list` of `ce-check` options and `ce-option-count`.
- Drawer: `ce-drawer` with `ce-dialog-header`, `ce-dialog-body` and a `ce-dialog-footer` (“Limpiar”, “Ver 4 productos”). Load more: `ce-load-more` with a `ce-progress`.

## The consumer supplies

Facets, counts and sort options from the search service, the active filters and the result count.

## Do and don't

- Do update the result count in the live region when filters change.
- Do keep the filter labels in the customer's words, not internal field names.
- Don't hide the only way to remove a filter inside the drawer; active filters stay visible above the grid.
