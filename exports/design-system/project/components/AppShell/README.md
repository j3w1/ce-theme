# AppShell

The frame for CE Systems, CE Meta and other internal tools: app bar, module navigation, page header and a dense data table with bulk actions. Same tokens and type as the store, more information per screen, no decorative photography.

## Classes

- `ce-app`: app bar across the top, 240px `ce-module-nav` beside `ce-app-main`; below 1024px the module nav becomes a scrolling top row.
- `ce-app-bar`: `ce-app-brand` (square logo), `ce-app-search` (a `ce-search`), `ce-app-context` (store `ce-select`, role `ce-pill`).
- `ce-module-nav`: group headings (`h2`) and links; `aria-current` marks the module.
- `data-ce-density="compact|touch"` on any container sets control and row sizes (`--ce-control`, `--ce-row`, `--ce-cell-pad`); comfortable is the default.
- `ce-page-header` (`h1`/`h2` + `ce-page-actions`), `ce-table-toolbar`, `ce-table-wrap` > `ce-data-table` (sticky header, `is-number`, `is-wrap`, `is-select`, `aria-selected` rows), `ce-sort` inside `th[aria-sort]`, `ce-thumb`, `ce-unknown`, `ce-bulk-bar`, `ce-table-footer`, `ce-pill--success|warning|danger|info`. Tabs between screens use `ce-tabs`.

## The consumer supplies

Records, sorting, selection, permissions and every workflow state. Codes in `ce-code` with the on-screen number underline; missing values shown as `ce-unknown` in words.

## Do and don't

- Do keep compact rows at 40px or more and every control labelled.
- Do show permissions as presentation (`ce-locked`, disabled items with a reason); the service enforces them.
- Don't show procurement amounts (CNY) as selling prices.
