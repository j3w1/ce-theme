# Product identifiers and pricing

The owner's reference set establishes four price treatments: regular dark text on white, yellow offer blocks, inverse white prices on photography, and white product-information callouts. Product identification is a separate rectangular black/white label.

## Data and hierarchy

Product codes are opaque strings. Preserve characters, case, separators, and leading zeros. A value such as `7730744292227` is not a numeric amount. Do not infer a relationship between a catalogue alias (MENE or DEBUL), a CE-prefixed identifier, and a numeric identifier. Show only the fields supplied by the consumer.

The order is: optional product code; NAME; Description; specifications; price. See [product identity](product-identity.md). In photo compositions the identifier precedes the title, followed by details and the largest element, the price. Long codes wrap rather than truncate. Product images remain complete inside square `contain` regions.

The reference product card accepts `name` (NAME), `description`, `specs`, `image` and `amount`, plus optional `code`, `previousAmount`, `discountLabel` and `badge`, and passes them through `productView` and `preparePrice`. These are demonstration view fields, not a production catalogue API.

## Display rules

- **Currency.** `S/` at 46% of the amount size, on the amount's baseline (default). The raised `S/` is a supported variant: `ce-price--raised`. Fraction digits stay full size; never raise or shrink decimals.
- **Compact amounts.** `S/20`, `S/8.5`, `S/0.05`. Do not force `.00` and do not group thousands.
- **Styles.**
  - Regular prices: ink on white.
  - Promotions: the yellow block with ink, the default (`ce-price--offer`).
  - The red block (`ce-price--sale`, white text) and the red `REBAJAS` card are supported promotional treatments.
  - Photography: white with verified contrast (`ce-price--inverse`).
  - A campaign colour never changes what a price means.
- **Previous price.** `Antes` and a readable struck-through amount, which must be higher than the current one.
- **Discounts.** A supplied discount appears once, as `−31.25%`. Do not reproduce erroneous reference labels such as duplicated minus signs or zero discounts.
- **Quantity prices.** Quantity conditions such as `x3 · S/9 c/u` are shown only when supplied, next to the unit price.
- **Missing prices.** A missing price shows no amount, never `S/0`.
- **Shared links.** Default public link previews never show a price ([sharing](sharing.md)).

## Store context

Prices and availability can differ by product, variant, store and commercial condition. The storefront makes the store visible and changeable without losing the product the customer is looking at:

| State | Presentation |
| --- | --- |
| No store selected | “Elige tu tienda para ver precio y disponibilidad”, with the store control; no amount. |
| Loading | Store name with a loading indicator; no stale amount from another store. |
| Valid price | Amount with “en {tienda}” context nearby. |
| Price unavailable for this store | “Precio no disponible en {tienda}”, with a link to the other store; no `S/0`. |
| Promotion | The supplied promotional price and, when supplied, previous price and validity. |
| Stock differs between stores | Availability per store in words (“Disponible en Tacna · Agotado en Arequipa”). |

Never present one store's amount as universal.

## Two separate interfaces

`recipes/price.mjs` formats and validates supplied decimal strings for display. The operational pricing service in CE Systems decides which selling price applies to a product, store and condition. `ce-theme` does not implement that service. Procurement amounts from `1688toPL` (CNY) are not selling prices and are never shown as customer offers.

The shared JavaScript helper performs exact comparisons in integer cents using BigInt. It does not compute percentages. Consumers own commercial accuracy; a syntactically valid percentage is not proof that it matches the price pair.

Examples are fixtures, not current retail offers. All prices in the public reference site carry that context.
