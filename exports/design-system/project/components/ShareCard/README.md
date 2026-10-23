# ShareCard

The 1200 × 630 image served as a page's `og:image`, so links shared on WhatsApp and social platforms show what the link is about. It never shows a price: prices differ by store and change, and the page carries them.

## Layout

- `ce-share-card`: fixed 1200 × 630 canvas on `ce-color-surface-canvas`, rendered to JPEG by the commerce application (never in the browser of the person sharing). Set `--ce-product-text` to scale NAME, Description and specs together (48px default).
- `ce-share-card-media`: the product zone from x 400 to 1000, so a centre-square crop keeps most of the product; the photo is whole (`contain`).
- `ce-share-card-text`: the left column with `ce-share-card-logo` (supplied wordmark), then `ce-product-name`, `ce-product-description` (up to 4 lines), `ce-product-specs` (2 lines) and an optional `ce-code`. Category and campaign links use `ce-share-card-eyebrow` and `ce-share-card-title` instead.
- `ce-share-card--photo`: a full-bleed lifestyle photo (focal point `--ce-x`, `--ce-y`) with the text on a white card.
- `ce-share-card--text`: no approved photo; centred text on the subtle surface.
- `ce-share-card--brand`: home, store or campaign links on brand red with `logo-wordmark-white-yellow.png`; large text only.

## The consumer supplies

From CE Systems or the commerce service: NAME, Description, specs, one approved photo flattened on white, optionally the code, and the page type. Missing fields are left out, never filled with placeholder text. Metadata rules are in `sharing.md`.

## Do and don't

- Do test the image at chat size (about 300px wide) and as a centre square crop; at that size only the photo, NAME and Description need to read.
- Do regenerate and version the image URL when the photo or text changes.
- Don't show a price, a discount or availability on the card.
- Don't use a transparent PNG as `og:image`; some platforms render transparency as black.
