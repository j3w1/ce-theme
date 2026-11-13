# ProductCard

Catalogue product card: a whole product photo on white, then the product stack: NAME, Description, specifications and the price at a fixed 12px below the specs (never pushed to the bottom of the card). Cards are for browsing: at rest a card carries no purchase control and no favourite. In the store it adds availability for the chosen store, variant thumbnails and, on hover-capable screens, an optional quick-add icon on the active card. Buying happens on the product page (`ProductDetail`).

## Classes

- `ce-product-grid`: 2 columns below 640px, 3 from 640px, 4 from 1024px. `ce-product-grid--divided` adds hairline rows and cell padding for listing pages.
- `ce-product`: the card, no fixed height. `ce-product-media`: square, `object-fit: contain`; optional `ce-badge` top left. `ce-media-missing` replaces a missing photo.
- `ce-product-info`: optional `ce-product-flag` (“Novedad”, a green Novedad tag with white text; `ce-product-flag--promo`, `--top` and `--limited` for the other tags), optional `ce-code`, then `ce-product-row` holding `ce-product-heading` (`ce-product-name` + `ce-product-description`) and the optional quick-add `ce-icon-button ce-icon-button--action ce-icon-button--small` (QuickAdd).
- `ce-product-specs`, then the `Price` recipe (44px, 36px below 640px). Without a price for the chosen store, a `ce-store-note` takes its place.
- `ce-stock` lines (`data-state="available|limited|unavailable|unknown"`), and `ce-variant-more` with `ce-variant-thumbs` (`aria-current` on the shown variant).
- `ce-product-link` makes the heading the link to the product page. Wrap the photo in a link to the same page with `tabindex="-1"` and `aria-hidden="true"`, so the card is one link for keyboard and screen-reader users. `ce-product-select` holds an optional “Comparar” `ce-check`.
- `ce-product-add` is **deprecated**: the full-width card button of the earlier rule. The recipe keeps it hidden at every width while previews and consumers remove the element from their markup; it has no opt-in variant.

## Shopping actions

- **Resting card:** photo, identity, price and the store note or availability. No add button, no favourite, no full-width button.
- **Active card, hover-capable screens from 640px:** the hovered or keyboard-focused card may show the optional QuickAdd icon (“Añadir rápido”) and nothing else. It is a separate control beside the product link, never inside it. Its accessible name carries the product: “Añadir MENE, Taza de Vidrio Resistente al Calor al carrito”. It measures 44 × 44 (`--ce-size-target-public`); for this control the public target replaces the 40px card-action size. Keyboard: Tab reaches the product link, then the quick-add, which appears with the focus ring; Enter or Space activates it. It is hidden with `opacity`, so it stays in the tab order and the accessibility tree. Under `prefers-reduced-motion: reduce` it appears without a transition. It adds no height to the row, so the ProductStack gaps and the price stay where they are with or without it; its column stays clear, because the heading, the line that follows the row and, with no Description, the line after that leave the target width plus the row gap free beside it.
- **No room, no quick-add:** a card whose NAME has no Description and no specs under it does not show the quick-add at any width: the 44px action would reach over the price 12px below the NAME. Buying stays on the product page. Render the Description and specs only when they have text, as `productView()` gives them: an empty element counts as absent, and an element that holds only white space is not supported, because a selector cannot tell it from text. Don't add empty or blank elements to qualify a card.
- **Touch and narrow screens** (`hover: none`, or below 640px): nothing is added from the card. The quick-add is not shown, and the whole card opens the product page: the `ce-product-link` covers the card, while the card's other controls (variant thumbnails, «Comparar», a list's own task, a control in the photo box) stay separate targets above it. Keyboard order does not change. This holds for native controls (`a[href]`, `button`, `input`, `select`, `textarea`, `label`, `summary`) inside the card. A custom `role="button"` element is not lifted, so use a native control. A control inside an ancestor that creates its own stacking context (a positioned element with a `z-index`, `opacity` below 1, a `transform`) stays under the link. A positioned element between the card and its `ce-product-link` would confine the link's cover to that element.
- **Lists with their own task** show only that task: favourites «Quitar de favoritos», the cart «Quitar». Scenes and order summaries show named product links and no add action per product.
- **Supplied state:** whether an add is offered, enabled or disabled, and why, is state supplied by the application or the commerce service. The recipe only presents it; a disabled control states its reason in words. Its outcomes are words too (see `ProductDetail`). A hidden or disabled control is presentation, not authorization.

## The consumer supplies

`name`, `description`, `specs`, `image`, and for the chosen store the supplied price, offer and availability; optionally `code`, `flag`, variants and the add state. `productView()` in `recipes/product.mjs` formats NAME (uppercase), Description (Title Case, Spanish connectors lowercase) and specs (lowercase except units and abbreviations). Never show `S/0` or another store's price; prices in examples are fixtures.

## Do and don't

- Do keep the order NAME, Description, specs, price, availability, with the `size.product.*` gaps (the **ProductStack**, see `names.md`). Every card has a NAME. On retail cards the code is optional; tools and labels show it.
- Do show the whole product; never crop a catalogue photo.
- Don't put a favourite, a full-width add button or a touch quick-buy on the card.
- Don't add borders, shadows or rounded corners to the card; white space or the divided grid separates cards.
- Don't show ratings or review counts: there is no review data.
