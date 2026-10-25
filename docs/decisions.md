# Foundation decisions

These choices were made by the owner in the implementation-planning conversation on 2026-10-22. The implementation records those choices without granting approval to unrelated applications or historical brand candidates.

| Decision | Direction |
| --- | --- |
| Repository | Existing public `j3w1/ce-theme`; register through CE and in Orca |
| Deliverable | Tokens, HTML/CSS recipes, guidelines, and a visual reference site |
| Audience | Brand-wide; retail examples first, with internal-tool, marketing, and signage applications |
| Visual direction | Image-led retail layout and hierarchy following the owner's retail reference; white surfaces with Casa Elida red/yellow accents |
| Palette | Red-background logo family: red `#E6303D`, yellow `#F9EB10`; darker red for white-text actions |
| Logos | Both owner-supplied company logo files, unchanged |
| Theme | Light first; semantic roles allow later themes |
| Language | Spanish interface and examples; English technical documentation |
| Price formatting | Compact reference format: `S/550`, `S/16`, `S/20.5` |
| Implementation | Framework-neutral HTML/CSS recipes rather than a Vue library |
| Product emphasis | Product code display, prominent prices, offer blocks, and campaign callouts |

Implementation defaults: Noto Sans weights 400/600/700/800; DTCG 2025.10 token sources; `--ce-` variables; `ce-` classes; static Astro site; Node 24 and pnpm 12.14.0. The foundation uses local generation and CI without automatically deploying or changing a consumer.

## Revisions

Later owner instructions supersede the rows above where they conflict. Proposals awaiting approval are tracked in [the design evolution record](evolution/2026-10-design-evolution.md), not here.

