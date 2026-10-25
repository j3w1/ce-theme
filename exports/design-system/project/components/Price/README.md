# Price

The Casa Elida price: a small raised `S/` beside a large heavy amount with full-size decimals, in regular, offer, sale and inverse styles.

## Classes

- `ce-price-block`: row holding an optional history and the price.
- `ce-price`: weight 800, tracking −0.045em. Set `font-size` for the context (44px in cards, 48px in callouts, 56px on product pages, up to 96px on photography). **Default (S/ en línea base):** `ce-price-currency` is 46% of it and sits on the baseline of `ce-price-value`. `ce-price--joined` (S/ unido) makes S/ the size of the figures and attaches it (S/10); `ce-price--raised` (S/ elevado) lifts the small S/ to the top.
- `ce-price-amount`: wraps S/ and the figures. In the Promo and Rebajas styles the colour box is on this element only, so the price basis stays outside it.
- `ce-price--offer` (**PricePromo**): the yellow block (`ce-color-price-offer-bg`, `ce-radius-price`). `ce-price--sale` (**PriceSale**): the red REBAJAS block. `ce-price--inverse`: white amount for photography.
- Price basis: `ce-price-unit` (**PriceUnit**: “cada uno”, with `ce-price-unit-long` and `ce-price-unit-short` “c/u”; the short form appears when the card is narrower than 13.5rem or with `ce-price-unit--short`) and `ce-price-presentation` (**PricePresentation**: the supplied selling format after a slash, `/pack de 12`, `/par`). Both are bold, lean to the top and sit after the amount; a price has one of them. `ce-price-pack` is the retired name of `ce-price-presentation`.
- `ce-price-history` (**PriceOld**): “Antes” and the struck `<del>` previous price, with the supplied `ce-discount` (**DiscountLabel**): red, tight padding.

## The consumer supplies

Supplied decimal strings, displayed compactly by `preparePrice()` in `recipes/price.mjs`: `S/20`, `S/8.5`, `S/550` (no `.00`, no thousands separator). An optional previous price higher than the current one, an optional supplied discount label shown once as `−31.25%`, and an optional unit label. A pack label is supplied text without the slash (`packLabel: 'pack de 12'`); nothing is computed from it. A hidden `ce-sr-only` label reads the full price (“Precio actual: 8.5 soles por pack de 12”); the visual fragments are `aria-hidden`.

## Do and don't

- Do make the price the largest type in the composition.
- Do name the store near a price when prices differ by store (“Precio en Tacna”).
- Don't compute discounts, taxes or sale prices; display what is supplied, labelled as an example if it is not a live offer.
- Don't show `S/0` for a missing price, and never put prices in shared-link previews.
