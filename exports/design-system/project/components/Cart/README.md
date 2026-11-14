# Cart

The cart and checkout: product lines with supplied quantities, line amounts and availability. The consumer supplies every value and state; this recipe performs no operation or arithmetic. Steps, fulfilment choices, order summary and compact summary lines keep their existing contracts.

## Classes and anatomy

`ce-cart-lines` contains `li.ce-cart-line`: a decorative image (`alt=""` when the adjacent product link names it), then `ce-cart-line-body`. Its direct children, in order:

1. Optional `span.ce-code`, never wrapping. Its container gives it room; the body can move below the image when its intrinsic content needs the full width. No code wrapping exception.
2. A contextual heading (`ce-product-heading`) containing `a.ce-product-link`, with NAME and optional Description. Render optional fields only when nonblank.
3. Optional `p.ce-product-specs`.
4. `ce-price-block` with the supplied **line amount**, or `ce-store-note` / `ce-price-pending` explaining its absence. Identify the amount as «Importe de la línea» for assistive technology. A basis such as «cada uno» appears only if supplied. Missing never means zero.
5. Optional `ul.ce-stock[aria-label="Disponibilidad"]`, with the actual [StockLine wording contract](https://github.com/j3w1/ce-theme/blob/main/docs/names.md#stockline) delivered by CR-06. No store means no availability list. Unknown reads «Disponibilidad por confirmar en {tienda}»; pending reads «Consultando disponibilidad…» with `aria-busy="true"` on the list. Missing price never infers unavailable. Confirmed `limited` / `unavailable` examples are labelled «Escenario».
6. `ce-cart-line-actions`: quantity group, then `button.ce-link` for remove. Price is above this row.
7. Optional `ce-save-state` or `ce-notice` describing pending or failed updates in words.

Distances: code→heading 8px; NAME→Description 2px; heading→specs 2px; specs (or heading when absent)→amount-or-note 12px; amount-or-note→availability 8px; availability (or amount-or-note when absent)→controls 12px; controls→save-state/notice 8px. These use existing ProductStack/space tokens, without a uniform grid gap. The image remains 88px below 640px and 128px from 640px, line padding 24px top and bottom, price type 28px.

## Controls and accessibility

The product link keeps its content height for exact ProductStack distances. A centred pseudo-element gives it a minimum 44px hit area; it must never reach a quantity/remove control. Browser acceptance measures the visible identity boxes and hit-tests the expanded area. Quantity buttons, input and remove have at least the public 44px target. Keep native buttons, a labelled input and `role="group" aria-label="Cantidad de MENE"`. Remove's name is «Quitar MENE del carrito», with product identity in `ce-sr-only` if only «Quitar» is visible. The order is product link, minus, input, plus, remove in both DOM and keyboard traversal; disabled controls are skipped normally. Focus rings use the existing 2px stroke and 3px offset, including the input.

Explain disabled controls with visible supplied text and `aria-describedby`. Show the last acknowledged quantity and amount during a pending change, with `aria-busy="true"` on the quantity group; do not announce every availability render. Live announcements and Enter/Escape behaviour belong to the application. No nested interactive elements.

## Supplied-state examples

The preview is illustrative static HTML, not a controller. Each simulated frame has its own DemoCue.

| State | Presentation contract |
| --- | --- |
| Ordinary | Identity, supplied line amount and availability, then controls. |
| Empty cart | Empty message instead of an empty line; no invented zero total. |
| Quantity pending | Last acknowledged quantity/amount stay; «Actualizando cantidad a 2… Mientras tanto se muestra 1.» |
| Quantity acknowledged | The supplied response replaces lines and summary together; «Cantidad de MENE actualizada a 2.» |
| Quantity failed | Return to last acknowledged values; «No se pudo cambiar la cantidad de MENE. Tu carrito sigue igual: 1 unidad.» and a supplied retry action. |
| Unavailable supplied state | Labelled scenario, «Sin importe: producto no disponible» plus confirmed «Agotado en {tienda}»; supplied controls/eligibility. |
| Committed store switch | Keep lines, remove old amounts and totals; render only the new store's supplied response. |
| Blocked quote / unknown availability | Missing-price explanation, «Disponibilidad por confirmar en {tienda}», no total or enabled continuation inferred by the recipe. |
| Expired quote | Explain expiry and show only amounts/actions the response permits. |
| Offline | Say offline and identify any last confirmed values; no fresh availability claim. |
| Removal with short undo | Supplied removal announcement and «Deshacer»; application supplies its short undo period and restores a supplied response. |

The consumer owns numeric-string identifiers, decimal-string amounts, quantity limits, availability, eligibility, state transitions, undo timing and all totals. Say which store the amounts are in: a StoreBar above the lines, «Importes en {tienda}» with «Cambiar tienda» (see StoreContext). Never compute totals, taxes or discounts. Never multiply quantity by a unit price or sum lines; never invent discounts, stock thresholds, reservations or default availability.

## Other classes

`ce-cart` places lines and summary side by side from 1024px. `ce-steps` uses `aria-current="step"` and `data-state="done"`; on phones only the current label shows. `ce-choice-cards` describes supplied fulfilment options and explains disabled choices. `ce-order-summary`, `ce-summary` and `ce-summary-total` display supplied amounts. Do not hide fees until the last step.

## Verification

`tests/browser/cart-line.spec.mjs` exercises the recipe and current preview at 390/768/1440px and computed text factors 1/1.5/2, including px/rem descendants and shipped Inter. It checks optional fields, state wording, ProductStack distances, overflow/overlap, targets, focus, native keyboard order, click isolation and axe. Screen-reader pass on pending/failed lines: **not run, to schedule**. Real device and print checks are not claimed. Frozen boards and their local patches remain unchanged (X-3).
