Status: Ready for owner review; not submitted anywhere

# CR-06 · Availability line (`ce-stock` / StockLine): states, wording and the unknown state

| | |
|---|---|
| Kind | Shared-pattern candidate: completion of an existing recipe (states, wording contract, accessible name) |
| CE Theme target | `ce-stock` (standard name `StockLine`, "Disponibilidad"), `bundle.css` lines 576-581 and 105; `components/ProductCard/README.md`, `components/StoreContext/README.md`, `components/StandardNamesStore/README.md`; `names.md` |
| Depends on | Nothing. CR-04 and CR-08 reuse it |
| Checked against | CE Theme — Design System artifact version 1793881448-c98f (design-system.json: re-synced to `j3w1/ce-theme@e8b8d7a8`; `bundle.css` sha256 `de102fad7d927541e3c31c2c30dd770fa0d0fca3b4000a84a9e5bfcb7353ed06`) and the workbench boards of 5 November 2026. Evidence tags **[A] [S] [R] [H]** are explained in CR-08. |

## 1. Summary

CE Theme already has an availability line, `ce-stock`: a list whose item carries a coloured dot and words. Its documentation names four states (`available`, `limited`, `unavailable`, `unknown`) but the CSS styles only three of them, no document gives the wording for "we do not know", and the sample cards pair a missing price with a stock claim. The boards use the line 656 times with a fixed wording set built on one rule: unknown availability is never "sold out". The request: add the explicit `unknown` (and `pending`) state, publish the wording contract, and require an accessible name (X-7).

## 2. Problem and evidence

**Rules the boards follow** (CANON R-03, R-17; SHARED-02 D04 and D06 [S]): baseline in every listing, card, PDP, cart, campaign, favourites and staff frame is, per product and store, either «Disponible en {tienda}» or «Disponibilidad por confirmar en {tienda}». Unknown, stale, conflicting and no-response readings are all the second wording publicly. «Agotado» and «Pocas unidades» appear only in frames labelled «Escenario». No store means no amount and no stock assertion. Staff counts are never shown for unknown or stale cells.

**Use in the boards** [S]: 656 lists with the exact class attribute `class="ce-stock"` in 108 board files. Item wording, recounted on 5 November 2026 over the 251 boards with this method: every `li` inside one of those 656 lists, its text content read without tags, one count per statement (a list holds one or more statements, so statements outnumber lists; script template strings are outside any list and are not counted): «Disponibilidad por confirmar en Tienda A — demostración» **436**, «Disponibilidad por confirmar en Tienda B — demostración» **37**, «Disponible en Tienda A — demostración» **170**; «Agotado en …» 3, «Pocas unidades en …» 2, «No disponible en …» 1, «Sin stock suficiente en …» 2 (all scenario frames: Adm08Disponibilidad, Pub06Estados, Pub10Excepciones, Pub11Estados, Pub11EstadosMovil); «Consultando disponibilidad…» 2 (Pub06Estados, Pub08Tienda). `data-state` on those items: `available` 174, `unavailable` 7, `limited` 2, `unknown` 1, no attribute 477, two template placeholders (`{{ … }}` in Proto01Compra and Pub06Producto). (The earlier snapshot gave 336 / 36 / 162; it predates the last 16 boards and counted fewer statements per list.)

