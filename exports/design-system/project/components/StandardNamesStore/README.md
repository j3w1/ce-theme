# StandardNamesStore

Standard names for store: **StockLine** (Disponibilidad), **StoreNote** (Nota de tienda), **StoreContext** (Tienda activa).

## Classes

- **StockLine** · Disponibilidad: `ce-stock`. Per-store availability in words, with a state dot.
- **StoreNote** · Nota de tienda: `ce-store-note`. Short store-specific text that replaces a missing price.
- **StoreContext** · Tienda activa: `ce-store-context`. The button that shows and changes the chosen store; prices and availability follow it.

## The consumer supplies

Real products, each with a NAME; supplied prices, discount labels and bases. Nothing in a sample is a live offer.

## Do and don't

- Do say the name, not the look: “Precio Promo”, not “the yellow price”.
- Don't rename a pattern or reuse a name for another one; add a new entry to `recipes/names.mjs` in the same change as its recipe.
