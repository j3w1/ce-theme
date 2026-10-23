# Design evolution, October 2026

Record of the evidence review, assessment and proposals made on 2026-10-23 for the owner's design-evolution brief. **Nothing here is an approved standard until the owner reviews it.** Confirmed decisions are copied into [decisions.md](https://github.com/j3w1/ce-theme/blob/main/docs/decisions.md); everything else stays here with its status.

Status labels:

| Label | Meaning |
| --- | --- |
| **Confirmed** | Stated by the owner; recorded in `decisions.md`. |
| **Implemented, pending review** | Change made on this branch so it can be reviewed in code and in Claude Design; reversible by reverting the listed files. |
| **Proposed** | Recommendation with evidence; not implemented in the canonical recipes. |
| **Open** | Needs an owner decision or material that has not been supplied. |

## 1. Sources

| ID | Source | Content | Role and reliability | What can be derived | Limits |
| --- | --- | --- | --- | --- | --- |
| S1 | `j3w1/ce-theme` at `f004fae` | 98 DTCG tokens, recipes, docs, Astro reference site, Design System bundle | Canonical, version-controlled specification | Approved rules, contracts, accessibility baseline | Built from September evidence; Noto Sans now superseded |
| S2 | `ig_posts.zip` + `ig_posts_2.zip` | 78 slides from 12 Instagram carousel posts, 2026-10-11 to 2026-10-22, 2048 × 2048 | Primary evidence of current communication; owner-supplied originals without app chrome | Recurring layouts, product-information order, tagging conventions, offer treatments, palette check | 12 days, not two months; Christmas pre-sale dominates; layout software and fonts unknown; prices and availability are historical |
| S3 | `stories.zip` | 5 Instagram story screenshots, 2026-09-25 | Earlier style that S1 was derived from | Code label, name, details, price hierarchy | Screenshots include Instagram interface chrome; never copy into public assets |
| S4 | casaelida.com, fetched 2026-10-23 | Live home and product pages | Historical reference for terminology, catalogue structure, data and current metadata | Categories, product fields, per-store pricing, store names, metadata gaps | Old template with residue (size guide on a mat, review count); not an architectural model |
| S5 | IKEA US homepage (saved HTML, screenshot) | Mature image-centred home-goods retail | Principles only | Discovery patterns, card anatomy, image ratios, price markup, metadata practice | Saved with extension CSS and blanked scripts; not to be copied |
| S6 | `inter.zip` | Inter 3.015, 9 weights × roman/italic, TTF/OTF/WOFF/WOFF2/EOT | Authoritative typeface files | Families, weights, features, license | No variable font; no license file in the archive (license read from font metadata: SIL OFL 1.1) |
| S7 | Owner brief, 2026-10-23 | Scope, Inter, image-first commerce, sharing, tagging, governance | Authoritative instruction | Confirmed decisions D1–D4 | — |

## 2. What the evidence shows

### Casa Elida (S2, S3, S4)

Peruvian home-goods retailer (legal name Comercial Elida EIRL) with stores (“sedes”) in Tacna and Arequipa, retail and wholesale sales, WhatsApp as a primary contact channel, and the tagline “el buen gusto, no cuesta más”. The catalogue has 17 top-level categories, from Baño and Cocina to Navidad and Gift Cards. Products have an uppercase catalogue alias (MENE, TILEN), a descriptive name, material and size details, and a price that can differ by store.

### Recurring conventions in the October posts (S2)

Counts are slides out of 78.

