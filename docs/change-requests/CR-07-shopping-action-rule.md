Status: Implemented in CE Theme by pull request [#24](https://github.com/j3w1/ce-theme/pull/24): the recipe in `recipes/retail.css`, the `ProductCard`, `ProductDetail` and `TaggedMedia` guidelines and previews, `QuickAdd` and the re-scoped `AddToCart` in the names registry, the “Shopping actions (CR-07)” row in `docs/decisions.md`, `docs/coverage.md` and the `/tienda/` reference pages. Decisions 2, 3, 4, 6 and 7 were decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed ([issue #11 comment](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)); j3w1 may veto any of them. The implementation choices recorded under section 6 are the lead's implementation judgment under the same delegation.

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

**Implemented with the recipe.** Checks 1 to 4 are `tests/browser/shopping-actions.spec.mjs`; check 5 is `tests/shopping-actions.test.mjs` with the existing naming and registry tests (`tests/vue-naming.test.mjs`, the generated-file check). Check 6 is still not run: no screen reader, real phone or real hover device was used, and nothing here claims one.

- **Row height (check 2).** Measured in Chromium with the generated CSS: NAME with a one-line Description is 39.19px tall, so the in-flow 44px action of 4.1 grew the row to 44px and moved the specs and the price 4.81px down (Description to specs 6.81px instead of 2px). The lead did not take the negative block margin or a change to check 2. Instead, on hover-capable screens from 640px, the action is positioned at the top inline-end corner of `ce-product-row`, out of the row's height. Its column stays clear: the row, the line that follows it and, with no Description, the line after that keep `--ce-size-target-public` plus the 12px row gap free at the inline end. No class, slot or markup was added.
- **A card with no room (check 2, measured conflict).** A NAME with no Description and no specs is 18px tall, so the price starts 30px below the row top, inside the action's 44px. A price is one unbreakable line, so no reserved space can move it. Minimal counterexample, with Inter loaded: a 150px card at a 1440px viewport, default text, NAME «MENE», price S/12.5. The digits ran 8.0px × 1.9px under the action, and S/1250.90 ran 8.0 × 44.0px; in a 200px card S/1250.90 ran 8.0 × 6.9px. The full 44 × 44 action, the 12px gap, an unmoved price and no overlap cannot all hold there with the existing markup. The repository lead chose, under the same delegation and not j3w1-typed, not to show the optional quick-add on a card with no Description and no specs, enforced in the recipe at every width. Buying stays on the product page. Empty Description or specs elements count as absent. An element that holds only white space cannot be told from text by any selector (`:empty` does not match it, and `:blank` is not implemented), so it is outside the guarantee. The markup contract is that the Description and specs are rendered only when they have text, as `productView()` gives them: it returns no Description and no specs for blank or whitespace-only input, and the reference card renders through it.
- **Whole card on touch and narrow screens (check 1).** On `(hover: none)` and below 640px the action is `display: none`, and the `ce-product-link` covers the card through its `::after`. Every other native control in the card (variant thumbnails, «Comparar», a list's own task, a control in the photo box) is lifted above it by a zero-specificity rule, so it keeps its own target and the keyboard order is unchanged. The photo's own link, which goes to the same page, is not lifted, so it cannot cover a control placed before it in the photo box. Nothing is nested in the link. The tests count which control each click or tap reached, then wait for the URL. Taps and clicks on the photo, identity, specs, price, availability and empty card space open the product page; a variant link, «Comparar», a task button and a control in the photo box keep their own behaviour. Removing the link's `::after` fails these tests, and removing the rule that lifts the other controls leaves them untappable. Limits, written in the ProductCard guideline: native controls only (a custom `role="button"` element is not lifted), no ancestor that creates its own stacking context around a control, and no positioned element between the card and its link.
- **What the geometry test proves.** The test page loads the supplied Inter files (it checks that the four faces loaded), the generated tokens and the generated recipes. It renders sixteen card shapes in 300, 200 and 150px cards at a 1440px viewport, each with and without the action, in left-to-right and right-to-left. The shapes are:
  - one- and two-line Descriptions;
  - no specs, and no specs with a wide price;
  - no Description, and no Description with a wide price;
  - NAME only, with a price, a wide price or a store note;
  - NAME only with empty Description and specs elements, with a price or a wide price;
  - a store note;
  - a wide price (S/1250.90);
  - long text;
  - unbreakable specs;
  - a card with a variant link, «Comparar» and a task button.

  It runs eight text sizes, and each run asserts the computed font sizes it names:
  - default text;
  - root text at 150% and 200% (the rem-based text grows; the card price is set in px and stays 44px);
  - every text at ×1.5 and ×2 (root text at 150% and 200%, with the test page setting the px card price to 66 and 88px);
  - product text set to 24px, 14px and 12px.

  Text under the action is measured as glyph ink (the font's own bounds through `measureText`), so the empty space of a line box or of the font's content area does not count. For each card that can show the action, the test checks:
  - the action is 44 × 44 at the inline end;
  - seven points inside it hit the action, and it takes focus;
  - no text ink and no other target lies under it;
  - the product link's focus ring ends before it;
  - the row is exactly the heading's height;
  - the gaps are 2px and 12px;
  - with the same text layout, the price sits where it sits without the action.

  For the NAME-only shapes, the action has no box, takes no focus and is not under a pointer, no space is reserved, and the price sits as in the card without it. Removing the corridor rules, or the NAME-only rule, makes the matrix fail. Nothing is claimed for text sizes not listed here.
- **Legacy markup (check 2b).** A card that keeps `<button class="ce-button ce-product-add">` renders no visible add at 1440, at 390 and under `(hover: none)`. Removing the deprecated rule makes these tests fail. The previews and the reference pages no longer contain the element (`tests/shopping-actions.test.mjs`).
- **Touch.** `(hover: none)` is emulated with a touch context. The tests skip, and say so, in a browser that does not apply it. Locally only Chromium was run; hosted CI also runs WebKit.
- **Sticky bar (check 4).** CE Theme ships no sticky-bar recipe, so the rule is written for consumers, and the test only confirms that the reference product page has no such bar.

## 7. Risks and what it does not change

- It reverses the behaviour rule of a decision recorded on 2026-10-25; the copy of that decision, «Añadir al carrito», stands (X-6). The boards say j3w1 approved the direction as a design default. The new `decisions.md` row records the repository lead's selection, decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed ([issue #11 comment](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)); j3w1 may veto it. It is not a merge authorization, and the merge order stays with the lead.
- Consumers of the card recipe (the CE Theme reference site, `/tienda/` pages) that keep the `ce-product-add` element: with the deprecated rule the button disappears at every width (today it shows on touch and narrow screens only); if the rule were dropped instead, the button would appear at every width including desktop (`.ce-button` is `display: inline-flex`, line 9). Either way their markup must change; their review is **to do** (not seen).
- The quick action is hidden with `opacity: 0` rather than removed from the tree; some teams may prefer `visibility`. Left as the recipe has it.
- Touch quick-buy is not designed: `AccionesCompra` says it must be designed and validated separately if ever proposed.
- Not changed: price recipes, `ce-stock`, the PDP buy box, the cart, favourites page, business rules (quote, stock, limits) and add-to-cart eligibility, which the proposed decisions row deliberately leaves to the service (point 7).

## 8. Owner decisions needed

1. Copy: Decided (X-6, X-8, 2026-11-06): «carrito» / «Añadir al carrito». «Bolsa» and «Añadir a la bolsa» are not used anywhere in the design system.
2. Decided, decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed ([issue #11 comment](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)): the behaviour row is revised as proposed (browse-first cards, the optional quick-add on the active desktop card, whole-card navigation on touch and narrow layouts, one primary product-page action and the sticky-bar substitution). The 2026-10-25 row stays visible, marked superseded for behaviour. «Añadir al carrito» is kept, and the fixture eligibility rules stay out of the shared ledger.
3. Decided, decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed ([issue #11 comment](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)): the deprecated `ce-product-add { display: none }` safeguard stays until the preview and the consumers have removed the element. There is no opt-in list variant; the safeguard is removed only in an evidenced later cleanup.
4. Decided, decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed ([issue #11 comment](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)): the quick-add uses the 44px public-target token, which replaces the 40px card-action exception for this control only.
5. Names: Decided (X-8, 2026-11-06): `QuickAdd` is added, accepted with its change; `AddToCart` is kept and re-scoped to the single primary action on the product page; `AddToBag` is retired and not added.
6. Decided, decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed ([issue #11 comment](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)): the same rule applies to an open pin card, with an optional quick-add only in the active desktop or hover presentation, the same keyboard access and no touch quick-buy exception. Following the lead, this is documented only: the pin card stays a product link with no purchase control by default, and an application's quick-add must be a separate control outside that link. No pin slot, markup or placement is added, and no pin quick-add is implemented or proved here.
7. Decided, decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed ([issue #11 comment](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)): no sticky buy-bar recipe in this request, and no new request merely to reserve one. The written consumer substitution rule stays; a concrete later need can propose a separate recipe.
