# AppShell

The frame for CE Systems, CE Meta and other internal tools: app bar, module navigation, page header and a dense data table with bulk actions. Same tokens and type as the store, more information per screen, no decorative photography.

## Classes

- `ce-app`: app bar across the top, 240px `ce-module-nav` beside `ce-app-main`; below 1024px the module nav becomes a scrolling top row.
- `ce-app-bar`: `ce-app-brand` (square logo), `ce-app-search` (a `ce-search`), `ce-app-context` (store `ce-select`, role `ce-pill`).
- `ce-module-nav`: group headings (`h2`) and links, each an `aria-hidden` icon followed by its visible label; `aria-current="page"` on exactly one link marks the page's own module. See “Module navigation”.
- `data-ce-density="compact|touch"` on any container sets control and row sizes (`--ce-control`, `--ce-row`, `--ce-cell-pad`); comfortable is the default.
- `ce-page-header` (`h1`/`h2` + `ce-page-actions`), `ce-table-toolbar`, `ce-table-wrap` > `ce-data-table` (sticky header, `is-number`, `is-wrap`, `is-select`, `aria-selected` rows), `ce-sort` inside `th[aria-sort]`, `ce-thumb`, `ce-unknown`, `ce-bulk-bar`, `ce-table-footer`, `ce-pill--success|warning|danger|info`. Tabs between screens use `ce-tabs`.

## Module navigation

```html
<nav class="ce-module-nav" aria-label="Módulos">
  <h2>Catálogo</h2>
  <a href="/productos" aria-current="page"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">…</svg>Productos</a>
  <a href="/categorias"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">…</svg>Categorías</a>
</nav>
```

- **Height follows density.** Module links and `ce-app-brand` are at least `max(--ce-size-target-public, --ce-control)` tall: 44px with no density and in `compact`, 56px in `touch`. A density can raise them, never take them below the public target. The height is a minimum, so a label that wraps grows the link instead of being clipped.
- **Touch shells** set `data-ce-density="touch"` and take 56px from it. Do not set a local `min-height` on the module links or the brand, or a local `--ce-control` on the shell.
- **Current page:** `aria-current="page"` on one link draws bold text and a 3px inset bar, so the current module is not shown by colour alone. Any other value, including `aria-current="false"`, draws an ordinary link. The focus ring is a 2px outline inside the link.
- **The module list belongs to the application.** The card shows one example of seven groups and seventeen links: Resumen; Catálogo (Productos, Categorías, Medios, Etiquetado); Comercio (Precios por tienda, Promociones, Disponibilidad); Sitio web (Contenido, Publicaciones); Operaciones (Pedidos, Preparación, Clientes, Atención, Tiendas y etiquetas); Análisis (Informes); Administración (Acceso y auditoría). The application decides its modules, labels, order, links and permissions; CE Theme does not require this list.
- **Icons are supplied by the application:** 18px, drawn on the 24px grid with a 1.7px stroke and round caps and joins, `aria-hidden="true"` beside the visible label. The example reuses icons from the CE Theme set (`assets/Icons`); CE Theme has no module icon set.
- **Full-screen tools** (for example a label editor) omit `ce-module-nav` and carry a back link to their module instead, such as «← Etiquetado».
- **Below 1024px** the module nav is a scrolling row and the group headings are hidden. Bringing the current link into view (for example with `scrollIntoView`) is the application's.

## The consumer supplies

Records, the module list and its icons, sorting, selection, permissions and every workflow state. Codes in `ce-code` with the on-screen number underline; missing values shown as `ce-unknown` in words.

## Do and don't

- Do keep compact rows at 40px or more and every control labelled.
- Do choose a density for the shell instead of overriding the module link or brand height on a page.
- Do show permissions as presentation (`ce-locked`, disabled items with a reason); the service enforces them.
- Don't show procurement amounts (CNY) as selling prices.
