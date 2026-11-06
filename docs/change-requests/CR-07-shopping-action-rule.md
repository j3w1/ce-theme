Status: Ready for owner review; not submitted anywhere

# CR-07 · Shopping-action rule: browse first, contextual quick-add, one primary action on the product page

| | |
|---|---|
| Kind | Shared-pattern candidate that **reverses the behaviour rule of a recorded decision**: revision of the "Add to cart" rule (recipe, documentation, standard name); the copy of that decision, «Añadir al carrito», stands (X-6) |
| CE Theme target | `ce-product-row` quick action, `ce-product-add`, favourite button in `ce-product-media` (`bundle.css` lines 90, 564-567, 570-575); `components/ProductCard/README.md` and `preview.html`; `decisions.md` row 2026-10-25 "Add to cart"; `names.md` (`AddToCart`); `coverage.md` (product card row) |
| Depends on | Nothing technically. The wording question is closed (X-6, X-8: «carrito», «Añadir al carrito») |
| Checked against | CE Theme — Design System artifact version 1793881448-c98f (design-system.json: re-synced to `j3w1/ce-theme@e8b8d7a8`; `bundle.css` sha256 `de102fad7d927541e3c31c2c30dd770fa0d0fca3b4000a84a9e5bfcb7353ed06`) and the workbench boards of 5 November 2026. Evidence tags **[A] [S] [R] [H]** are explained in CR-08. |

## 1. Summary

CE Theme today says: on hover-capable screens an add icon appears on card hover or focus; on touch and narrow screens a full-width «Añadir al carrito» button sits under every card; and every card carries a favourite heart. The owner's later direction (2 November 2026, recorded on `AccionesCompra`; default approved 5 November 2026, `Decisions01Open` row 15) is the opposite for touch: listings are for scanning, the whole card opens the product page, and buying has one primary button on the product page. All 74 boards that draw product cards follow the new direction by markup, while the installed recipe still ships the old rule. The request: bring the recipe, the card guideline, the names registry and the decisions record in line, and keep the copy «Añadir al carrito» (X-6, X-8).

## 2. Problem and evidence

**What CE Theme says now** [A]:
- `decisions.md`, 2026-10-25 "Add to cart": "The button reads «Añadir al carrito». On hover-capable screens only an icon appears on card hover or focus; on touch and narrow screens a full-width button sits at the bottom of the card. The header still says «Bolsa»: open question whether the noun changes everywhere." X-6 (decided 2026-11-06) answers that question: the noun is «carrito» everywhere, so the header changes too.
- `names.md` (`AddToCart`, section "Add to cart"): the same rule, class names `ce-product-add`, `ce-icon-button--action`.
- `bundle.css` lines 564-567: `.ce-product-row > .ce-icon-button--action { opacity: 0 }` shown on `:hover` and `:focus-within`; `.ce-product-add { display: none; width: 100%; margin-top: var(--ce-space-16) }`; `@media (hover: none), (max-width: 639.98px) { …--action { display: none } .ce-product-add { display: inline-flex } }`. Line 90: `.ce-product-media .ce-icon-button { position: absolute; right: 0; bottom: 0 }` (the favourite on each card). Line 572: `.ce-icon-button--small` is 40px.
- `components/ProductCard/preview.html`: all four cards carry a favourite toggle in the media box and three carry the full-width `ce-product-add` button «Añadir al carrito» (the fourth has no price).
- `README.md`: "Targets are 44-48px tall, 40px for card actions, never under 24px."

