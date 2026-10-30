# StandardNamesPrices

Standard names for prices: **PriceRegular** (Precio normal), **CurrencyBaseline** (S/ en línea base), **CurrencyJoined** (S/ unido), **CurrencyRaised** (S/ elevado), **PriceAmount** (Cifra del precio), **PricePromo** (Precio Promo), **PriceSale** (Precio Rebajas), **PricePhoto** (Precio sobre foto), **PriceBasis** (Base del precio), **PriceUnit** (Unidad), **PricePresentation** (Presentación), **PriceOld** (Precio anterior), **DiscountLabel** (Etiqueta de descuento).

## Classes

- **PriceRegular** · Precio normal: `ce-price`. Ink on white, S/ in the baseline style by default.
- **CurrencyBaseline** · S/ en línea base: `ce-price-currency`. The default: S/ at 46% of the figures, sitting on their baseline.
- **CurrencyJoined** · S/ unido: `ce-price--joined`. The second option: S/ at the size of the figures, attached to them (S/10).
- **CurrencyRaised** · S/ elevado: `ce-price--raised`. A supported variant: S/ small at the top of the figures.
- **PriceAmount** · Cifra del precio: `ce-price-amount`. S/ and the figures together. In Promo and Rebajas prices the colour box surrounds only the amount, never the basis beside it.
- **PricePromo** · Precio Promo: `ce-price--offer`. The yellow price block: a promotion or discount price. Yellow means promotion and nothing else.
- **PriceSale** · Precio Rebajas: `ce-price--sale`. The red price block for REBAJAS campaigns.
- **PricePhoto** · Precio sobre foto: `ce-price--inverse`. White price on photography protected by an overlay.
- **PriceBasis** · Base del precio: `ce-price-basis`. Short bold text leaning to the top after the price that says what it covers: a unit (cada uno) or a presentation (/pack de 12).
- **PriceUnit** · Unidad: `ce-price-unit`, `ce-price-unit-short`. “cada uno”: the price is for one piece. Short form “c/u” when the card or block is narrow.
- **PricePresentation** · Presentación: `ce-price-presentation`. The selling format the price is for, after a slash: /pack de 12, /par. It identifies what is sold; it is not a per-piece qualifier.
- **PriceOld** · Precio anterior: `ce-price-history`. “Antes” with the struck previous price, then the DiscountLabel.
- **DiscountLabel** · Etiqueta de descuento: `ce-discount`. The supplied discount percentage in red, tight around its text. Never calculated.

## The consumer supplies

Real products, each with a NAME; supplied prices, discount labels and bases. Nothing in a sample is a live offer.

## Do and don't

- Do say the name, not the look: “Precio Promo”, not “the yellow price”.
- Don't rename a pattern or reuse a name for another one; add a new entry to `recipes/names.mjs` in the same change as its recipe.
