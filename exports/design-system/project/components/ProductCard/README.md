# ProductCard

Catalogue product card: a whole product photo on white, then NAME, Description, specifications and the price aligned to the bottom. In the store it adds favourites, add-to-bag, availability for the chosen store and variant thumbnails.

## Classes

- `ce-product-grid`: 2 columns below 640px, 3 from 640px, 4 from 1024px. `ce-product-grid--divided` adds hairline rows and cell padding for listing pages.
- `ce-product`: the card, no fixed height. `ce-product-media`: square, `object-fit: contain`; optional `ce-badge` top left and a favourite `ce-icon-button ce-icon-button--small` (`aria-pressed`) bottom right. `ce-media-missing` replaces a missing photo.
- `ce-product-info`: optional `ce-product-flag` (“Novedad”, a green Novedad tag with ink text; `ce-product-flag--promo`, `--top` and `--limited` for the other tags), optional `ce-code`, then `ce-product-row` holding `ce-product-heading` (`ce-product-name` + `ce-product-description`) and the add-to-bag `ce-icon-button ce-icon-button--action ce-icon-button--small`.
- `ce-product-specs`, then the `Price` recipe (44px, 36px below 640px). Without a price for the chosen store, a `ce-store-note` takes its place.
- `ce-stock` lines (`data-state="available|limited|unavailable|unknown"`), and `ce-variant-more` with `ce-variant-thumbs` (`aria-current` on the shown variant).
- `ce-product-link` makes the heading a link; `ce-product-select` holds an optional “Comparar” `ce-check`.

## The consumer supplies

`name`, `description`, `specs`, `image`, and for the chosen store the supplied price, offer and availability; optionally `code`, `flag`, variants. `productView()` in `recipes/product.mjs` formats NAME (uppercase), Description (Title Case, Spanish connectors lowercase) and specs (lowercase except units and abbreviations). Never show `S/0` or another store's price; prices in examples are fixtures.

## Do and don't

- Do keep the order NAME, Description, specs, price, availability. On retail cards the code is optional; tools and labels show it.
- Do show the whole product; never crop a catalogue photo.
- Don't add borders, shadows or rounded corners to the card; white space or the divided grid separates cards.
- Don't show ratings or review counts: there is no review data.
