Status: Ready for owner review; not submitted anywhere

# CR-04 · Cart line (`ce-cart-line`): identity, supplied amount, availability, controls

| | |
|---|---|
| Kind | Shared-pattern candidate: refinement of an existing recipe (anatomy and documented states) |
| CE Theme target | `ce-cart-lines` / `ce-cart-line` / `ce-cart-line-body` / `ce-cart-line-actions` (Cart recipe, `bundle.css` lines 655-660, 749-750); `components/Cart/README.md` and `preview.html` |
| Depends on | CR-08 (spacing) and, for the availability row, CR-06. Best submitted with CR-08 |
| Checked against | CE Theme — Design System artifact version 1793881448-c98f (design-system.json: re-synced to `j3w1/ce-theme@e8b8d7a8`; `bundle.css` sha256 `de102fad7d927541e3c31c2c30dd770fa0d0fca3b4000a84a9e5bfcb7353ed06`) and the workbench boards of 5 November 2026. Evidence tags **[A] [S] [R] [H]** are explained in CR-08. |

## 1. Summary

Every cart, checkout and order surface in the CE Systems boards draws the same cart line: image, CE code, product identity as a link, specifications, the supplied line amount, an availability line, then quantity and remove. CE Theme already has a cart line, but a simpler one: no code, no availability line, the amount sits in the actions row, and its spacing breaks the ProductStack (CR-08). The request: update the anatomy of `ce-cart-line` to the one the boards use, document its states, and keep the recipe free of arithmetic.

## 2. Problem and evidence

**The anatomy in the boards** [S][R]. Pub10Bolsa (1440; a frozen board whose name and copy predate X-6 and X-8; its string «de la bolsa» below is frozen board copy), first line:

```
li.ce-cart-line
  img                                  128 x 128 (rendered), alt "MENE, Taza de Vidrio Resistente al Calor"
  div.ce-cart-line-body
    div > span.ce-code                 CE2606 1441, one line
    h3.ce-product-heading > a.ce-product-link   NAME, then Description (2px)
    p.ce-product-specs                 vidrio borosilicato, 250ml
    div.ce-cart-line-actions
      div.pl > span.ce-price           supplied line amount, S/ 6.5, basis «cada uno» outside the figures
      ul.ce-stock[aria-label="Disponibilidad"] > li[data-state="available"]   Disponible en Tienda A — demostración
      div.ql                           div.ce-quantity[role=group][aria-label="Cantidad de MENE"] + button «Quitar» (sr-only " MENE de la bolsa", frozen board copy; the proposal in section 4 reads " MENE del carrito")
```

Boards that draw it (23 files with `ce-cart-line-body` markup, 96 lines): Proto01Compra, Pub08Cambio, Pub10Bolsa, Pub10BolsaMovil, Pub10Estados, Pub10EstadosMovil, Pub10EstadosMovilP2, Pub10Excepciones, Pub10Fotos, Pub10FotosMovil, Pub10FotosTableta, Pub10Tableta, Pub11Fallos, Pub12Resultado, Pub12ResultadoMovil, Pub12Tableta, Pub15Fotos, Pub15FotosMovil, Pub15FotosTableta, Pub15Seguimiento, Pub15SeguimientoMovil, Pub15TabletaSeguimiento, Pub20Largos. The Pub11 checkout boards draw a compact "mini" line instead.

**States drawn** [S]: default; empty cart; pending quantity update (`aria-busy="true"` on the quantity group, «Actualizando cantidad a 2… Mientras tanto se muestra 1.»); acknowledged update (lines and summary replaced together by the supplied response; «Cantidad de MENE actualizada a 2.»); failed update (notice «No se pudo cambiar la cantidad de MENE», «Tu bolsa sigue igual: 1 unidad.» (frozen board copy, rewritten with «carrito» in a later task: X-3, X-6), button «Reintentar»; the line returns to the last acknowledged values); unavailable item («Sin importe: producto no disponible», availability «No disponible en Tienda A — demostración»); store switch committed (amounts removed, lines kept); Q-BLOCKED in Tienda B (price «Precio no disponible en Tienda B — demostración», availability «Disponibilidad por confirmar…», no total); expired quote; offline; removal with short undo («Deshacer»). Frames: Pub10Estados A-F, Pub10Excepciones (six frames), Pub11Fallos.

