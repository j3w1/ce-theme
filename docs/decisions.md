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
