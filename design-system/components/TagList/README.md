# TagList

The lettered product list that answers a `TaggedMedia` image: letter, code, NAME, Description, specs, price and availability for each marker.

## Classes

- `ce-tag-list`: an ordered list; one column on phones, auto-fitting columns (min 260px) with hairline dividers from 640px. Inside `ce-scene` on desktop it becomes one column beside the photo.
- `ce-tag-item`: thumbnail (30%, square, `contain`) beside `ce-tag-item-info`. The item is the target of its marker link and shows a focus outline when targeted.
- `ce-tag-item-title`: the inline marker (`ce-hotspot ce-hotspot--inline`, `aria-hidden`) repeating the letter, then `ce-product-heading`.
- Inside: `ce-code`, `Specs` or `ce-product-specs`, the `Price` recipe at 40px, `ce-availability` or `ce-stock`.

## The consumer supplies

For each product: an `id` matching the marker link, the letter, the code, NAME, Description, the attributes the record has, the supplied price for the chosen store and the supplied availability text.

## Do and don't

- Do keep the same letters and order as the markers on the image.
- Do keep each item self-contained so it reads correctly without the photo.
- Don't use a list for a single product; use `Callout` or `ProductCard`.
