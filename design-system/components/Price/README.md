# Price

The Casa Elida price: a small `S/` above-aligned beside a large heavy amount, in regular, offer and inverse styles.

## Classes

- `ce-price-block`: row holding an optional history and the price.
- `ce-price`: weight 800, tracking −0.045em. Set `font-size` for the context (44px in cards, 48px in callouts, up to 96px on photography); `ce-price-currency` is 46% of it and `ce-price-value` stays full size.
- `ce-price--offer`: ink amount on a `ce-color-price-offer-bg` yellow block with `ce-radius-price`.
- `ce-price--inverse`: white amount for photography.
- `ce-price-unit`: a qualifier such as “cada uno”.
- `ce-price-history`: “Antes” + `<del>` previous price in `ce-color-price-previous`, with an optional `ce-badge--offer` discount.

## The consumer supplies

Supplied decimal strings, displayed compactly: `S/20`, `S/8.5`, `S/550` (no `.00`, no thousands separator). An optional previous price higher than the current one, an optional supplied discount label shown once as `−31.25%`, and an optional unit label. A hidden `ce-sr-only` label reads the full price (“Precio actual: 8.5 soles”); the visual fragments are `aria-hidden`. `recipes/price.mjs` validates the strings and never calculates a discount.

## Do and don't

- Do make the price the largest type in the composition.
- Do keep decimals full size.
- Don't compute discounts, taxes or sale prices; display what the brief supplies, labelled as an example if it is not a live offer.
