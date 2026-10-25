# Price

The Casa Elida price: a small raised `S/` beside a large heavy amount with full-size decimals, in regular, offer, sale and inverse styles.

## Classes

- `ce-price-block`: row holding an optional history and the price.
- `ce-price`: weight 800, tracking −0.045em. Set `font-size` for the context (44px in cards, 48px in callouts, 56px on product pages, up to 96px on photography). `ce-price-currency` is 46% of it and is raised to the top of the figures by default; `ce-price-value` stays full size.
- `ce-price--baseline`: the fallback that sets `S/` on the baseline of the figures (use it when the raised `S/` cannot be drawn, for example in a constrained print or table cell). `ce-price--raised` is kept as an alias of the default.
- `ce-price--offer`: the default promotion, an ink amount on the yellow block (`ce-color-price-offer-bg`, `ce-radius-price`).
- `ce-price--sale`: red sale block (`ce-color-sale-bg`, white text) for REBAJAS campaigns.
- `ce-price--inverse`: white amount for photography.
- `ce-price-pack` (**PricePack**, Precio por pack): the supplied basis after a slash, bold, on the baseline of the figures: `/pack de 50`, `/pack de 12`, `/par`. It is 34% of the price size (never below 14px), sits inside `ce-price` after the value and works in the regular, Promo and Rebajas styles. A price has a pack label or a unit label, not both.
- `ce-price-unit`: a qualifier such as “cada uno”. `ce-price-history`: “Antes” + `<del>` previous price, with an optional supplied `ce-badge--offer` discount.

## The consumer supplies

Supplied decimal strings, displayed compactly by `preparePrice()` in `recipes/price.mjs`: `S/20`, `S/8.5`, `S/550` (no `.00`, no thousands separator). An optional previous price higher than the current one, an optional supplied discount label shown once as `−31.25%`, and an optional unit label. A pack label is supplied text without the slash (`packLabel: 'pack de 12'`); nothing is computed from it. A hidden `ce-sr-only` label reads the full price (“Precio actual: 8.5 soles por pack de 12”); the visual fragments are `aria-hidden`.

## Do and don't

- Do make the price the largest type in the composition.
- Do name the store near a price when prices differ by store (“Precio en Tacna”).
- Don't compute discounts, taxes or sale prices; display what is supplied, labelled as an example if it is not a live offer.
- Don't show `S/0` for a missing price, and never put prices in shared-link previews.
