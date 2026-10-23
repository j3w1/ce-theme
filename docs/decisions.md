# Foundation decisions

These choices were made by the owner in the implementation-planning conversation on 2026-10-22. The implementation records those choices without granting approval to unrelated applications or historical brand candidates.

| Decision | Direction |
| --- | --- |
| Repository | Existing public `j3w1/ce-theme`; register through CE and in Orca |
| Deliverable | Tokens, HTML/CSS recipes, guidelines, and a visual reference site |
| Audience | Brand-wide; retail examples first, with internal-tool, marketing, and signage applications |
| Visual direction | IKEA-inspired layout and hierarchy; white surfaces with Casa Elida red/yellow accents |
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
