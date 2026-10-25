# TaggedMedia

Photography with tagged products, so people can tell which product is priced and what is being described. On the website a dot (`ce-pin`) opens a product card on hover; lettered markers (`ce-hotspot`) are for media that cannot hover: social posts, print and share images.

## Classes

- `ce-tagged-media`: the positioning frame around one image (or a composed scene). Markers and tags are placed with `--ce-x` and `--ce-y` percentages of the frame.
- `ce-pin`: the web tag. A 28px black dot with a white centre and a white ring (`ce-pin-dot`, a button with a 44px hit area) and a card (`ce-pin-card`, a link to the product) with `ce-pin-text` (NAME, Description, the store's price) and a `ce-pin-chevron` cell. The card opens on hover, keyboard focus or tap, never covers its own dot, and stays inside the photo: `enhancePins()` from `behaviors.mjs` adds tap-to-open, Escape and outside-tap closing, one open card per photo, and flips a card with `ce-pin--start` (open to the left) or `ce-pin--above` where the side has no room. Place it with `--ce-x` and `--ce-y`; give the dot an accessible name (“Ver MENE, Taza de Vidrio Resistente al Calor”).
- `ce-hotspot` (static media): a 32px black circle (`ce-color-marker-bg`) with a bold white capital letter `A`, `B`, `C`, no period and no ring; 28px when the frame is narrower than 480px, with a larger hit area. Focus adds a separate outline and white halo. There is no promotional marker colour: offers show in the list.
- `ce-feature-tag`: a dot, a leader line (`--ce-line`, default 40px) and a label describing one feature, key words in `<strong>`. `ce-feature-tag--light` for light photos; `ce-feature-tag--start` places the label left of the dot; `ce-feature-tag--above` and `ce-feature-tag--below` run a vertical leader from the dot to a label centred above or below it, which is how a tag reaches into the white space of a photo. The label wraps at `--ce-tag-width` (default 16em) and can never grow past the edge of the frame; the frame clips anything outside it.
- `ce-detail-inset`: a round detail photo with a caption, sized with `--ce-size`.
- Set `data-ce-markers="hidden"` on the frame to hide pins, markers and tags (a “Mostrar etiquetas” toggle); the list stays.

## The consumer supplies

The photo and its `alt`; for each tagged product a letter, its position, and for a pin, the product link and the store's price; for a marker, a link to the matching `TagList` item (`href="#…"`) with a visually hidden name (“Producto A: MENE, Taza de Vidrio Resistente al Calor”). Positions and feature text come from supplied data. A marker letter is not a variant code.

## Do and don't

- Do put the dot ON the thing the label describes: the glass wall or rim for “de vidrio borosilicato”, the body of the mat for “base antideslizante”; never on a tail, a handle, a shadow or empty space. The label goes in the empty area of the photo, joined by the leader.
- Do use pins on the website and letters only where nothing can hover; never both on the same photo.
- Do repeat everything a pin or marker points to in the `TagList`; the image is never the only place a name or price appears.
- Do use letters in reading order and keep markers off faces, product edges and the 8% safety margin.
- Don't bake markers, prices or names into a web image; on web they stay live HTML.
- Don't place more than about five markers or three feature tags on one image.
- Don't let tags overlap each other, a marker or a neighbouring photo. Keep each tag inside the photo of the product it describes: pick the side with room (`--start` when the dot is in the right half), shorten the leader (`--ce-line`), narrow the label (`--ce-tag-width`), and stack tags at least 12% of the frame height apart. `placeFeatureTags()` in `behaviors.mjs` applies the same rules at run time for tags whose position comes from data.
