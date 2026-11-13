Status: Approved through X-1, X-7, X-8 and the lead's CR-05 selections; implemented in CE Theme source by pull request [#22](https://github.com/j3w1/ce-theme/pull/22). X-1, X-7 and X-8 are j3w1's decisions of 2026-11-06; decisions 1, 2 and 4 are the ce-theme lead's selections, decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed ([#11 comment](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)). The evidence below still describes the frozen boards of 5 November 2026 (X-3)

# CR-05 · Store-context bar: the in-page line "prices are for this store · change store"

| | |
|---|---|
| Kind | Shared-pattern candidate: composition of existing recipes (`ce-store-note` + `ce-link` + `ce-pill`) with documented states |
| CE Theme target | `ce-store-note` (standard name `StoreNote`) and `ce-store-context` (standard name `StoreContext`); `components/StoreContext/README.md`, `components/Cart/preview.html`; `names.md` |
| Depends on | Nothing. CR-04 notes that CE Theme's Cart preview shows a `ce-store-note` above the cart list; no other request depends on this one |
| Checked against | CE Theme — Design System artifact version 1793881448-c98f (design-system.json: re-synced to `j3w1/ce-theme@e8b8d7a8`; `bundle.css` sha256 `de102fad7d927541e3c31c2c30dd770fa0d0fca3b4000a84a9e5bfcb7353ed06`) and the workbench boards of 5 November 2026. Evidence tags **[A] [S] [R] [H]** are explained in CR-08. |

**Interpretation.** The hand-off lists a "store-context bar" without a definition. I took it to mean the one-line bar that appears inside pages that show store-dependent amounts, naming the store and offering to change it. The utility-bar button already exists in CE Theme (`ce-store-context`) and is not the subject. If the owner meant something else, this request needs rewriting (owner decision 1). Decision 1 (section 8) confirms this interpretation.

## 1. Summary

Prices and availability depend on the chosen store. CE Theme has the utility-bar button, a text note («Precio en Tacna»), a dialog with choice cards, and a "no store" price message. It has no recipe for the in-page line that says which store the amounts on this page belong to, lets the shopper change it, and shows that a change is being applied. The boards draw that line on at least 23 boards (24 counting the store drawer) in three different markups, four in-page lead phrases (plus one in the store drawer) and three gaps. The request: name it, reuse `ce-store-note`, give its action the `size.target.public` target (44px, X-1), and document its four states.

## 2. Problem and evidence

**Where the boards draw it** [S]: the change action «Cambiar tienda» appears in 45 of the 251 boards (files containing the exact string, recounted 5 November 2026; the earlier snapshot gave 41) across cart, checkout, favourites, campaign, store pages and states. The line with the store name beside it was counted by its markup `<span>{lead}<strong>Tienda A|B — demostración</strong></span>`:

| Lead phrase | Boards | Occurrences | Used on |
|---|---|---|---|
| «Importes en» | 9 | 28 | cart and checkout family (Pub10Bolsa, a frozen board whose name is an identifier, not copy: X-3; Pub10Estados, Pub10EstadosMovil, Pub10EstadosMovilP2, Pub10Excepciones…) |
| «Precios y disponibilidad de» | 10 | 19 | favourites family (Pub14Favoritos, Pub14FavoritosMovil, Pub14Estados…) |
| «Tienda:» | 5 | 19 | PDP and store states (Pub06Estados, Pub06Muestra, Pub08Tienda, Pub14Guardado, Pub14GuardadoMovil) |
| «Tu tienda:» | 1 | 5 | Pub08Cambio |
| «Tienda actual:» | 2 | 4 | the store drawer (Pub08Tienda, Pub08TiendaMovil) |

The counts are lower bounds: only that exact markup was matched.

**Three markups and three gaps** [S]:

| Wrapper | Local CSS | Boards (rule counts) |
|---|---|---|
| `p.note` / `p.note.store-line` | `font-size:14px; display:flex; flex-wrap:wrap; align-items:center; gap:0 8px`, with a `<span aria-hidden="true">·</span>` between store and link | 28 `p.note` occurrences (inline style in Pub10); `.store-line` rule in 13 boards |
| `p.ce-store-note` | recipe as is: `gap: 4px 8px`, 14px (`--ce-font-size-sm`) | 21 occurrences (favourites family) |
| `div.bd-store-row` | `gap: 4px 12px; margin-top: 16px; font-size: 14px` | rule in 17 boards; 20 occurrences |

