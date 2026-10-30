# StandardNamesSurfaces

Standard names for surfaces: **ProductCard** (Tarjeta de producto), **AddToCart** (Añadir al carrito), **ProductCallout** (Tarjeta flotante), **Mosaic** (Mosaico), **MosaicTile** (Baldosa), **PromoTile** (Baldosa Promo), **PromoPanel** (Panel Promo).

## Classes

- **ProductCard** · Tarjeta de producto: `ce-product`. Photo, then the ProductStack. No borders, shadows or rounded corners.
- **AddToCart** · Añadir al carrito: `ce-product-add`, `ce-icon-button--action`. On hover-capable screens an icon button appears on card hover or focus; on touch and narrow screens a full-width button sits at the bottom of the card.
- **ProductCallout** · Tarjeta flotante: `ce-callout`. White floating card with a photo, identity and price for editorial pieces.
- **Mosaic** · Mosaico: `ce-mosaic`. Editorial grid of tiles; one large tile, one wide, two small.
- **MosaicTile** · Baldosa: `ce-tile`, `ce-tile--light`. One link in a mosaic. Neutral surface; yellow never sits behind or over a product photo.
- **PromoTile** · Baldosa Promo: `ce-tile-offer`. A tile with the Promo tag and the supplied offer price in the yellow block.
- **PromoPanel** · Panel Promo: `ce-statement`, `ce-grid-promo`. A campaign surface in brand yellow with ink text, for a promotion or campaign message.

## The consumer supplies

Real products, each with a NAME; supplied prices, discount labels and bases. Nothing in a sample is a live offer.

## Do and don't

- Do say the name, not the look: “Precio Promo”, not “the yellow price”.
- Don't rename a pattern or reuse a name for another one; add a new entry to `recipes/names.mjs` in the same change as its recipe.
