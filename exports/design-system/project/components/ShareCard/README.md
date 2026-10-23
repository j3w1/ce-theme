# ShareCard

The 1200 × 630 image composed from verified product data and served as a product page's `og:image`, so links shared on WhatsApp and social platforms show the product, its name and its price.

## Layout

- `ce-share-card`: fixed 1200 × 630 canvas on `ce-color-surface-canvas`, rendered to JPEG by the commerce application (never by the browser of the person sharing).
- `ce-share-card-square`: the centre 630 × 630 safe zone with the product photo (`contain`, whole product), the name (two lines at most) and the `Price` recipe at 96px. Messaging apps that crop to a square keep everything in this zone.
- `ce-share-card-brand`: the left 285px brand-red band holding the supplied red-ground logo (`logo-brand.jpg`) unchanged.
- `ce-share-card-aside`: the right 285px with the product code and `casaelida.com`.
- `ce-share-card--fallback`: product photo missing; the media area becomes a subtle panel and the name and price carry the card.

## The consumer supplies

From CE Systems or the commerce service: product name and model, code, one approved product photo (flattened on white, not transparent), and a price only when one price applies to the shared link. With per-store prices, the link must name the store or the card omits the price; see `docs/sharing.md`. An offer shows `ce-price--offer` and the supplied previous price; a missing optional field is left out, never filled with placeholder text.

## Do and don't

- Do regenerate the image when the name, photo or price changes, and version its URL so platforms fetch the new one.
- Do keep the name, price and code as text in the page's metadata too; the image is never the only source.
- Don't add campaign slogans, mascots or availability claims to the card unless they are supplied for that product.
- Don't use the transparent catalogue PNG directly as `og:image`; some platforms render transparency as black.