**The new rule, as the boards draw it** (`AccionesCompra`, AGENT-BRIEF section 3, CANON R-07, R-10, R-17) [S]:
1. Resting cards in rails and listings are browse-first: image, identity, price and store note or availability. No add button, no favourite, no full-width button.
2. On the active hovered or focused desktop card, an optional compact quick-add icon appears (a separate control from the product link; accessible name «Añadir {NAME}, {Description} al carrito»; `--ce-size-target-public`, 44px).
3. Touch and narrow: the whole card opens the product page; nothing is added from the card.
4. Product page: quantity, **one** primary «Añadir al carrito» (56px), and one quiet favourite with a product-specific name and a pressed state.
5. A sticky mobile bar substitutes for the inline action when it scrolls out of view; the two are never visible together.
6. Lists with their own task show only that task: favourites «Quitar de favoritos», cart «Quitar»; scenes and order summaries show named product links and no purchase toolbar per product.
7. In the **demonstration fixtures** (CANON R-17) the add is enabled whenever the selected store supplies a price, unknown availability does not block it, and it is disabled with a visible reason only with no store, no price in that store, a quote pending, an invalid quantity or a confirmed sold-out reading. That is fixture gating the boards follow, not a rule for the shared system: whether the add is enabled, disabled and for which reason is state supplied by the application or the commerce service, which may deny an add for any reason it supplies; the recipe only presents that state (a disabled control explains why).
8. Outcomes: «Añadiendo…» (adding), «Añadido. 1 en tu carrito.» only after a success, «No se pudo añadir. Tu carrito sigue igual.» with «Reintentar» on failure, «Elige tu tienda para ver precio y disponibilidad. Elegir tienda» with no store.

The points above are written with «carrito» (X-6, X-8). The boards draw the primary button, the quick action's name and the outcomes with the earlier noun («Añadir a la bolsa», «… a la bolsa», «tu bolsa»); that is frozen board copy that a later task rewrites (X-3, X-6), and it is not a proposal.

**Adoption in the boards** [S]: 483 `article.ce-product` cards in 74 boards. None carries `ce-product-add`; no favourite toggle was found inside any `ce-product-media` box. The quick-add icon (`ce-icon-button--action`) appears in AccionesCompra (1), Categoria (4) and Pub04Filtros (5), with a 44px override: `.ce-scope .ce-product-row > .ce-icon-button--small { flex-basis: 44px; width: 44px; min-height: 44px }` (Categoria, CategoriaMovil), inline 44px in Pub04Filtros, and in AccionesCompra card B 44px with `margin-block: -8px` so the heading row keeps its height. Pub09Ideas carries "the only optional quick-add" inside an open pin card as a 44px full-width add button (`.pin-x-add .ce-button { width: 100%; min-height: 44px }`). The product-page frames are `Pub06Producto` and `AccionesCompra` (states default, adding, no store, failure, added; sticky bar).

**What is recorded as not approved** [S]: `Decisions01Open` row 15 "Revised shopping actions and Spanish copy": "Default approved. Source adoption in CE Theme is not approved." `Decisions02Acceptance`: "The installed recipe CSS still ships the old rule (full-width add on touch, hover icon). The boards avoid it by markup, so source adoption in CE Theme is future work […] no CE Theme change is approved."

**Owner research.** The direction rests on the owner's own retail research, which these documents deliberately do not name. `AccionesCompra` states that real hover and a real phone were not tested.

## 3. Current state in CE Theme

**Exists, with the opposite rule for touch.** Checked: the files named in the table above, `components/ProductDetail/README.md` (`ce-buy-actions`: quantity, the add `ce-button`, favourite `ce-icon-button`; `.ce-buy-actions .ce-button { flex: 1 1 180px; min-height: 56px }`, `bundle.css` line 600, which already matches the 56px primary). **Missing:** any sticky buy bar recipe (a search of `bundle.css` for "sticky" finds only the site header, filter bar, listing aside, buy box, order summary, app bar and table header). Not a Vue export (`CEProductCard` does not exist; `Shared01Inventory`).

## 4. Proposed change

**4.1 Recipe** (`ce-product-row`, existing names):

```css
.ce-product-row > .ce-icon-button--action { opacity: 0; transition: opacity var(--ce-motion-quick);
  flex-basis: var(--ce-size-target-public); width: var(--ce-size-target-public);
  min-height: var(--ce-size-target-public); }                               /* 44px: size.target.public, X-1 */
.ce-product:hover .ce-product-row > .ce-icon-button--action,
.ce-product:focus-within .ce-product-row > .ce-icon-button--action { opacity: 1; }
@media (hover: none), (max-width: 639.98px) { .ce-product-row > .ce-icon-button--action { display: none; } }
@media (prefers-reduced-motion: reduce) { .ce-product-row > .ce-icon-button--action { transition: none; } }   /* new: see section 5, reduced motion */
.ce-product-add { display: none; }   /* deprecated: kept at every width while consumers remove the element; the media-query branch that showed it on touch is removed */
```