**The link target** [H][S]: the recipe's `.ce-link` has no minimum height; measured in the scratch harness, the «Cambiar tienda» link inside `ce-store-note` is 16.8px high. The boards raise it with local rules (`.lnk44 { display:inline-flex; align-items:center; min-height:44px }` in 57 boards, `a.ce-link` 44px rules in many others).

**States drawn** [S] (Pub08Tienda 1440 and 390, Pub08Cambio, Pub10Estados, Pub14*):
- No store: «Tienda: sin elegir» + «Elegir tienda»; amounts replaced by the price message «Elige tu tienda para ver precio y disponibilidad».
- Selected: «Tienda: Tienda A — demostración» + «Cambiar tienda».
- Pending after a committed change: «Tienda: Tienda B — demostración» + the pill «Actualizando» (`ce-pill ce-pill--info`) instead of the link; old amounts removed; lines kept (frozen board copy «Bolsa: MENE ×2 y NOME ×1 siguen en la bolsa; sus montos esperan la respuesta de Tienda B — demostración.», rewritten with «carrito» in a later task: X-3, X-6). In the cart the line is `aria-busy="true"` («Importes en Tienda B — demostración · Cambiar tienda», Pub10Estados).
- Directory failure (in the drawer, not the bar): the current store keeps working; «Reintentar».

**Invariants these states express** (CANON, SHARED-02 D04): no store means no amount and no stock assertion; a committed store change removes the old store's amounts immediately; a late response for an old store cannot overwrite the active one (behaviour of the application, not of the recipe); no addresses, hours or service promises are invented (the drawer says «Dirección y horario: no suministrados en esta demostración.»).

## 3. Current state in CE Theme

**Partly exists.** Checked: `bundle.css` lines 418-424 (`ce-store-context` 44px min-height button with `aria-busy` spinner; `ce-store-note` flex row, `gap: var(--ce-space-4) var(--ce-space-8)`, `strong` in primary colour), line 425 (`ce-price-pending`); `components/StoreContext/README.md` ("`ce-store-note`: «Precio en Tacna», «Precio no disponible en Arequipa.»"; "Do switch every price, offer and availability line together when the store changes"; "Do keep the store change cancellable; Escape keeps the current store"); `components/Cart/preview.html` (a `ce-store-note`, «Comprando en Tacna. Importes de ejemplo.», with no change action); `components/StoreContext/preview.html` (dialog with choice cards, utility-bar button with `aria-busy`, price states); `names.md` (`StoreNote`, `StoreContext`). `coverage.md`: "Black utility bar with store and delivery context | `ce-utility-bar`, `ce-store-context` | Tested".

Missing: the in-page line with a change action, its 44px target, the pending word, and the wording.

## 4. Proposed change

**Option A, decided (X-8): no new class.** The bar is `ce-store-note` with an action. Standard name: `StoreBar` («Barra de tienda»), accepted (X-8), registered in `names.md` and `recipes/names.mjs` as `ce-store-note` + `ce-link`.

```html
<p class="ce-store-note" [aria-busy="true" role="status"]>   <!-- both only while pending; role="status" is the recipe-level rule, X-7 -->
  <span>Importes en <strong>Tienda A — demostración</strong></span>
  <button type="button" class="ce-link">Cambiar tienda</button>      <!-- or a link to the store route -->
  <!-- pending: replace the action by --> <span class="ce-pill ce-pill--info">Actualizando</span>
</p>
```

```css
.ce-store-note .ce-link { display: inline-flex; align-items: center; min-height: var(--ce-size-target-public); }   /* 44px: size.target.public, X-1 */
.ce-store-note[aria-busy="true"] { cursor: progress; }
```

Gap stays the recipe's `4px 8px` (existing tokens). The boards' `gap: 0 8px` and `gap: 4px 12px` and the visual `·` separator would be retired.

Not taken (X-8 accepts `StoreBar` as a name for this composition): a new class `ce-store-bar` with the same declarations plus its own spacing, which would duplicate `ce-store-note`.

Wording in the documentation (Spanish UI strings; the store label is supplied):

