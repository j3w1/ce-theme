# Price

The Casa Elida price: a small `S/` on the baseline beside a large heavy amount with full-size decimals, in regular, offer, sale and inverse styles.

## Classes

- `ce-price-block`: row holding an optional history and the price.
- `ce-price`: weight 800, tracking −0.045em. Set `font-size` for the context (44px in cards, 48px in callouts, 56px on product pages, up to 96px on photography). `ce-price-currency` is 46% of it and sits on the baseline; `ce-price-value` stays full size.
- `ce-price--raised`: supported variant that lifts `S/` to the top of the figures.
- `ce-price--offer`: the default promotion, an ink amount on the yellow block (`ce-color-price-offer-bg`, `ce-radius-price`).
- `ce-price--sale`: red sale block (`ce-color-sale-bg`, white text) for REBAJAS campaigns.
- `ce-price--inverse`: white amount for photography.
- `ce-price-unit`: a qualifier such as “cada uno”. `ce-price-history`: “Antes” + `<del>` previous price, with an optional supplied `ce-badge--offer` discount.

## The consumer supplies

Supplied decimal strings, displayed compactly by `preparePrice()` in `recipes/price.mjs`: `S/20`, `S/8.5`, `S/550` (no `.00`, no thousands separator). An optional previous price higher than the current one, an optional supplied discount label shown once as `−31.25%`, and an optional unit label. A hidden `ce-sr-only` label reads the full price (“Precio actual: 8.5 soles”); the visual fragments are `aria-hidden`.

## Do and don't

- Do make the price the largest type in the composition.
- Do name the store near a price when prices differ by store (“Precio en Tacna”).
- Don't compute discounts, taxes or sale prices; display what is supplied, labelled as an example if it is not a live offer.
- Don't show `S/0` for a missing price, and never put prices in shared-link previews.
