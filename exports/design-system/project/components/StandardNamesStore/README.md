# StandardNamesStore

Standard names for store: **StockLine** (Disponibilidad), **StoreNote** (Nota de tienda), **StoreBar** (Barra de tienda), **StoreContext** (Tienda activa).

## Classes

- **StockLine** · Disponibilidad: `ce-stock`. Per-store availability in words, with a state dot, in a list named «Disponibilidad». An unknown, stale, conflicting or missing reading reads «Disponibilidad por confirmar en {tienda}», never «Agotado»; «Pocas unidades» and «Agotado» only from a confirmed reading the inventory service supplies.
- **StoreNote** · Nota de tienda: `ce-store-note`. Short store-specific text that replaces a missing price.
- **StoreBar** · Barra de tienda: `ce-store-note`, `ce-link`. The in-page line on every store-dependent page: the store the amounts and availability belong to, and a 44px action to change it. «Importes en {tienda}» on money-bearing surfaces, «Precios y disponibilidad de {tienda}» when browsing, «Tienda: sin elegir» with «Elegir tienda» without a store; while a change is pending, «Actualizando» replaces the action. A StoreNote with a TextLink; no class of its own.
- **StoreContext** · Tienda activa: `ce-store-context`. The button that shows and changes the chosen store; prices and availability follow it.

## The consumer supplies

Real products, each with a NAME; supplied prices, discount labels and bases. Nothing in a sample is a live offer.

## Do and don't

- Do say the name, not the look: “Precio Promo”, not “the yellow price”.
- Don't rename a pattern or reuse a name for another one; add a new entry to `recipes/names.mjs` in the same change as its recipe.
