# Mosaic

The editorial grid at the top of the home and category pages: one large tile, one wide tile and two small tiles with 12px gaps. Every tile is one link.

## Classes

- `ce-mosaic`: 2 columns on phones (first two tiles full width), 4 from 640px, and from 1024px a large tile over two rows beside a wide tile and two small ones. `ce-mosaic--reverse` puts the large tile on the right.
- `ce-tile`: square-cornered link with a cover photo (`object-position` from `--ce-x`/`--ce-y`), a bottom scrim, a white `ce-tile-title` with an arrow, and an optional `ce-badge` top left. `ce-tile--wide` (16:9) and `ce-tile--tall` (6:7) set ratios outside the mosaic.
- `ce-tile--light`: catalogue cut-out on a neutral surface (`--ce-campaign-surface`, default subtle; a light grey is fine) with ink text and no scrim.
- Tags: `ce-badge--novedad` (green), `ce-badge--promo` (amber), `ce-badge--top` (crimson) or `ce-badge--limited` (black), top left. A promotion tile also carries `ce-tile-offer` (top right) with the supplied offer price in `ce-price--offer`, the only yellow on the tile.
- Related: `ce-split-promo` (photo two thirds, colour panel one third), `ce-block-card`, `ce-statement`, `ce-price-points`.

## The consumer supplies

Approved photography or cut-outs, short titles (one or two lines), the link and an optional supplied badge. Campaign surfaces come from the campaign, checked with `campaignColors()`.

## Do and don't

- Do keep titles short enough for two lines on the small tiles.
- Do use lifestyle photos when approved ones exist; light tiles are the fallback for catalogue cut-outs.
- Don't put yellow behind or over a product photo, and never tint a cut-out yellow: yellow means promotion, and a yellow ground makes the glass and the product look dirty. Promotion is a Promo tag plus the yellow offer price block; a new product is a green Novedad tag.
- Don't put prices on tiles other than the supplied offer price of a promotion tile; other prices and the fine print belong in `Price` and below the mosaic.
