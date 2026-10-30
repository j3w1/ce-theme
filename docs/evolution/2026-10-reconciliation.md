# Branch reconciliation, October 2026

Review record for the first foundation pull request. It compares the development branch with the owner-approved direction so the owner can approve, change or drop each part before it reaches `main`. **Nothing on the branch is approved merely because it was built.**

- **Baseline:** `main` at `590616e`, the owner's 2026-10-22 foundation.
- **Branch:** `claude/great-meitner-hw3udm`, 19 agent-authored commits from 2026-10-23 to 2026-10-25 (`f004fae` … `2fd0cef`), plus this reconciliation and the first Vue components (2026-10-30). No earlier pull request exists.
- **Sources of approval:** rows in [decisions.md](../decisions.md) with an owner source. Claude Design canvases and the Claude Design System are explorations and generated copies; they approve nothing.
- **Not checked:** the shared CE devbox rules (`/etc/ce-devbox/AGENTS.md`) were not available in the environment that prepared this record.

## Status labels

| Label | Meaning | What merging does |
| --- | --- | --- |
| **Owner direction** | The owner stated it; recorded in `decisions.md` with a source. | Keeps the direction. Its implementation is still reviewed here. |
| **Pending review** | An agent's implementation of an owner direction, including values the owner did not specify. | Keeps it unless the owner rejects it in review. |
| **Agent proposal** | Built without an owner request. | Needs an explicit yes in review; otherwise it is removed before merge. |
| **Withdrawn** | Built, then reverted on the branch. | Nothing remains. |
| **Open** | Needs an owner decision or material. | Nothing is implemented, or the current behaviour is kept and labelled. |

## Inventory

