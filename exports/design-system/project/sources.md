# Source inventory

What was inspected for the consolidated brief of 2026-10-23, what each source establishes, and what remains missing or uncertain. Reference captures and private material stay outside this public repository; only the files listed in `public/assets/manifest.json` (production) and `public/references/manifest.json` (reference-only) are distributed.

| Source | Inspected | Establishes | Limits |
| --- | --- | --- | --- |
| `j3w1/ce-theme` at `6bea940`, branch `claude/great-meitner-hw3udm` | Tokens, recipes, docs, site, tests, Design System bundle. No newer commits on any branch. | Starting point; approved decisions D1–D4. | Built before the locked decisions below. |
| Owner consolidated brief (2026-10-23) | Full text. | Locked decisions: NAME/Description/specs, code badge, black markers, P4, P5, campaign colours, P9; scope; mandatory retail reference. | Business contracts for checkout, pricing, HR and finance are not specified. |
| Retail reference: 10 saved pages (home, two category listings, offers hub, seasonal shop, kitchen event, company page, sign-in, order tracking, pick-up locations) plus an earlier home-page capture | Rendered offline without scripts at 1440px and 390px; markup and CSS read. | Layout system, component families, product-card anatomy, discovery and service patterns, image ratios. | Scripts were stripped, so interactions are markup only, not verified behaviour. Browser-extension styles and cookie banners were excluded. The private business systems behind the site are not visible. |
| `decisions.zip` (15 images) | All viewed. | Logo variants including the black monochrome wordmark; the WILUL product-card direction; baseline `S/` evidence; two historical 80 × 40 mm gondola labels; the gondola label tool and its fields; a brand tote-bag mock-up. | A third-party brand's bag photo and the internal label-tool screenshot are not distributed. The meaning of the “00” box in the label tool preview is unknown. |
| Instagram posts (78 slides, 2026-10-11 to 10-22) and stories (5, 2026-09-25) | All viewed (first brief). | Callouts, tagging, availability lines, palette check. | 12 days, not two months; historical prices. |
| casaelida.com (fetched 2026-10-23) | Home and one product page, raw HTML. | Categories, per-store prices (Tacna, Arequipa), metadata gaps. | Old template; not the target architecture. |
| `inter.zip` | Font tables read. | Inter 3.015, static weights, OFL 1.1, OpenType features. | No variable font; no licence file in the archive. |
| `j3w1/1688toPL` at `266249a` (read-only) | `docs/development.md`, packing model, code design/display, labels, product attributes, vocabularies, photo and tag editor, money format, tests. | Code structure and display, label outputs, field semantics; see [product identity](product-identity.md). | Not modified. Its Arial label artwork is not changed by this work. |
| Claude Design system and exploration canvas (private) | Read and updated. | Visual exploration only. | Not a specification; tied to the repository revision it was synced from. |

Not received or not accessible: `Casa Elida — Exploraciones.html` as a separate file, a written product-code instruction document (the label-tool screenshot was the only instruction material in the archive), live Instagram, physical printers and scanners, and the production ecommerce application.
