# TaggedMedia

Photography with lettered product markers and feature tags, so people can tell which product is priced and what is being described.

## Classes

- `ce-tagged-media`: the positioning frame around one image (or a composed scene). Markers and tags are placed with `--x` and `--y` percentages of the frame.
- `ce-hotspot`: a 36px lettered marker (`A.`, `B.`, `C.`) in action red with a white ring; 30px when the frame is narrower than 480px, with a 48px hit area. `ce-hotspot--promo` uses offer yellow with ink text for the item on promotion.
- `ce-feature-tag`: a dot, a leader line (`--line`, default 40px) and a label describing one feature. The label sits on the dark overlay with the key words in `<strong>` (brand yellow); `ce-feature-tag--light` uses a white label with action-red emphasis for light photos; `ce-feature-tag--start` places the label to the left of the dot.
- `ce-detail-inset`: a round detail photo with a caption (“bolsillo interior”), sized with `--size`.

## The consumer supplies

The photo and its `alt`; for each tagged product a letter, its position, and a link to the matching `TagList` item (`href="#…"`) with a visually hidden name (“Producto A: Taza de vidrio MENE”). Feature text must come from the product's supplied attributes. Never invent a feature.

## Do and don't

- Do repeat everything a marker points to in the `TagList` below the image; the image is never the only place a price or name appears.
- Do keep markers off faces, product edges and the 8% safety margin, and check them on the final crop and the phone width.
- Do use letters in reading order (left to right, top to bottom). Use at most one promo marker per image unless the brief supplies more.
- Don't bake markers, prices or names into a web image; on web they stay live HTML.
- Don't place more than about five markers or three feature tags on one image.