| Convention | Frequency | Classification |
| --- | --- | --- |
| Lifestyle photo, full bleed, product in real use; script wordmark top centre in black or white | Almost every product slide | Established |
| White rounded callout with a speech-bubble tail pointing at the product: thumbnail, bold name, ruler + size, hammer + material, `S/` + heavy price, optional “cada uno/una” | ≈62, in 11 of 12 posts | Established |
| Store availability line, bottom right: “*Disponible en todas las sedes.”, “*Disponible sólo sede Tacna.” / “Arequipa.” | Nearly every product slide | Established content; asterisk style is campaign-specific |
| Feature tag: dot + leader line + short phrase with one emphasised word (“tiene **4 divisiones**”, “organizador **apilable**”, “**Absorbe** el agua”) | ≈8, 3 posts | Recurring |
| Round detail inset with curved label (“bolsillo interior”, “retiene suciedad”) | ≈7, 2 posts | Recurring |
| Lettered red markers (A., B., C.) on the photo, matched by a lettered product strip below with code, name, specs, price and per-item availability; yellow marker and “PROMO” pill for the promoted item; “Disponibilidad para envío sujeta a stock.” | 4 slides, newest post (10-22) | New, directly addresses the tagging requirement |
| Cover slide: large condensed all-caps title, red pill subtitle shaped like a speech bubble, 3D mascot (woman in red Casa Elida shirt) | ≈10 | Campaign convention; mascot and display face need approval to become standards |
| “COMENTA PREVENTA NAVIDAD / Y TE ENVIAMOS EL CATÁLOGO” gold serif box | 6 posts | Seasonal, Christmas 2026 only |
| Offer, three treatments: red callout with yellow price + “antes” + red “REBAJAS” block (3 slides); white callout with red price + struck “antes: S/24” (≈14); yellow price block (stories, S1) | Mixed | Inconsistent; needs one standard (P5) |

Palette check: campaign red samples at `#e4303c` and promo yellow at `#fcec00`, matching `ce-color-brand-red` `#e6303d` and `ce-color-brand-yellow` `#f9eb10` within JPEG error. The live site's `theme-color` is `#da2e3a`, the existing action red. **The palette is confirmed by current evidence; no color change is proposed.**

Typography in the posts is a geometric sans that resembles Poppins for names and prices, and a condensed display face for covers. The files are not supplied and the fonts are not identified with certainty. The live site self-hosts faces it calls `ElidaInter` and `ElidaMuller`; their files and licenses were not inspected. Inter is now the confirmed family (D1).

Data-quality notes found in the sources (not to be reproduced):

- Post 2026-10-18, slide 9: a tree-and-house ornament is labelled “Adorno Snowman con luz”.
- Site: the discount reads “Antes --7.69%” (double sign; computed).
- Site: a shoe-style size guide (S/M/L/XL) appears on a shower mat.
- Site: the cart shows `$200.00`.
- Site: `<html lang="en">`.

### Transferable principles from the IKEA reference (S5)

Taken: square product photos with space reserved before load; one price built from parts with a single readable label; offer terms printed as supplied; small type scale with two weights at most for UI; availability always as words, never color alone; carousels that let the next card peek, each with labelled controls; eager loading only for first-screen images; canonical, Open Graph and organisation structured data.

Not taken: IKEA identity, loyalty pricing colours, product naming style, the 19-section homepage, US-specific store and ZIP selectors.

## 3. Assessment of the foundation (S1)

| Area | Retain | Reconsider | Missing (added or proposed) |
| --- | --- | --- | --- |
| Color | All 52 color tokens; action red for white text; yellow only with ink | — | — |
| Typography | Scale, weights 400/600/700/800, price at 800 | Noto Sans → Inter (D1, done) | Code disambiguation `ss04` (P2) |
| Price | Decimal strings, compact format, no computed discounts, `Antes` + struck amount | Currency alignment (P4); offer treatment (P5) | — |
| Product information | Code → name → details → price order; codes as strings | Details as one string → attribute rows | `ce-specs` with icons, `ce-availability` (P3, done) |
| Imagery | Whole product, `contain`, 8% safety margin, live text over photos | — | Tagging recipes (D2, done); image formats and ratios in sharing contract |
| Components | All 14 recipes | Callout gains bubble tail (done) | TaggedMedia, TagList, Specs, ShareCard |
| Platform scope | Framework-neutral recipes | Retail-only examples | Internal-tool density and data patterns (P8) |
| Sharing | — | — | Share card + metadata contract (D4, `docs/sharing.md`) |

## 4. Decisions and proposals