**Where the boards differ from each other** [S][R]:
- Price position: inside the actions row (Pub10 family, `.ce-cart-line-actions{display:grid;gap:12px;margin-top:4px}`) or as `ce-price-block` outside it (Pub08Cambio, Proto01Compra). Price to availability is 12px in Pub10Bolsa [R] and 8px in Pub08Cambio / Proto01Compra by their CSS. See CR-08.
- Code wrapper: an unclassed `div` around `ce-code` (Pub10Bolsa, Pub10Estados) or `.ce-cart-line-body > .ce-code { justify-self: start }` (12 boards carry that rule). `ce-code` is `inline-block` and would stretch in a grid.
- Remove: `button.ce-button.ce-button--secondary` with 44px min-height in Pub10Bolsa; CE Theme's Cart README says `button.ce-link`. Other boards were not compared.
- Product link target: `.ce-cart-line .ce-product-link { position: relative }` is present in 38 boards, and Pub10Bolsa adds `.ce-product-link::after { content:""; position:absolute; inset:-3px 0 }`, to bring the two-line link to 44px or more. Whether all 38 also carry the `::after` rule was not checked.
- Quantity input: `.ce-quantity input { min-height: 44px; width: 4ch }` in 36 boards (the recipe sizes the +/- buttons at 44px but not the input).
- Code wrapping: a `.ce-cart-line .ce-code` rule with `overflow-wrap` is in 35 boards, 32 of them in the combined form `.ce-cart-line .ce-code, .mini .ce-code { max-width:100%; white-space:normal; overflow-wrap:anywhere }` (stress strings in Pub20Largos). CE Theme says a code never wraps (`decisions.md` 2026-10-25 "Codes"). See owner decision 4.
- Line padding: `.frame .ce-cart-line { padding-block: 16px }` in 21 boards (recipe: 24px).

Counting method for the four rule counts above (recount of 5 November 2026 over the 251 boards): files whose own `<style>` contains the selector followed by the named declaration (regular expression over selector and declaration block); a file counts whether or not it draws a cart line, so these are files carrying CSS, separate from the 23 files with cart-line markup. The earlier snapshot gave 31 / 34 / 28 / 20.

**Amounts are supplied.** The page shows «Importe de la línea» exactly as the quote supplies it (for example MENE x2 is «13.00» in quote Q-A2; no multiplication, no sum on the page; the basis «cada uno» appears only when the response supplies it).

## 3. Current state in CE Theme

**Partly exists.** Checked: `bundle.css` lines 655-660 and 749-750; `components/Cart/README.md` (classes: `ce-cart-lines` > `ce-cart-line`, `ce-cart-line-body` with "the product heading, specs and `ce-cart-line-actions` (quantity, line amount, remove as `button.ce-link`)"; the consumer supplies "every amount as decimal strings from the commerce service"; "Don't compute totals"); `components/Cart/preview.html` (image with empty `alt`, no code, no availability line, price and remove in the same row as the quantity, a `ce-store-note` above the list). `coverage.md` [A]: the row for `ce-cart`, `ce-cart-line`, `ce-order-summary` and `ce-summary` has the status "Implemented". Not a Vue export (`Shared01Inventory`: "Cart is not exported").

## 4. Proposed change

Recipe: `ce-cart-line` (existing name). New anatomy (one skeleton, all parts optional except identity and amount-or-note):

```html
<li class="ce-cart-line">
  <img src="…" alt="" width="128" height="128">            <!-- alt: see owner decision 5 -->
  <div class="ce-cart-line-body">
    <span class="ce-code">CE2606<span class="ce-code-number">1441</span></span>
    <h3 class="ce-product-heading"><a class="ce-product-link" href="…">
      <span class="ce-product-name">MENE</span>
      <span class="ce-product-description">Taza de Vidrio Resistente al Calor</span></a></h3>
    <p class="ce-product-specs">vidrio borosilicato, 250ml</p>
    <div class="ce-price-block"><span class="ce-price">…supplied amount and optional basis…</span></div>
         <!-- or: <p class="ce-store-note">Precio no disponible en Tienda B — demostración</p> -->
    <ul class="ce-stock" aria-label="Disponibilidad"><li data-state="available">Disponible en Tienda A — demostración</li></ul>
    <div class="ce-cart-line-actions">
      <div class="ce-quantity" role="group" aria-label="Cantidad de MENE" [aria-busy="true"]>…</div>
      <button type="button" class="ce-button ce-button--secondary">Quitar<span class="ce-sr-only"> MENE del carrito</span></button>
    </div>
    <p class="ce-save-state" role="status" data-state="dirty">Actualizando cantidad a 2… Mientras tanto se muestra 1.</p>  <!-- optional -->
  </div>
</li>
```

CSS declarations (existing tokens only):

```css
/* spacing: CR-08 */
.ce-cart-line-body > .ce-code { justify-self: start; }
.ce-cart-line-actions { display: flex; flex-wrap: wrap; align-items: center; gap: var(--ce-space-12); }   /* no space-between: the price is no longer in this row */
.ce-cart-line-actions .ce-quantity input { min-height: var(--ce-size-target-public); width: 4ch; }   /* 44px: size.target.public, X-1; 4ch: content-relative width, no token (see below) */
.ce-cart-line .ce-product-link { position: relative; }
.ce-cart-line .ce-product-link::after { content: ""; position: absolute; inset: -3px 0; }   /* raw 3px: brings the link to 44px or more; to measure per font size */
.ce-cart-line-body [aria-busy="true"] { cursor: progress; }
```