- Touch and narrow: the quick action is not shown and the card is one link (`ce-product-link`); the full-width button is no longer shown. This is a **markup migration**, not only a CSS change: the `ce-product-add` element must be removed from the preview and from consumer markup. Deleting the `.ce-product-add` rules alone would not remove it; a legacy `<button class="ce-button … ce-product-add">` would then inherit `display: inline-flex` from `.ce-button` (`bundle.css` line 9) and appear at every width, including desktop where line 566 hides it today. Hence the deprecated `display: none` rule above, kept until the consumers have migrated (owner decision 3).
- `--ce-size-target-public` (44px) target for the quick action (today 40px through `ce-icon-button--small`); the negative block margin the AccionesCompra card uses to keep the row height is **not** proposed; the row height with a 44px button is **to measure**.
- The class `ce-product-add`: keep the deprecated `display: none` rule until the preview and the consumers have removed the element (recommended; no board uses the class), then drop it; or keep it as an opt-in for a list with its own task (owner decision 3).
- The favourite toggle leaves the card preview and the ProductCard guideline; the CSS at line 90 can stay for other uses.
- The `opacity: 0` icon stays in the tab order and the accessibility tree; keyboard focus reveals it through `:focus-within`. Verify with a screen reader (not run).

**4.2 Documentation and records, in the same change:**
- `decisions.md`: a new dated row that supersedes the 2026-10-25 "Add to cart" row (the old row is kept and marked superseded, as the file does for Noto Sans and the component stack). The new row carries the copy «Añadir al carrito» forward (the 2026-10-25 decision stands on the copy) and closes the old row's open question about the header noun: «carrito» everywhere (X-6). The row records the hierarchy and the copy: points 1 to 6 (browse-first cards, optional quick-add on the active desktop card, whole-card link on touch, one primary action on the product page, sticky-bar substitution, task lists) and the outcome wording of point 8 as presentation of supplied outcomes. It does **not** record point 7: when the add is enabled or disabled and why is eligibility, supplied by the application or the commerce service; the R-17 conditions are a fixture-only example that stays in the boards and in the component README as an illustration, never as a row in the shared decisions file. CANON itself says the approved board defaults create no business rule.
- `names.md` and `recipes/names.mjs`: add `QuickAdd` («Añadir rápido», the contextual icon on the active card) and re-scope `AddToCart` («Añadir al carrito») to the single primary button on the product page, so its entry no longer describes the card icon and the touch button. `AddToCart` is not retired and no `AddToBag` is added (X-8).
- `ProductCard/README.md`: rewrite the "Add to cart" mentions and the per-card favourites sentence; keep the fixed 12px gap between specifications and price. `ProductCard/preview.html`: draw a resting card, an active card with the icon, and no heart or full-width button. `ProductDetail` card: add the five outcome states of point 8.
- `coverage.md`: the product card row (current wording, reworded by this request: "flag, favourite, add-to-bag, availability, more options, compare"; "add-to-bag" becomes add-to-cart, X-8) is reworded.
- Copy: «carrito» and «Añadir al carrito» everywhere (X-6, X-8). The remaining "bag" wording in CE Theme (the header's count, the `bag` and `bag-plus` icons, `coverage.md` rows, the Cart and ProductCard READMEs) is reworded to cart, with cart icons where an icon is needed; this request draws no icon.
- Not proposed here: a sticky buy-bar recipe (point 5 stays a written rule until the owner asks for a recipe) and the compare checkbox `ce-product-select` (no board draws «Comparar»; comparison is deferred, `Decisions01Open` row 16).

## 5. Accessibility and invariants it must keep

| Invariant | Applies? |
|---|---|
| NAME above Description, 2px / 2px / 12px; specs to price 12px | Yes, unchanged; the quick action sits in `ce-product-row` beside the heading and must not change the identity gaps |
| One-line CE code | Unchanged |
| Supplied decimal-string prices | The add action never carries an amount; the price comes from the supplied store price |
| Unknown availability is never "sold out"; in the demonstration fixtures it never blocks the add | Yes (CR-06 for the wording; R-17 for the fixture gating). Whether an add is enabled is supplied state in the shared system (point 7); the recipe only shows a disabled control with its reason |
| Focus ring | 2px outline, 3px offset on the quick action, the product link, the primary button and the favourite (existing global rule) |
| 44px public targets | The quick action rises from 40px to `--ce-size-target-public` (44px); the primary button stays 56px |
| Name of the control | The quick action's accessible name carries the product («Añadir MENE, Taza de Vidrio Resistente al Calor al carrito»); the product link and the quick action are separate controls |
| Disabled controls explain why | Yes, point 7 |
| Status never by colour alone | «Añadido», «No se pudo añadir», «Añadiendo…» are words |
| Reduced motion | **Existing gap, closed by this request.** The bundle's reduced-motion rule `.ce-button, .ce-chip, .ce-icon-button { transition: none }` (line 200) is less specific than `.ce-product-row > .ce-icon-button--action { transition: opacity … }` (line 564), and the later reduced-motion block (line 793) does not target the action, so the reveal still transitions under `prefers-reduced-motion: reduce` today. The new rule in 4.1 overrides the action selector itself |
| Hidden or disabled control is presentation, not authorization | Unchanged (`README.md`) |

## 6. Acceptance checks

To run when the repository work happens (not run here, except where marked):
1. By state, at 1440 with hover: a resting card shows no purchase control; a hovered or keyboard-focused card may show the optional quick-add icon and nothing else. Touch-emulated and 390px: no add of any kind, the whole card opens the product page. In every state: no heart in the media box and no full-width button.
2. The quick action measures 44 x 44 and does not move the price (identity and price gaps unchanged).
2b. Legacy markup: a card that still contains `<button class="ce-button ce-product-add">` renders no visible add at 1440, at 390 and under `(hover: none)` while the deprecated rule exists; a test that fails if the rule is removed before the preview and the reference pages have dropped the element.
2c. Under `prefers-reduced-motion: reduce`, the computed `transition` of a hovered or focused quick action is `none`.
3. Keyboard: Tab reaches the product link, then the quick action, which becomes visible with a ring; Enter activates it.
4. Product page: one primary button, one favourite; sticky bar (consumer) never visible together with the inline action.
5. `decisions.md`, `names.md`, `names.mjs`, README and card changes in one change; the repository's naming and registry tests (named in the decisions file) pass.
6. Screen reader and real-phone checks: **not run, to schedule** (the workbench records none).

## 7. Risks and what it does not change

- It reverses the behaviour rule of a decision recorded on 2026-10-25; the copy of that decision, «Añadir al carrito», stands (X-6). The boards say j3w1 approved the direction as a design default; the repository change needs j3w1's explicit approval of the new `decisions.md` row.
- Consumers of the card recipe (the CE Theme reference site, `/tienda/` pages) that keep the `ce-product-add` element: with the deprecated rule the button disappears at every width (today it shows on touch and narrow screens only); if the rule were dropped instead, the button would appear at every width including desktop (`.ce-button` is `display: inline-flex`, line 9). Either way their markup must change; their review is **to do** (not seen).
- The quick action is hidden with `opacity: 0` rather than removed from the tree; some teams may prefer `visibility`. Left as the recipe has it.
- Touch quick-buy is not designed: `AccionesCompra` says it must be designed and validated separately if ever proposed.
- Not changed: price recipes, `ce-stock`, the PDP buy box, the cart, favourites page, business rules (quote, stock, limits) and add-to-cart eligibility, which the proposed decisions row deliberately leaves to the service (point 7).

## 8. Owner decisions needed

1. Copy: Decided (X-6, X-8, 2026-11-06): «carrito» / «Añadir al carrito». «Bolsa» and «Añadir a la bolsa» are not used anywhere in the design system.
2. Approve superseding the behaviour rule of the 2026-10-25 "Add to cart" row (its copy «Añadir al carrito» stands: X-6).
3. `ce-product-add`: keep the deprecated `display: none` rule until the preview and consumers have removed the element (recommended), remove the class outright with a documented markup migration, or keep it as an opt-in for a list with its own task?
4. Quick-add target 44px (R-10; written with `--ce-size-target-public`, X-1) against the README's 40px "card actions" exception.
5. Names: Decided (X-8, 2026-11-06): `QuickAdd` is added, accepted with its change; `AddToCart` is kept and re-scoped to the single primary action on the product page; `AddToBag` is retired and not added.
6. Is the quick-add inside an open pin card (Pub09Ideas) part of the rule?
7. Ask for a sticky buy-bar recipe as a separate request?