**The unknown state has no CSS and is rarely marked** [A][S]: `bundle.css` lines 576-581 define the list, a default neutral dot (`--ce-color-border-control`), and `[data-state="available"]`, `"limited"` and `"unavailable"`. There is no rule for `unknown`. The ProductCard README names `data-state="available|limited|unavailable|unknown"`; the StoreContext README only says "`ce-stock`: availability per store in words" and names no values (both read in the repository's `design-system/components/` source, from which the artifact cards are generated; the artifact copies of these two READMEs are not in the saved evidence). In the boards the unknown wording almost never carries `data-state="unknown"` (one occurrence, Adm02Editor); it relies on the default dot. The look is right, but the documented value is not testable.

**Accessible name** [S]: 93 of the 656 lists have `aria-label="Disponibilidad"` (31 boards); 563 have none.

**Spacing per context** [A][S]: the margin above the line exists only inside `.ce-product-info` (`margin-top: var(--ce-size-product-gap-note)`, 8px, line 105). Elsewhere the consumer adds it: cart line `margin-top: 8px` (Pub08Cambio, Proto01Compra; CR-08 makes it part of the recipe), tag items in 7 tablet boards `.ce-tag-item .ce-stock{margin-top:12px}` (the recipe's `.ce-tag-item-info` already has an 8px flex gap, so the resulting distance is **to measure**), staff maps `.map .ce-stock { margin: 0 }` (Adm08Disponibilidad, Adm08Tableta).

**Reuse of the list as a status list** [S]: Pub08Tienda (frame "Service status after apply") uses `ul.ce-stock[role=status]` with three rows: «Tiendas: lista cargada» (`data-state="available"`), «Precio: consultando…», and «Disponibilidad: no pudimos consultarla. Reintentar» with `data-state="unavailable"`, which draws the hollow red ring that means "confirmed sold out". The words say the read failed; the dot says sold out. That conflicts with R-03 and is a board-side issue; it also shows pressure for a generic status list, which this request does **not** add.

**Samples in CE Theme** [A]: `components/ProductCard/preview.html` draws a card with «Precio no disponible en Arequipa.» and «Pocas unidades en Arequipa» (`limited`); `components/StoreContext/preview.html` draws «Precio no disponible en Arequipa.» with «Agotado en Arequipa» (`unavailable`). No sample shows an unknown availability. In the **demonstration fixtures** (CANON R-03) the baseline for a store that supplies no price (NOME, TILEN, TALEN in Tienda B) is the unknown wording, because Tienda B's inventory source has had no response in the fixture. That is a fixture fact, not a production rule: the StoreContext contract supplies price and availability separately, so a confirmed reading (`limited`, `unavailable`) next to a missing price is a valid state whenever the inventory service supplied it.

**A second availability recipe** [A][S]: `.ce-availability` (`bundle.css` line 137: 12px, semibold, secondary colour, no dot) was added by "P3" in `evolution.md` ("Implemented, pending review") for campaign callouts. It is not in `names.md` or `coverage.md`. One board references it (Adm02Permisos, once). This request targets `ce-stock` only.

## 3. Current state in CE Theme

**Exists, incomplete.** `ce-stock` is "Implemented" in `coverage.md` ("Status pills and availability | `ce-pill`, `ce-status`, `ce-stock` | Implemented | Always text plus colour"). `names.md`: `StockLine` = `ce-stock`, "Per-store availability in words, with a state dot". Missing: CSS for `unknown` and `pending`; the wording contract; a rule about the accessible name; the unknown example in the samples.

## 4. Proposed change

Recipe: `ce-stock` (existing; `StockLine`). One list, one item per statement.

```html
<ul class="ce-stock" aria-label="Disponibilidad" [aria-busy="true"]>
  <li data-state="available|limited|unavailable|unknown|pending">…words…</li>
</ul>
```

| State | `data-state` | Spanish wording (`{tienda}` is the supplied store label) | Dot |
|---|---|---|---|
| Known available | `available` | «Disponible en {tienda}» | success |
| Few units (a confirmed reading supplied by the service; X-9) | `limited` | «Pocas unidades en {tienda}» | warning |
| Confirmed sold out (a confirmed reading supplied by the service; X-9) | `unavailable` | «Agotado en {tienda}» | hollow danger ring |
| Unknown, stale, conflicting, no response | `unknown` (also the default when no state is set) | «Disponibilidad por confirmar en {tienda}» | neutral |
| Being read | `pending` with `aria-busy="true"` on the list | «Consultando disponibilidad…» | neutral |
| No store chosen | no availability line | the price message «Elige tu tienda para ver precio y disponibilidad» takes its place | none |

CSS: no change of look; make the documented values explicit.

```css
/* the existing default rule (neutral dot) stays and still covers an item with no data-state */
.ce-stock > [data-state="unknown"]::before,
.ce-stock > [data-state="pending"]::before { background: var(--ce-color-border-control); }
```

Spacing: the line sits `var(--ce-size-product-gap-note)` under a price or store note in every composition that has one (cart line per CR-08; tag item and PDP: to measure).

Documentation in the same change: the wording table above in the StockLine README; one sample of the unknown state in the ProductCard and StoreContext cards; the rule "`unavailable` is only for a confirmed sold-out reading; a failed or missing reading is `unknown`". The word "scenario" is the boards' label for frames; CE Theme phrases it as "only when the inventory service supplies a confirmed reading" and documents both states with their samples (X-9, decided 2026-11-06).

No arithmetic, no counts ("Pocas unidades" is a supplied state, never a threshold computed in the interface), no reservation, no eligibility inference.

## 5. Accessibility and invariants it must keep

| Invariant | Applies? |
|---|---|
| Unknown availability is never "sold out" | Yes: the core of this request |
| Status never by colour alone | Yes: every state has words; the dot is a second signal (`coverage.md`: "Always text plus colour") |
| NAME / Description / specs / price spacing | The line sits 8px under the price or note (`size.product.gap-note`); not otherwise changed |
| One-line CE code, supplied prices | Not touched |
| Focus ring, 44px targets | Not applicable: the line has no control. A «Reintentar» link inside a line is a separate control and needs its own 44px target |
| Accessible name | Required: `aria-label="Disponibilidad"` on the list (what 93 board lists do; X-7, decided 2026-11-06) |
| Live regions | No `role="status"` on the list by default. X-7 (decided 2026-11-06) sets the recipe-level live regions (a pending store bar, CR-05; the `role="note"` of the cue, CR-03) and does not list this one; a live announcement for it stays the application's choice (`SHARED-01`: "live announcements only for meaningful changes") |

## 6. Acceptance checks

To run when the repository work happens (not run here):
1. Render the five states at 390, 768, 1440 and text x1.5, x2: words wrap, the dot stays aligned with the first line, nothing overflows.
2. `unknown` and a list with no `data-state` render the same neutral dot; `unavailable` is the only ring.
3. A fixture-scoped test: for the demonstration fixtures NOME, TILEN and TALEN in Tienda B (CANON R-03), the sample reads «Disponibilidad por confirmar en …». Elsewhere, a sample that shows `unavailable` or `limited` must carry a supplied confirmed inventory reading in its fixture data; it is never rejected for lacking a price (X-9).
4. Forced-colours and greyscale view: states stay distinguishable by their words.
5. Screen reader reading of the list with and without `aria-label`: **not run, to schedule**.

## 7. Risks and what it does not change

- Almost no visual change; the risk is in the documents: the wording table becomes the reference for CE Meta and CE Radio as well.
- The two samples that currently pair a missing price with a stock claim stay as confirmed readings (X-9, decided 2026-11-06); the unknown sample of section 4 is added beside them.
- Not changed: the dot sizes (10px dot, 8px gap), colours, the `ce-availability` recipe, the product card layout, any status-list pattern.
- The board defect in Pub08Tienda (a failed read drawn with the sold-out ring) is not fixed here (no board edits).

## 8. Owner decisions needed

1. Approve the wording set, especially «Disponibilidad por confirmar en {tienda}», as the CE Theme default for "unknown".
2. Decided (X-9, 2026-11-06): «Pocas unidades» and «Agotado» stay documented in CE Theme as confirmed states (supplied readings) with their samples, not as scenario-only states; eligibility stays with the application or service.
3. Decided (X-7, 2026-11-06): `aria-label="Disponibilidad"` is required on the availability list, as a recipe-level rule.
4. Decided (X-9, 2026-11-06): the two samples (ProductCard 4th card, StoreContext "Sin precio en la tienda") stay as confirmed readings (valid: price and availability are supplied separately; the test in acceptance check 3 accepts them when the fixture names the reading). They are not replaced by the unknown wording.
5. Future of `ce-availability`: keep, merge into `ce-stock`, or retire (recorded here, not proposed).