- The 3px inset is the one raw design size; it is what the boards already use (the link rule in Pub10Bolsa and, for its `position`, 38 boards). The 44px input height is the `--ce-size-target-public` token (X-1, decided 2026-11-06); the boards' input rule in 36 boards writes it raw. A second literal, `width: 4ch`, is a content-relative width (room for four digits) with no token in the system; it is intentional and flagged here rather than hidden. Structural zeros (`inset: … 0`, `margin: 0`) are not counted as design values. The inset is "to measure": 44px is reached only because NAME (15px line, 1.2) + 2px + Description (16px line, 1.2) is about 39px plus 6px; a one-line Description or a smaller `--ce-product-text` needs a re-check.
- No JavaScript and no Vue component is proposed. Whether a `CECartLine` ever exists is a later step in the repository workflow, after the recipe is approved.
- The line amount, quantity limits, availability, eligibility and totals are supplied by the commerce service; the recipe adds no arithmetic and no default.
- Copy (X-6, decided 2026-11-06): the remove control's hidden label reads " MENE del carrito" («Quitar … del carrito»), not the boards' "de la bolsa".
- Documentation: Cart README rewritten for the anatomy above; the Cart preview redrawn with code, availability, and the pending / failed / blocked variants; a `coverage.md` row updated (status stays "Implemented" until tests exist). The «bag» wording of that row's title and of the Cart README becomes cart wording (X-8).

## 5. Accessibility and invariants it must keep

| Invariant | How |
|---|---|
| NAME above Description, 2px / 2px / 12px | Heading identity 2px, specs 2px, price 12px below the specs (CR-08) |
| One-line CE code | `ce-code` stays `nowrap`; no `overflow-wrap` override in the recipe (owner decision 4) |
| Supplied decimal-string prices | Line amount is the supplied string; screen-reader text names it («Importe de la línea: 6.5 soles cada uno»); no S/0 for a missing amount: `ce-store-note` or `ce-price-pending` takes its place |
| Unknown availability is never sold out | The availability row uses the CR-06 states; unknown reads «Disponibilidad por confirmar en {tienda} — demostración» |
| Focus ring | 2px outline, 3px offset on the link, quantity buttons and remove (existing global rule) |
| 44px public targets | Quantity buttons 44px (recipe), input `--ce-size-target-public` (44px), remove 44px (same token), product link 44px or more by the `::after` area |
| Status never by colour alone | Pending and failure are words («Actualizando…», «No se pudo cambiar…») plus the notice or save-state |
| Disabled control explains why | The disabled «Reducir cantidad» at quantity 1 is explained by a note under the list (Pub10Bolsa `aria-describedby="nota-min"`) |
| Last acknowledged value stays while pending | The control keeps the last acknowledged quantity and amount until the response arrives; this is presentation of state the application supplies |

## 6. Acceptance checks

To run when the repository work happens (none run here beyond the measurements quoted above):
1. Distances (CR-08 acceptance).
2. Line variants: with and without code; price present, price missing (store note), pending price; availability available, unknown, unavailable (scenario); quantity pending and failed; long NAME and Description (Pub20Largos strings).
3. 390, 768, 1440 and text x1.5, x2: no horizontal overflow; image 88px below 640px and 128px from 640px as the recipe does today.
4. Keyboard: tab order link, quantity -, input, +, remove; focus ring visible on each; `Escape` and Enter behaviour of the quantity group is the application's.
5. Screen reader pass on the pending and failed lines: **not run, to schedule** (the workbench records no screen-reader testing).

## 7. Risks and what it does not change

- Consumers that keep price, quantity and remove in one row (the current Cart preview) change layout: the amount moves above the controls.
- Raising the remove control from `ce-link` to `ce-button--secondary` is visible; owner decision 3.
- The boards keep their local copies and patches as part of the frozen snapshot (X-3); there is no re-synchronisation pass, and new boards are built on the new recipe.
- Not changed: order summary, steps, choice cards, the compact "mini" line used in summaries (56px image, 12px gap, in Pub10/Pub11 boards; not proposed here).

## 8. Owner decisions needed

1. Approve the anatomy (price block above availability, actions last).
2. Confirm availability to controls at 12px (CR-08 decision 1).
3. Remove control: `ce-button--secondary` (as Pub10Bolsa) or `ce-link` (as the Cart README)?
4. Codes in cart lines: keep "never wraps" and give the container room, or allow an `overflow-wrap` exception for stress strings? The boards' 35 overrides contradict the 2026-10-25 decision.
5. Image `alt`: empty (decorative, the link names the product; as CE Theme's preview) or «NAME, Description» (as the boards)? Recommended: empty when the link beside it carries the same name.
