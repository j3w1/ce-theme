# Badge

Small square-cornered label for short promotional or product facts.

## Classes

- `ce-badge`: ink with white 12px bold text.
- `ce-badge--offer`: action red with white text, for campaigns and discount labels (`−20%`).
- `ce-badge--yellow`: brand yellow with ink text, for special prices.
- Product tags, with the colours of the old casaelida.com: `ce-badge--novedad` (green `#47b900`, ink text), `ce-badge--promo` (amber `#ec9e00`, ink text), `ce-badge--top` (“Top en ventas”, crimson `#e00751`, white text) and `ce-badge--limited` (“Edición limitada”, black, white text). Tokens: `color.tag.*`.

## The consumer supplies

One to three words of supplied text (“Novedad”, “Promo”, “Top en ventas”, “Edición limitada”, “Precio especial”). On a product card it sits at the top left of `ce-product-media`.

## Do and don't

- Do keep badges square (`ce-radius-none`).
- Do keep yellow for promotion (offer prices and promotion surfaces). A new product is a Novedad: green, never yellow.
- Don't write a discount the brief didn't supply.
