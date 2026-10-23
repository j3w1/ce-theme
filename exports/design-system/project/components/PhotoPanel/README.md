# PhotoPanel

Campaign composition: a full-bleed photo with code, title, details and an inverse price set as live text over a dark gradient.

## Classes

- `ce-photo-panel`: positions the photo (`object-fit: cover`) and draws the `ce-color-overlay` gradient from the bottom.
- `ce-photo-content`: text block inset 8% from the bottom and sides; `ce-photo-content--top` with `ce-photo-panel--top` moves it to 10% from the top for 9:16 stories.
- Use `ce-price--inverse`; the price scales from 48px to 96px.

## The consumer supplies

A photo of the product in use, its `alt`, and the supplied code, title, details and price. Formats: 1:1 posts, 9:16 stories, 16:9 store screens.

## Do and don't

- Do validate contrast on the final crop; the gradient is a starting point.
- Do keep code, name and price as HTML on web surfaces.
- Don't bake prices into the image or rely on text shadow alone.

The preview shows the panel's dark ground (`ce-color-surface-inverse`) without a photo: the supplied campaign images already contain their own text and prices, so supply new product-in-use photography for real pieces.
