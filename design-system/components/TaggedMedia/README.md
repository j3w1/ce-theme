# TaggedMedia

Photography with lettered product markers and feature tags, so people can tell which product is priced and what is being described.

## Classes

- `ce-tagged-media`: the positioning frame around one image (or a composed scene). Markers and tags are placed with `--ce-x` and `--ce-y` percentages of the frame.
- `ce-hotspot`: a 32px black circle (`ce-color-marker-bg`) with a bold white capital letter `A`, `B`, `C`, no period and no ring; 28px when the frame is narrower than 480px, with a larger hit area. Focus adds a separate outline and white halo. There is no promotional marker colour: offers show in the list.
- `ce-feature-tag`: a dot, a leader line (`--ce-line`, default 40px) and a label describing one feature, key words in `<strong>`. `ce-feature-tag--light` for light photos; `ce-feature-tag--start` places the label left of the dot. The label wraps at `--ce-tag-width` (default 16em) and can never grow past the edge of the frame; the frame clips anything outside it.
- `ce-detail-inset`: a round detail photo with a caption, sized with `--ce-size`.
- Set `data-ce-markers="hidden"` on the frame to hide markers and tags (a “Mostrar etiquetas” toggle); the list stays.

## The consumer supplies

The photo and its `alt`; for each tagged product a letter, its position, and a link to the matching `TagList` item (`href="#…"`) with a visually hidden name (“Producto A: MENE, Taza de Vidrio Resistente al Calor”). Positions and feature text come from supplied data. A marker letter is not a variant code.

## Do and don't

- Do repeat everything a marker points to in the `TagList`; the image is never the only place a name or price appears.
- Do use letters in reading order and keep markers off faces, product edges and the 8% safety margin.
- Don't bake markers, prices or names into a web image; on web they stay live HTML.
- Don't place more than about five markers or three feature tags on one image.
- Don't let tags overlap each other, a marker or a neighbouring photo. Keep each tag inside the photo of the product it describes: pick the side with room (`--start` when the dot is in the right half), shorten the leader (`--ce-line`), narrow the label (`--ce-tag-width`), and stack tags at least 12% of the frame height apart. `placeFeatureTags()` in `behaviors.mjs` applies the same rules at run time for tags whose position comes from data.
