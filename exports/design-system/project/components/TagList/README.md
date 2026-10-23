# TagList

The lettered product list that answers a `TaggedMedia` image: code, name, specs, price and availability for each marker.

## Classes

- `ce-tag-list`: an ordered list; one column on phones, auto-fitting columns (min 260px) with hairline dividers from 640px.
- `ce-tag-item`: thumbnail (30%, square, `contain`) beside `ce-tag-item-info`. The item is the target of its marker's link and shows a focus outline when targeted.
- `ce-tag-item-title`: the bold name with an inline marker (`ce-hotspot ce-hotspot--inline`, `aria-hidden`) repeating the letter.
- Inside: `ce-code`, `Specs`, the `Price` recipe at 40px, `ce-availability`.

## The consumer supplies

For each product: an `id` matching the marker link, the letter, the code, the name, the attributes the record has, the supplied price and the supplied availability text. Show only fields the record has.

## Do and don't

- Do keep the same letter, color and order as the markers on the image.
- Do keep each item self-contained so it reads correctly without the photo.
- Don't use a list for a single product; use `Callout` or `ProductCard`.
