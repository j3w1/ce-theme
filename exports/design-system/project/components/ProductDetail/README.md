# ProductDetail

The product page: gallery beside a sticky buy box with identity, store price, variant choice, quantity, add-to-bag, fulfilment options and the product facts.

## Classes

- `ce-pdp`: one column, then from 1024px gallery and `ce-buy-box` side by side (the buy box sticks).
- `ce-gallery`: a swipeable row on phones (with a `ce-gallery-status` live text such as “Imagen 2 de 3”), a two-column grid from 640px. Catalogue photos are contained; `ce-gallery-scene` items are cover photos.
- `ce-buy-box`: sets `--ce-product-text: 1.5rem` for the `h1.ce-product-heading`; price at 56px with a `ce-store-note` naming the store.
- `ce-variant-picker` (`fieldset`) > `ce-variant-options` > `ce-variant-option` labels with a hidden radio, an optional image and the value; checked gets an ink ring, unavailable is struck through.
- `ce-buy-actions`: `ce-quantity`, the add-to-bag `ce-button` and a favourite `ce-icon-button`.
- `ce-fulfilment`: rows for store pickup and delivery, each with an icon, `ce-fulfilment-title` and `ce-stock` or a note.
- `ce-facts`: a definition list; details sit in `ce-disclosure`s. Quantity prices use `ce-tiers`.

## The consumer supplies

NAME, Description, specs, code, photos, variants, the supplied price and availability for the chosen store, and the facts the record has. Missing information is stated (“Información pendiente en el catálogo”), not invented.

## Do and don't

- Do switch every store-dependent line together when the store changes; never leave another store's price.
- Do keep variants as real radio inputs.
- Don't show a delivery date or stock count the services did not supply.