| Date | Decision | Direction | Source |
| --- | --- | --- | --- |
| 2026-10-23 | Typeface | Inter replaces Noto Sans as the primary family. The owner-supplied Inter 3.015 files are authoritative; weights 400/600/700/800 are self-hosted from `fonts/inter/`. | Owner design-evolution brief and `inter.zip`, 2026-10-23 |
| 2026-10-23 | Image tagging | Tagging products and features directly on photography is a required pattern, so customers can tell what is priced and what is described. | Owner design-evolution brief, 2026-10-23 |
| 2026-10-23 | Scope | `ce-theme` is the canonical specification for the Casa Elida ecosystem (ecommerce, CE Systems, CE Meta, CE Radio and future applications). It defines presentation of verified data; CE Systems and commerce services own the records. | Owner design-evolution brief, 2026-10-23 |
| 2026-10-23 | Sharing | Product links shared through WhatsApp and social platforms are a first-class experience with specified previews and metadata. | Owner design-evolution brief, 2026-10-23 |
| 2026-10-23 | Retail direction | The retail experience closely follows the owner's mandatory retail reference: image-led composition, restrained interface, compact product information, product grids and rails, shoppable photographs. Casa Elida's identity, Inter, palette and product rules take precedence wherever they differ. | Owner consolidated brief, 2026-10-23 |
| 2026-10-23 | Product NAME | Uppercase catalogue name or model (`WILUL`, `BALTEL STORM`), separate from Description and identifiers. | Owner consolidated brief |
| 2026-10-23 | Description | Title Case with Spanish connectors in lowercase (`Frasco con Cucharita`); about 1px larger than NAME at the 16px reference (ratio 15:16), kept in print. | Owner consolidated brief |
| 2026-10-23 | Specifications | Lowercase except abbreviations, proper names, technical designations and case-sensitive units; actual values preserved. | Owner consolidated brief |
| 2026-10-23 | CE code badge | Black, bold white uppercase CE code, proportional padding (0.3em × 0.35em), slightly rounded corners (0.2em); on-screen underline of the four-digit number only. | Owner consolidated brief; `1688toPL` code display |
| 2026-10-23 | Image markers | `A`, `B`, `C` without periods; solid black circles with bold white letters; no white ring, no red default; separate focus indicator. | Owner consolidated brief |
| 2026-10-23 | P4 currency | Superseded on 2026-10-25: see P4b. | Owner consolidated brief |
| 2026-10-25 | P4b currency | The raised `S/` is the default; `S/` on the baseline is the fallback (`ce-price--baseline`). `ce-price--raised` stays as an alias. Fraction digits stay full size. | Owner review |
| 2026-10-25 | Codes | Product codes are always one line and never wrap (`ce-code` is `nowrap`); corners are barely rounded (`radius.code` 2px). | Owner review |
| 2026-10-25 | Links | Text links are bold. | Owner review |
| 2026-10-25 | Tags and yellow | Yellow means promotion only (offer prices and promotion surfaces); it is never a ground or a tint behind a product photo. Product tags use the colours of the old casaelida.com: Novedad green `#368500` with white text (the old site's `#47b900` darkened so white passes AA), Promo amber `#ec9e00`, Top en ventas `#e00751`, Edición limitada black `#000000` (`color.tag.*`). The word is “Novedad”, not “Nuevo”. Mosaic layout is unchanged. | Owner review |
| 2026-10-25 | Feature tags | Feature tags stay inside the photo of the product they describe and never overlap each other, a marker or a neighbouring photo. | Owner review |
| 2026-10-25 | Standard names | Every pattern has one stable English id and one Spanish name (`recipes/names.mjs`, `docs/names.md`): PricePromo (yellow price), ProductIdentity, ProductStack, CECode and the rest. Say the name, not the look. | Owner review |
| 2026-10-25 | Product NAME | Every product shown anywhere must have a NAME; `productView()` refuses a product without one. NAMEs are invented, unique, one or two uppercase words. | Owner review |
| 2026-10-25 | Product stack spacing | NAME, Description and specs are 2px apart and the price follows the specs at 12px (`size.product.*`), never pushed to the bottom of the card. Prices are not aligned across cards. | Owner review |
| 2026-10-25 | Pack price | A price may carry the supplied basis after a slash, bold, on the baseline (`/pack de 12`, `ce-price-pack`). | Owner review |
| 2026-10-25 | Currency style (replaces P4b) | The default is S/ in line base (S/ at 46% on the baseline). The second option is S/ unido (S/ at the size of the figures, attached: `ce-price--joined`). S/ elevado (`ce-price--raised`) remains a supported variant. | Owner review |
| 2026-10-25 | Price basis | Text after a price that says what it covers leans to the top, bold. Two kinds: Unidad (“cada uno”, short form “c/u” in narrow places) and Presentación (“/pack de 12”, “/par”). In Promo and Rebajas prices the colour box surrounds only S/ and the figures, never the basis. | Owner review |
| 2026-10-25 | Old price and discount | “Antes” with the struck price is the PriceOld; the DiscountLabel is the supplied percentage in red with tight padding. | Owner review |
| 2026-10-25 | Add to cart | The button reads “Añadir al carrito”. On hover-capable screens only an icon appears on card hover or focus; on touch and narrow screens a full-width button sits at the bottom of the card. The header still says “Bolsa”: open question whether the noun changes everywhere. | Owner review |
| 2026-10-25 | Gondola label | NAME smaller; Description bold and larger; specs in lowercase below it; the price is the largest element. | Owner review |
| 2026-10-23 | P5 promotions | The yellow price block is the default promotion; the red block or card and `REBAJAS` treatments remain supported (`ce-price--sale`). | Owner consolidated brief |
| 2026-10-23 | Campaign colours | Authorized users may choose campaign colours per campaign (`ce-campaign`, checked by `recipes/campaign.mjs`) without changing global tokens or legibility. | Owner consolidated brief |
| 2026-10-23 | P9 public previews | No price in default public link previews, titles or descriptions, even when prices match across stores. | Owner consolidated brief |
| 2026-10-23 | Logos | Supplied logo files only, unchanged; the black monochrome wordmark is the quiet treatment on light surfaces. | Owner consolidated brief; `decisions.zip` |
| 2026-10-25 | Native controls | No application interface shows an unstyled browser control where a ce-theme equivalent exists. Native elements are styled first and progressively enhanced (`appearance: base-select` for selects); complex widgets use established accessible primitives; browser- and OS-owned UI stays native. See [controls.md](controls.md). | Owner Native HTML Control Styling Policy, 2026-10-25 |
| 2026-10-25 | Link previews | The share image follows the gondola label order (NAME small and heavy, Description bold and loudest, specs semibold, code in the foot) with the wordmark at 240 px; every page type has a specified variant. | Owner review of the share previews, 2026-10-25 |
| 2026-10-25 | Photo tagging on the web | On the website, products are tagged with pins: a dot on the photo that opens a product card (NAME, Description, price, chevron link) on hover, focus or tap. Lettered A, B, C markers are used only where hovering is not available, such as social posts, print and share images. | Owner review, 2026-10-25 |
