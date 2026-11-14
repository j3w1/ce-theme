# ProductDetail

The product page: gallery beside a sticky buy box with identity, store price, variant choice, quantity, the one primary add to cart, a favourite, fulfilment options and the product facts.

## Classes

- `ce-pdp`: one column, then from 1024px gallery and `ce-buy-box` side by side (the buy box sticks).
- `ce-gallery`: a swipeable row on phones (with a `ce-gallery-status` live text such as “Imagen 2 de 3”), a two-column grid from 640px. Catalogue photos are contained; `ce-gallery-scene` items are cover photos.
- `ce-buy-box`: sets `--ce-product-text: 1.5rem` for the `h1.ce-product-heading`; price at 56px with a `ce-store-note` naming the store.
- `ce-variant-picker` (`fieldset`) > `ce-variant-options` > `ce-variant-option` labels with a hidden radio, an optional image and the value; checked gets an ink ring, unavailable is struck through.
- `ce-buy-actions`: `ce-quantity`, the add to cart `ce-button` (AddToCart, 56px) and a favourite `ce-icon-button`.
- `ce-fulfilment`: rows for store pickup and delivery, each with an icon, `ce-fulfilment-title` and `ce-stock` or a note.
- `ce-facts`: a definition list; details sit in `ce-disclosure`s. Quantity prices use `ce-tiers`.

## Buying

- **One primary action.** The product page is where buying happens: quantity, one primary «Añadir al carrito» and one quiet favourite. They are separate controls. The favourite names the product (“Guardar MENE, Taza de Vidrio Resistente al Calor en favoritos”) and shows its state with `aria-pressed`.
- **Outcomes are supplied, then shown in words.** Adding: the button reads «Añadiendo…» (`aria-busy="true"`). Added, only after the commerce service confirms it: «Añadido. 1 en tu carrito.», with the count it supplies. Failed: «No se pudo añadir. Tu carrito sigue igual.» with «Reintentar». No store chosen: «Elige tu tienda para ver precio y disponibilidad.» with «Elegir tienda» (`ce-price-pending`). Status is never shown by colour alone.
- **Eligibility is supplied state.** Whether the add is enabled, and the reason it is not, come from the application or the commerce service, which may refuse an add for any reason it supplies. The recipe shows a disabled control with that reason in words; it decides nothing. *Illustration only:* in the CE Systems demonstration fixtures (design canon R-17) the add is enabled whenever the chosen store supplies a price, unknown availability does not block it, and it is disabled with a visible reason only with no store, no price in that store, a quote pending, an invalid quantity or a confirmed sold-out reading. That is fixture gating, not a rule of the design system.
- **Sticky buy bar (consumer).** CE Theme ships no sticky-bar recipe. A consumer's sticky mobile bar may stand in for the inline action once the inline action has scrolled out of view; the two are never visible together.

## The consumer supplies

NAME, Description, specs, code, photos, variants, the supplied price and availability for the chosen store, the add state, its outcomes and reasons, and the facts the record has. Missing information is stated (“Información pendiente en el catálogo”), not invented.

## Do and don't

- Do switch every store-dependent line together when the store changes; never leave another store's price.
- Do keep variants as real radio inputs.
- Do keep one primary «Añadir al carrito» per product page.
- Don't show a delivery date, stock count or add outcome the services did not supply.
