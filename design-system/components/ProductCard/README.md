# ProductCard

Catalogue product card: a complete square photo on white, then code, model, name, details and the price aligned to the bottom.

## Classes

- `ce-product-grid`: 2 columns below 640px, 3 from 640px, 4 from 1024px; row gap `ce-space-48`.
- `ce-product`: the card, no fixed height. `ce-product-media`: square, `object-fit: contain`; holds an optional `ce-badge` (top left) and `ce-icon-button` (bottom right).
- `ce-product-info`: `ce-code`, `ce-product-model` (bold model or alias, MENE), `ce-product-name`, `ce-product-details` (muted material and size), then the `Price` recipe at 44px (36px below 640px).

## The consumer supplies

`model`, `name`, `details`, `image` and `amount`, plus optional `code`, `previousAmount`, `discountLabel` and `badge`. Image `alt` names the product. Prices in examples are fixtures, not live offers.

## Do and don't

- Do show the whole product; never crop it.
- Do keep the information order: code, model, name, details, price.
- Don't add borders, shadows or rounded corners to the card; white space separates cards.
