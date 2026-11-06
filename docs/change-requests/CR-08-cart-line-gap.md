Status: Ready for owner review; not submitted anywhere

# CR-08 · Cart-line spacing follows the ProductStack

| | |
|---|---|
| Kind | Recipe-spacing gap ("cart-line grid gap 8px", recorded but not changed) |
| CE Theme target | `ce-cart-line-body` and `ce-cart-line-actions` in the Cart recipe (rules at `bundle.css` lines 655-660) |
| Depends on | Best submitted together with CR-04 (it is written for the CR-04 anatomy) |
| Checked against | CE Theme — Design System artifact version 1793881448-c98f (design-system.json: re-synced to `j3w1/ce-theme@e8b8d7a8`; `components/bundle.css` sha256 `de102fad7d927541e3c31c2c30dd770fa0d0fca3b4000a84a9e5bfcb7353ed06`) and the workbench boards of 5 November 2026 |

Evidence tags used in every request: **[A]** read in the CE Theme artifact; **[S]** static scan of the board files (read-only scripts); **[R]** measured in a rendered board (Chromium, boards served read-only from the workbench; vertical distances between element boxes); **[H]** measured in a scratch harness outside the workbench that loads only the shared `tokens.css` and `bundle.css` (no overrides).

## 1. Summary

In CE Theme the cart-line body is a grid with one uniform `gap: var(--ce-space-8)`, and the actions row adds `margin-top: var(--ce-space-8)`. The result is 8px between the product heading and the specifications and 16px between the specifications and the price row. The approved ProductStack is 2px and 12px. Every board that draws a cart line patches this locally. The request: replace the uniform gap with explicit ProductStack margins, using the existing `--ce-size-product-gap-*` tokens.

## 2. Problem and evidence

**Approved rule.** `names.md` [A]: the ProductStack "is the one vertical order and spacing for a product on cards, lists, details and tools" (CECode to NAME 8px, NAME/Description/specs 2px, specs to price 12px, price to StockLine or StoreNote 8px). `decisions.md` [A], 2026-10-25 "Product stack spacing". CANON R-21 (boards): NAME on its own line above Description, 2px gap, specs 2px, price 12px below specs.

**Recipe defaults, no overrides** [H]. A cart line with code, linked heading, specs, price in the actions row and an availability list:

| Between | Measured | ProductStack |
|---|---|---|
| code and heading | 8px | 8px |
| NAME and Description | 2px | 2px |
| heading and specs | **8px** | 2px |
| specs and the actions row (price at its start) | **16px** (8px grid gap + 8px row `margin-top`) | 12px |
| actions row and availability | 8px | 8px |

The same harness measured a product card (the reference): 8 / 2 / 2 / 12 / 8.

**What the boards do** [S]:
- A patch block marked `/* ce-identity */` is present in 77 board files: `.ce-cart-line-body .ce-product-specs{margin-top:-6px}` (8px - 6px = 2px). Cart-line markup (`class="ce-cart-line-body"`) exists in 23 boards (96 lines); every one is covered by the patch, and the other 54 boards carry the cart-line rule without containing a cart line. The generator of that block is not in `tools/`. The same block also holds the pin-card rule of CR-09.
- Other local variants: `.ce-cart-line-actions{display:grid;gap:12px;margin-top:4px}` (Pub10Bolsa, a frozen board whose name is an identifier, not copy: X-3; Pub10Estados, Pub10EstadosMovil, Pub10EstadosMovilP2, Pub10Tableta, Pub15SeguimientoMovil; a phone variant in Pub20Largos); `.ce-cart-line-actions{margin-top:4px}` (CSS present in the Pub11 boards and in several tablet boards, some of which draw no cart line); a full rewrite with `gap: 0` and explicit margins in Pub08Cambio (its comment reads «Propuesto — aproximación del prototipo») and Proto01Compra (`.shell .ce-cart-line-body{gap:0}`, code margin `var(--ce-size-product-gap-code)`, specs 2px, availability 8px).

**Rendered boards** [R]:
- Pub10Bolsa, first line (MENE): code to heading about 8px (8.5 measured), NAME to Description 2px, heading to specs 2px, specs to price 12px, price to availability **12px** (grid gap of the actions row; the ProductStack says 8px), availability to quantity 12px.
- Pub08Cambio (the board has 8 cart lines; the first six were read, all identical): heading to specs **-6px** (the specs box starts 6px above the bottom of the heading box). The board contains both its own rewrite (`.ce-cart-line-body > .ce-product-specs { margin: 2px 0 0 }`) and the shared `-6px` patch; both have the same specificity and the later patch wins (computed `margin-top: -6px`). Specs to price 12px and price to availability 8px are as drawn. Whether the glyphs visibly touch was not inspected. This is a defect in a board; it was not changed (no board may be edited in this work).

## 3. Current state in CE Theme