| Area | Status | Owner source | Agent-chosen details to review | Where |
| --- | --- | --- | --- | --- |
| Claude Design System bundle | Owner direction; pending review | Request, 2026-10-23: make the repository ready for Claude Design | Card set and grouping, the minimal `components/bundle.js`, which media previews load | `design-system/`, `scripts/design-system.mjs`, `exports/design-system/` |
| Inter typeface (D1) | Owner direction | Brief and `inter.zip`, 2026-10-23 | — | `fonts/`, `recipes/fonts.css`, `tokens/` |
| Product identity: NAME, Description, specs, CE code badge | Owner direction | Consolidated brief, 2026-10-23; reviews, 2026-10-25 | Code `ss04` stylistic set (P2) | `recipes/product.mjs`, `recipes/recipes.css`, `docs/product-identity.md` |
| Product stack spacing | Owner direction; pending review | Review, 2026-10-25: tighter spacing | 2px within the identity, 12px before the price (`size.product.*`) | `tokens/`, `recipes/recipes.css` |
| Prices: S/ in line base by default, S/ unido, S/ elevado; basis labels; promo box; Antes and discount label; pack price | Owner direction; pending review | Reviews, 2026-10-25 | S/ at 46%; “c/u” below a 13.5rem container; discount label padding | `recipes/price.mjs`, `recipes/recipes.css`, `docs/pricing.md` |
| Promotions: yellow default, red `REBAJAS` | Owner direction (P5) | Consolidated brief | — | `ce-price--offer`, `ce-price--sale` |
| Tags and yellow-only-for-promotion | Owner direction; one value pending review | Review, 2026-10-25 | Novedad ships as `#368500`, not the owner's `#47b900`, because white on `#47b900` fails AA | `tokens/`, `color.tag.*` |
| Add to cart | Owner direction; **open** noun | Review, 2026-10-25 | Header still says “Bolsa”; the button says “Añadir al carrito” | `recipes/retail.css`, site |
| Standard names registry | Owner direction; pending review | Review, 2026-10-25; “standard names in Spanish are OK” | The 78 ids and Spanish names themselves | `recipes/names.mjs`, `docs/names.md` |
| Image tagging: feature tags, letters for static media, pins on the web | Owner direction; pending review | Brief, 2026-10-23; reviews, 2026-10-25 | Pin size (28px dot, 44px target), card width (up to 17rem), card ring | `recipes/recipes.css`, `recipes/behaviors.mjs` |
| Gondola price label | Owner direction; pending review | Review, 2026-10-25 | Millimetre sizes | `recipes/print-label.css` |
| Sharing: price-free previews, metadata contract (D4, P9) | Owner direction | Brief and consolidated brief, 2026-10-23 | — | `docs/sharing.md` |
| Link-preview layout | Owner direction; pending review | Review, 2026-10-25: like the gondola label, better logo size, show every type | 240px wordmark; the reference tote photo used as the illustrative “photo” sample | `recipes/share-card.css`, `site/pages/compartir.astro` |
| Native control policy | Owner direction; pending review | Native HTML Control Styling Policy, 2026-10-25 | Control recipes, the inventory in `controls.md`, the browser test's allowances | `recipes/interface.css`, `docs/controls.md` |
| Campaign colours | Owner direction | Consolidated brief | — | `recipes/campaign.mjs` |
| Callout speech-bubble tail (P1), specs rows and availability line (P3) | Pending review | Evidence from the October posts; never confirmed | Whole patterns | `ce-callout--bubble`, `ce-specs`, `ce-availability` |
| Retail component families | Pending review | Consolidated brief (retail direction) | Every recipe in `retail.css` beyond the product card | `recipes/retail.css`, `/tienda/` |
| Internal-tool recipes (P8) | **Agent proposal** | P8 was proposed, never confirmed | Density, app shell, data tables, editors, audit, POS. CE Systems is now rebuilt in `j3w1/casaelida.com`; these are inputs, not approved patterns | `recipes/workspace.css`, `/sistemas/` |
| Vuetify adapter | **Agent proposal**; recommend removal | None | Built for the old Laravel/Vuexy CE Systems, which is not inherited (2026-10-30). Labelled legacy; not for new applications | `exports/adapters/vuetify.mjs`, `scripts/adapters.mjs` |
| CE Radio cards and badges in the design system | Owner direction; pending review | Request, 2026-10-25: apply ce-theme to CE Radio | Captured from unmerged `j3w1/ce-radio` work; they follow that repository's review | `design-system/components/Radio*`, `public/assets/logo-ce-radio*.png` |
| Separate CE Radio dark theme | **Withdrawn** | Owner clarified, 2026-10-25 | — | `0f3c76b`, reverted in `96b3e2b` |
| Campaign display face, mascot (P6), monochrome wordmark (P7) | **Open** | Owner to supply files | — | None |
| Reference site pages | Pending review as showcase only | 2026-10-30: Astro is the showcase | Store, systems and share pages are fixtures, not product decisions | `site/` |

## Corrections made in this reconciliation

- `decisions.md` no longer presents agent-chosen values as owner decisions: the Novedad green records the owner's `#47b900` and marks the darkened `#368500` pending review; the link-preview wordmark size is marked pending review.
- The superseded rows (Vue-free implementation, Noto Sans, P4b) say so.
- The 2026-10-30 rows record the component stack, the CE Systems rebuild, the workflow and the delivery limits.
- The evolution record's status table now matches what was decided and built.
- The Vuetify adapter is labelled legacy in the adoption and usage guides.

## Approval checklist

The pull request repeats this list. For each line the owner answers yes, change, or drop; dropped items are removed on the branch before merge.

1. Agent-chosen values under “Owner direction; pending review” above.
2. Novedad green: keep `#368500` (AA) or use `#47b900` with dark text.
3. Internal-tool recipes (`workspace.css`): keep as proposals, or drop until CE Systems needs them.
4. Vuetify adapter: remove now or in a later pull request.
5. Add to cart noun: “Bolsa” or “Carrito” throughout.
6. The `@casaelida/vue` package and its first components (Button, TextField, Price, ProductCode).
