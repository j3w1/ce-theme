# StandardNamesNavigation

Standard names for navigation and tools: **Breadcrumbs** (Ruta de navegación), **SiteNav** (Navegación principal), **SearchField** (Buscador), **CategoryTile** (Categoría con foto), **ModuleNav** (Navegación de módulos), **PageHeader** (Encabezado de página), **DataTable** (Tabla de datos), **BulkBar** (Barra de selección).

## Classes

- **Breadcrumbs** · Ruta de navegación: `ce-breadcrumbs`. Where the page sits: Inicio, section, current page.
- **SiteNav** · Navegación principal: `ce-site-nav`. The main sections of the store.
- **SearchField** · Buscador: `ce-search`. The product search field.
- **CategoryTile** · Categoría con foto: `ce-category-tile`. A photo tile with a label that links to a category.
- **ModuleNav** · Navegación de módulos: `ce-module-nav`. The side navigation of CE apps, grouped by module.
- **PageHeader** · Encabezado de página: `ce-page-header`. The title of a tool page with its main actions.
- **DataTable** · Tabla de datos: `ce-data-table`. Dense, sortable table for tools; numbers right-aligned.
- **BulkBar** · Barra de selección: `ce-bulk-bar`. Appears when rows are selected, with actions for the selection.

## The consumer supplies

Real products, each with a NAME; supplied prices, discount labels and bases. Nothing in a sample is a live offer.

## Do and don't

- Do say the name, not the look: “Precio Promo”, not “the yellow price”.
- Don't rename a pattern or reuse a name for another one; add a new entry to `recipes/names.mjs` in the same change as its recipe.
