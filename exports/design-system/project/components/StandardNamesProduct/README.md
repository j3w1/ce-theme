# StandardNamesProduct

Standard names for product information: **ProductName** (NAME), **ProductDescription** (Descripción), **ProductSpecs** (Especificaciones), **ProductIdentity** (Identidad), **ProductStack** (Pila de producto), **CECode** (Código CE), **ProductTag** (Etiqueta de producto).

## Classes

- **ProductName** · NAME: `ce-product-name`. Mandatory on every product shown anywhere. Uppercase invented catalogue name, one or two words, unique (MENE, TILEN).
- **ProductDescription** · Descripción: `ce-product-description`. Title Case, Spanish connectors in lowercase. Second line of the identity.
- **ProductSpecs** · Especificaciones: `ce-product-specs`. Lowercase except units and abbreviations. Third line of the identity.
- **ProductIdentity** · Identidad: `ce-product-heading`. NAME, then Description, then specs, at size.product.gap-identity.
- **ProductStack** · Pila de producto: `ce-product-info`. Tag, CE code, identity, price, note, with the size.product gaps. The price follows the specs at 12px and is never pushed to the bottom.
- **CECode** · Código CE: `ce-code`, `ce-code--sm`, `ce-code--lg`. White bold text on ink, 2px corners, tabular figures. Always one line; never wraps.
- **ProductTag** · Etiqueta de producto: `ce-badge--novedad`, `ce-badge--promo`, `ce-badge--top`, `ce-badge--limited`, `ce-product-flag`. Novedad (green), Promo (amber), Top en ventas (crimson), Edición limitada (black).

## The consumer supplies

Real products, each with a NAME; supplied prices, discount labels and bases. Nothing in a sample is a live offer.

## Do and don't

- Do say the name, not the look: “Precio Promo”, not “the yellow price”.
- Don't rename a pattern or reuse a name for another one; add a new entry to `recipes/names.mjs` in the same change as its recipe.