| Job | Lead | Action |
|---|---|---|
| Money-bearing surfaces (cart, checkout, order) | «Importes en {tienda}» | «Cambiar tienda» |
| Browsing surfaces (listing, PDP, favourites, campaign) | «Precios y disponibilidad de {tienda}» | «Cambiar tienda» |
| No store | «Tienda: sin elegir» | «Elegir tienda» |
| Pending | the lead with the new store | the word «Actualizando» (no link) |

Decision 2 (section 8) keeps the two leads and uses «Tienda:» only for the empty state. Documentation in the same change: StoreContext README (the bar, its states, the invariants above), a card or preview state for each, the `names.md` entry, a `coverage.md` row.

## 5. Accessibility and invariants it must keep

| Invariant | Applies? |
|---|---|
| No store means no amount | Yes: the no-store state always sits with the price message, never with a price |
| Unknown availability is never sold out | The bar says nothing about stock |
| NAME / Description / specs / price spacing, one-line CE code | Not applicable |
| Supplied decimal-string prices | Not applicable; the bar carries no amount |
| Focus ring | 2px outline, 3px offset on the action (global rule) |
| 44px public targets | Yes: the action reaches `--ce-size-target-public` (44px) height; the bar itself is not a control |
| Status never by colour alone | «Actualizando» is a word; `aria-busy="true"` is set on the bar as the boards do, and the pending bar also carries `role="status"` (X-7, decided 2026-11-06; announcement not run) |
| Store change cancellable | Behaviour of the dialog or drawer (Escape keeps the current store, per the README), not of the bar |

## 6. Acceptance checks

To run when the repository work happens (not run here, except where marked):
1. The link is at least 44px high at 390, 768, 1440 and text x1.5, x2 (currently 16.8px without the rule [H]).
2. The four states render without overflow; a long store label wraps; the pill does not overlap the label.
3. With `aria-busy="true"` the amounts on the page are absent or marked pending (page-level, in the consumer).
4. Keyboard: the action is reachable, shows the focus ring and opens the same dialog as the utility-bar button.
5. Screen reader announcement of the pending state: **not run, to schedule**.

In the implementation, checks 1, 2 and 4 are browser tests in `tests/browser/store-bar.spec.mjs`. They render the StoreContext card's states with the supplied Inter files and the generated tokens and recipes only, and the five storefront pages that depend on the store (home, listing, product, scene and cart), with and without a store. They also check that the text really grows: at x1.5 and x2 the bar, its action and the pill have 1.5 and 2 times their computed font size. Before the rule, the action measured 16.8px at 100% text, 25.2px at x1.5 and 33.6px at x2, at all three widths (measured without the Inter files loaded). Check 3 is the page's rule in the StoreContext guideline. The examples keep it: the storefront cart shows each store's supplied amounts only with that store's bar, no storefront page shows an amount without a store, and the pending state is shown in the card without amounts. Check 5 is still not run.

## 7. Risks and what it does not change

- `ce-store-note` is also used inside pin cards and product cards for «Precio no disponible en {tienda}»; the new rule only touches a `.ce-link` inside it, so those uses are unaffected. One existing note with an inline link, «Consulta Ayuda» on the storefront product page, also gets the 44px target, so its row is taller. Pin-card spacing is CR-09.
- Pages that today show both the utility-bar button and the in-page line repeat the store name by design. Decision 4 (section 8) shows the in-page line on every store-dependent page.
- The boards keep their three local markups as part of the frozen snapshot (X-3); new boards use the bar.
- Not changed: `ce-store-context`, the dialog and drawer, choice cards, the price-pending recipe.

## 8. Owner decisions needed

1. Decided (lead's CR-05 selection, 2026-11-13; decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed): "store-context bar" means this in-page line, distinct from the store drawer.
2. Decided (lead's CR-05 selection, 2026-11-13; decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed): two leads, «Importes en {tienda}» on money-bearing surfaces and «Precios y disponibilidad de {tienda}» when browsing; «Tienda:» only in the empty state («Tienda: sin elegir»); «Tu tienda:» is retired from the in-page line (the utility-bar button keeps it); the drawer, with «Tienda actual:», stays outside this request.
3. Decided (X-7, 2026-11-06): the pending bar carries `role="status"`, as a recipe-level rule.
4. Decided (lead's CR-05 selection, 2026-11-13; decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed): on every store-dependent page, including browsing pages that show only availability, not only where amounts are shown.
5. Decided (X-8, 2026-11-06): option A. `StoreBar` is accepted as the name of the composition `ce-store-note` + `ce-link`, with no new class.
