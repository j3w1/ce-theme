# StandardNamesPhotos

Standard names for tagged photography: **TaggedPhoto** (Foto etiquetada), **Marker** (Marcador), **ProductPin** (Punto de producto), **ProductPinCard** (Ficha del punto), **FeatureTag** (Rótulo).

## Classes

- **TaggedPhoto** · Foto etiquetada: `ce-tagged-media`. Photo frame with markers and feature tags; clips anything outside it.
- **Marker** · Marcador: `ce-hotspot`. Black circle with a white capital letter A, B, C; only for media that cannot hover (social posts, print, share images).
- **ProductPin** · Punto de producto: `ce-pin`, `ce-pin-dot`. The web tag: a black dot with a white centre on the photo; hover, focus or tap opens its product card.
- **ProductPinCard** · Ficha del punto: `ce-pin-card`, `ce-pin-text`, `ce-pin-chevron`. The card a pin opens: NAME, Description, the store price and a chevron link to the product.
- **FeatureTag** · Rótulo: `ce-feature-tag`. Dot on the feature, a leader line and a label for it; the label sits in the empty area of the photo, stays inside it and never overlaps.

## The consumer supplies

Real products, each with a NAME; supplied prices, discount labels and bases. Nothing in a sample is a live offer.

## Do and don't

- Do say the name, not the look: “Precio Promo”, not “the yellow price”.
- Don't rename a pattern or reuse a name for another one; add a new entry to `recipes/names.mjs` in the same change as its recipe.