**Exists, but does not conform.** Checked: `project/components/bundle.css` lines 655-660 and 749-750 (128px image from 640px); `components/Cart/README.md` and `components/Cart/preview.html` (no code, no availability line, price inside the actions row, heading to specs at the recipe gap); `names.md` (ProductStack table).

## 4. Proposed change

Recipe: `ce-cart-line-body` (existing name; no new recipe). Replace the uniform gap by the ProductStack margins. Written for the CR-04 anatomy, where the price block is a direct child of the body.

```css
.ce-cart-line-body { display: grid; align-content: start; gap: 0; min-width: 0; }
.ce-cart-line-body > .ce-code { justify-self: start; margin-bottom: var(--ce-size-product-gap-code); }
.ce-cart-line-body > .ce-product-specs { margin-top: var(--ce-size-product-gap-identity); }
.ce-cart-line-body > :is(.ce-price-block, .ce-store-note, .ce-price-pending) { margin-top: var(--ce-size-product-gap-price); }
.ce-cart-line-body > .ce-stock { margin-top: var(--ce-size-product-gap-note); }
.ce-cart-line-body > .ce-cart-line-actions { margin-top: var(--ce-space-12); }
.ce-cart-line-body > :is(.ce-save-state, .ce-notice) { margin-top: var(--ce-space-8); }
```

- `justify-self: start` on the code is needed because `.ce-code` is `inline-block` and a grid item would stretch; the boards use an unclassed wrapper `div` or the same `justify-self`.
- All values are existing tokens (`--ce-size-product-gap-code` 8px, `-identity` 2px, `-price` 12px, `-note` 8px, `--ce-space-12`, `--ce-space-8`). No new raw value.
- The 12px between availability and the controls is a proposal taken from the Pub10 family (12px measured in Pub10Bolsa and equal to the existing `gap` of `ce-cart-line-actions`). Proto01Compra and Pub08Cambio use no explicit value there. See owner decision 1.
- The `.ce-save-state` / `.ce-notice` line (pending or failed quantity update) at 8px comes from Proto01Compra; to confirm.
- Legacy anatomy (price inside the actions row, vertically centred against the quantity): the specs-to-price distance then depends on the row alignment and is **to measure**; it cannot be made 12px without top-aligning the price. That is why this request ships with CR-04.

## 5. Accessibility and invariants it must keep

| Invariant | Applies? |
|---|---|
| NAME above Description, 2px / 2px / 12px | Yes: this request is exactly that rule for the cart line |
| One-line CE code | Yes, `ce-code` stays `nowrap` (see CR-04 for the board overrides) |
| Supplied decimal-string prices | Not touched (spacing only) |
| Focus ring, 44px public targets | Not touched; no control is moved |
| Text at x1.5 and x2 without overflow | Must still hold: margins do not depend on line count |

## 6. Acceptance checks

To run when the repository work happens (not run here, except where marked):
1. Harness measurement of the CR-04 anatomy: code to heading 8, NAME to Description 2, heading to specs 2, specs to price 12, price to availability 8, availability to actions 12 (or the value the owner picks). The method was run here on the current recipe [H] and gives 8 / 2 / 8 / 16 / 8 today.
2. A line without code, without availability (no store), and with the `ce-price-pending` message in place of the price: price-side distance still 12px.
3. Text x1.5 and x2, widths 390, 768, 1440: no overflow, no overlap.
4. The CE Theme test suite and axe checks named in its `coverage.md`; the repository's own tests were not seen.

## 7. Risks and what it does not change

- **Boards keep the local patch (X-3).** The 251 boards are a frozen snapshot and are not re-synchronised with a newer design-system copy: the `-6px` patch stays in the 77 boards, which keep their own copy, and a new board built on the new recipe must not carry it. Cascade: the board rule `.ce-cart-line-body .ce-product-specs{margin-top:-6px}` has the same specificity as the proposed `.ce-cart-line-body > .ce-product-specs` and comes later (board styles follow the bundle), so it **replaces** the 2px margin rather than adding to it; with the grid gap at 0 the heading-to-specs distance would be -6px (the specs overlap the heading) in a board that combined the new recipe with the patch. Nothing is applied automatically.
- Not changed: image size, line padding, price size (28px), quantity group, remove link, order summary.
- Other consumers of `ce-cart-line` (the Cart design-system card and the reference-site cart page listed in `coverage.md`) change by 6px (heading to specs) and, where the price starts the row, 4px (specs to price). Their visual review is **to do**; those pages were not seen.

## 8. Owner decisions needed

1. Price to availability: 8px (ProductStack; Pub08Cambio, Proto01Compra) or 12px (Pub10 family, 6 boards named above)? Recommended: 8px. And availability to controls: 12px or 8px? Recommended: 12px.
2. Decided (X-5, 2026-11-06): the ProductStack applies to cards, lists, details and tools, which covers cart lines ("lists" in `names.md`).
3. Submit with CR-04 (recommended) or first, with the compatibility note above.
