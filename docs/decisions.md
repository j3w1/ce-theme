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
| 2026-10-23 | P4 currency | `S/` on the baseline is the default; the raised `S/` remains a supported variant (`ce-price--raised`). Fraction digits stay full size. | Owner consolidated brief |
| 2026-10-23 | P5 promotions | The yellow price block is the default promotion; the red block or card and `REBAJAS` treatments remain supported (`ce-price--sale`). | Owner consolidated brief |
| 2026-10-23 | Campaign colours | Authorized users may choose campaign colours per campaign (`ce-campaign`, checked by `recipes/campaign.mjs`) without changing global tokens or legibility. | Owner consolidated brief |
| 2026-10-23 | P9 public previews | No price in default public link previews, titles or descriptions, even when prices match across stores. | Owner consolidated brief |
| 2026-10-23 | Logos | Supplied logo files only, unchanged; the black monochrome wordmark is the quiet treatment on light surfaces. | Owner consolidated brief; `decisions.zip` |
