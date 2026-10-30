# Product identity

How Casa Elida products are named, identified and presented across the store, internal tools, labels and shared links. Display helpers live in `recipes/product.mjs` (`formatName`, `formatDescription`, `formatSpec`, `productView`, `codeSegments`) and `recipes/price.mjs`. They format supplied values for display. They never write back, infer, allocate or validate business records.

## Display fields

| Field | Rule | Example | Typography |
| --- | --- | --- | --- |
| NAME | **Mandatory on every product shown anywhere.** Uppercase invented catalogue name or model; separate from Description and codes. See [names.md](names.md). | `WILUL`, `BALTEL STORM` | `ce-product-name`: bold, 15:16 of the Description size. |
| Description | Title Case; Spanish connectors (`de`, `con`, `y`, `para`, `al`…) lowercase except first; abbreviations and digit-led tokens kept. | `Frasco con Cucharita` | `ce-product-description`: regular, 16px reference. |
| Specifications | Lowercase except abbreviations, proper names, technical designations and case-sensitive units; values exact. `CM`, `MM`, `ML`, `KG` directly after a number display as `cm`, `mm`, `ml`, `kg`. | `vidrio/bambú, 450ml`, `cuero PU` | `ce-product-specs`: 14px, muted. |
| CE code | Exact string; badge style; on-screen underline of the four-digit number. | `CE26061477` | `ce-code` |
| Price | Supplied decimal string, compact display. | `S/9`, `S/10.5`, `S/0.05` | `ce-price`; see [pricing](pricing.md). |

The standard names for these parts and for the price, tag and code patterns (ProductIdentity, ProductStack, CECode, PricePromo…) are in [names.md](names.md). `productView()` throws for a product without a NAME. The spacing between the parts is the `size.product.*` tokens.

Set `--ce-product-text` on a container to scale NAME, Description and specs together: 16px in cards, 40–52px in share images, 3.9mm on printed labels. The ratio keeps the optical hierarchy in print.

Originals stay separate from display text. Store the supplied NAME, Description and specifications as received. Translations, capitalisation, material suggestions and illustrative colour swatches are display aids. They never become authoritative product data.

## Codes

Verified in `j3w1/1688toPL` at `266249a` (`src/packing-model.js`, `src/code-display.js`, `src/code-design.css`, `docs/development.md`):

- **Base code `CEYYMMGGII`.**
  - YYMM is the packing month chosen in the preparation workspace, not the purchase date.
  - GG is the month's seller group and II the item within it, each `01`–`99`.
- **Full barcode = `baseCode + variantSuffix + sizeSuffix`.** The variant suffix is letters; the size suffix is letters and digits; either may be empty.
  - The boundary between the two suffixes cannot be recovered from the joined string, so never split it.
- **Carton marks** carry the base code only. Product barcode labels carry the full barcode.
- **Codes are exact strings:** leading zeros kept, no inserted characters, copying returns the exact identifier.
  - CE codes are uppercase by construction.
  - Do not uppercase or otherwise transform supplier identifiers, seller article numbers or order numbers.
  - The badge style is for Casa Elida codes only.
- **Reading aid.** On screen only, `codeSegments` splits `CE`+YYMM | four-digit number | ending, and `ce-code-number` underlines the number.
  - Joining the segments always returns the exact code.
  - Codes that don't match the pattern are shown whole.
  - The underline is not part of the identifier. Never add it to barcode, carton or other print artwork; the recipe removes it in print.
- **Family, variant, size, purchase line and shared barcode are different concepts.**
  - A shared barcode does not merge purchase quantities, costs, stock or history.
  - Grouping, review, collision and unresolved-size states belong to `1688toPL`. The design system only presents them, for example as an “unresolved size” status pill.

## Field mapping from 1688toPL

| 1688toPL field | Meaning there | Design-system field |
| --- | --- | --- |
| `baseCode`, variant and size suffixes | Allocated identifiers | CE code (display only) |
| `spanishName` | Uppercase Spanish short name for preparation and labels (e.g. `ARBOL NAVIDENO`) | **Not** automatically NAME or Description. A customer-facing NAME comes from the catalogue record. |
| `description` | Raw supplier text (often Chinese), immutable evidence | Not displayed to customers. |
| `title`, `skuProperties`, `productNumber` | Supplier listing data | Internal records only, labelled as supplier data. |
| `material` with `materialSource` (`manual` / `suggested`) | Material and whether a person confirmed it | Specifications only when confirmed. Show suggestions as suggestions in internal tools. |
| Colour vocabulary swatches | Illustrative | “Color de referencia”, never a product colour claim. |
| `price`, `discount`, freight (CNY) | Procurement amounts | Never retail prices. Internal tools label them as CNY procurement. |
| Product measurements vs carton measurements | Separate | Never derive one from the other. |

Missing marketing fields stay missing: no Description is manufactured from supplier text.

## Photo tags and image markers

`1688toPL` photo tags are black rounded badges with free text, and are deliberately not variant codes. On the website, pins (`ce-pin`) open a product card on hover, focus or tap; on media that cannot hover, lettered markers (`A`, `B`, `C`) link a photo to products. Both work from structured data supplied by the application. A marker letter is not a variant suffix, and the number of objects in a photo never implies sellable variants.

## Outputs

| Output | Owner | Size | Notes |
| --- | --- | --- | --- |
| Digital code badge | `ce-theme` | Scales with text | Inter bold, black/white, 0.3em × 0.35em padding, 0.2em radius. |
| Gondola price label | `ce-theme` recipe (`exports/print-label.css`) | 80 × 40 mm | Price, NAME, Description, specs, quantity prices, QR (payload supplied), code. Black ink on white or yellow paper. |
| Product barcode label | `1688toPL` | 40 × 20 mm, 300 DPI | Code 128, full barcode, Arial. Not changed here. |
| Carton mark | `1688toPL` | 148.5 × 105 mm | Base code only, Arial. Not changed here. |

Moving `1688toPL` label artwork to Inter would need separate geometry and scanner validation in that repository.