| ID | Item | Status | Evidence | Repository change |
| --- | --- | --- | --- | --- |
| D1 | Inter replaces Noto Sans; supplied files authoritative | **Confirmed**; implemented | S6, S7 | `fonts/inter/*`, `fonts/manifest.json`, `recipes/fonts.css`, `tokens/primitives.tokens.json` (`font.family`), `site/layouts/Layout.astro`, Noto package removed, `docs/usage.md`, `docs/assets.md`, `public/licenses/inter-OFL.txt` |
| D2 | Tagging on photography is a required pattern | **Confirmed**; recipes implemented, pending review | S7; S2 post 2026-10-22 lettered markers; leader-line tags | `ce-tagged-media`, `ce-hotspot`, `ce-hotspot--promo`, `ce-feature-tag`, `ce-detail-inset`, `ce-tag-list`, `ce-tag-item` in `recipes/recipes.css`; site demo `#etiquetas`; Design System `TaggedMedia`, `TagList` |
| D3 | `ce-theme` is the canonical spec for the whole ecosystem; data owned by CE Systems | **Confirmed** | S7 | `docs/decisions.md` revisions |
| D4 | Shared product links are first-class | **Confirmed**; spec proposed | S7; S4 metadata gaps | `docs/sharing.md`, `recipes/share-card.css`, Design System `ShareCard` |
| P1 | Speech-bubble callout tail (`ce-callout--bubble`) | **Implemented, pending review** | S2: ≈62 slides | `recipes/recipes.css`; `Callout` preview |
| P2 | Product codes use Inter `ss04` (distinct 0/O, 1/l/I without slashed zero) | **Implemented, pending review** | S6 features; codes such as `CE26031111R/12R` | one declaration on `.ce-code` |
| P3 | Attribute rows with ruler and material icons; store availability line | **Implemented, pending review** | S2 callouts; S4 per-store stock | `ce-specs`, `ce-spec`, `ce-availability`, `material` icon in `site/data/icons.mjs` |
| P4 | Currency `S/` on the amount's baseline at about 45%, as in all October posts, instead of top-aligned | **Open** | S2 (baseline) vs S3/S1 (top) vs S5 (raised) | None; shown side by side in the Claude Design exploration |
| P5 | One offer treatment: keep the yellow price block on web; in campaigns allow the red callout as a seasonal “REBAJAS” variant; drop red price text on white | **Open** | S2 three treatments; contrast: ink on yellow 15:1, yellow on action red 3.8:1 (large text only) | None |
| P6 | Campaign display face and mascot as brand assets | **Open**; owner to supply font files with license and mascot usage rules if they are to become standards | S2 cover slides | None |
| P7 | Monochrome wordmark (black and white) | **Open**; owner to supply official files | S2 every slide | None; supplied logos remain the only logo assets |
| P8 | Internal tools (CE Systems, CE Meta, CE Radio) use the same tokens with denser rows (40px controls, 12px cell padding) and no brand red outside primary actions | **Proposed** | S7 scope; S1 table recipe | None yet; shown in the Claude Design exploration |
| P9 | Per-store price on shared links: omit unless uniform or store-scoped | **Open** (business decision) | S4 “Precio por Sucursal” | Documented in `docs/sharing.md` |

## 5. Traceability

| Input | Decision | Repository location |
| --- | --- | --- |
| Brief §3 + `inter.zip` | D1 | `fonts/`, `recipes/fonts.css`, `tokens/primitives.tokens.json` |
| Brief “tagging in images” + post 2026-10-22 slides 1, 3–5 | D2 | `recipes/recipes.css` (tagging block), `site/pages/patrones.astro#etiquetas`, `design-system/components/TaggedMedia`, `TagList` |
| Posts 2026-10-13 slides 2, 3, 7, 8; 2026-10-17 slide 5 | D2 feature tags | `ce-feature-tag` |
| Posts 2026-10-15 slides 2, 4–8; 2026-10-20 slide 2 | D2 detail insets | `ce-detail-inset` |
| 11 of 12 posts, callout cards | P1, P3 | `ce-callout--bubble`, `ce-specs`, `ce-availability` |
| Brief §5 + casaelida.com metadata | D4 | `docs/sharing.md`, `recipes/share-card.css`, `design-system/components/ShareCard` |
| `inter.zip` font features | P2 | `.ce-code` |

## 6. Claude Design

The owner's private Casa Elida design system in Claude is re-synced from this branch. A separate design canvas holds the representative experiences: ecommerce home, product detail, shared-link previews, a tagged campaign post, and CE Systems screens. It marks proposals (P4, P5, P8) as such. The canvas is exploration; adopting anything from it means a change here, reviewed like any other.
