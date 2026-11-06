Status: Ready for owner review; not submitted anywhere

# CR-09 · Pin-card text uses the 2px identity gap

| | |
|---|---|
| Kind | Recipe-spacing gap ("pin-card gap 4px", recorded but not changed) |
| CE Theme target | `ce-pin-text` inside `ce-pin-card` (TaggedMedia recipe; standard name `ProductPinCard`), rules at `bundle.css` lines 161-165 |
| Depends on | Nothing |
| Checked against | CE Theme — Design System artifact version 1793881448-c98f (design-system.json: re-synced to `j3w1/ce-theme@e8b8d7a8`; `bundle.css` sha256 `de102fad7d927541e3c31c2c30dd770fa0d0fca3b4000a84a9e5bfcb7353ed06`) and the workbench boards of 5 November 2026. Evidence tags **[A] [S] [R] [H]** are explained in CR-08. |

## 1. Summary

The card that opens from a web pin shows NAME, Description and the store price (or a store note). In CE Theme its text container is a grid with `gap: var(--ce-space-4)`, so NAME and Description are 4px apart. The approved identity gap is 2px. The boards patch it to 2px everywhere. The request: set the pin-card gap to `--ce-size-product-gap-identity` and keep the price offset unchanged by expressing it from existing tokens. A related inconsistency (the store note that stands in for the price) is included for decision.

## 2. Problem and evidence

**Approved rule.** `decisions.md` [A], 2026-10-25 "Product stack spacing": NAME, Description and specs are 2px apart and the price follows the specs at 12px. CANON R-21: NAME on its own line above Description, 2px gap, in every card or preview that shows a product. `names.md` [A]: ProductPinCard = "The card a pin opens: NAME, Description, the store price and a chevron link to the product." X-5 (decided 2026-11-06) confirms that the ProductStack applies to pin cards.

**Recipe defaults** [A][H]:
- `.ce-pin-text { display: grid; gap: var(--ce-space-4); min-width: 0; padding: var(--ce-space-12) var(--ce-space-16) }`
- `.ce-pin-text .ce-price-block { margin-top: var(--ce-space-4) }`

Measured in the scratch harness with the shared bundle only [H]:

| Content of the pin text | NAME to Description | Description to next line |
|---|---|---|
| NAME, Description, price block | **4px** (identity gap is 2px) | 8px (4px gap + 4px margin) |
| NAME, Description, store note | **4px** | **4px** (note has no margin in the pin) |

**What the boards do** [S]:
- A patch `.ce-pin-card .ce-pin-text{gap:2px}` (inside the `/* ce-identity */` block, see CR-08) is present in 77 board files. Pin-card markup (`class="ce-pin-text"`) exists in 17 boards (102 cards); every one is covered.
- 17 boards also carry their own `.ce-pin-text { gap: 2px; }` (usually with the comment «Propuesto — aproximación del prototipo») and `.ce-pin-text .ce-price-block { margin-top: 6px; }` (a raw 6px, so that 2px + 6px = 8px, the recipe's offset).

**Rendered boards** [R]:
- Pub09Ideas (first of its 3 pin cards read): gap 2px, NAME to Description 2px, Description to price 8px.
- Pub09Estados, 18 pin-text blocks read: 8 price cards with 2px then 8px; 6 cards where a store note replaces the price with 2px then **2px**; 1 block with a differently built name element (2px); 3 blocks reported 0px because they were not laid out (hidden) and were ignored.

So in the boards the price starts 8px under the Description, but the message that replaces the price (store note, for example «Precio no disponible en Tienda B — demostración») starts 2px under it. In a product card the same note takes the price's place (12px under the specs, rule `.ce-product-info .ce-store-note`, `bundle.css` line 104). That rule does not apply inside a pin card.

## 3. Current state in CE Theme

**Exists, with the 4px gap.** Checked: `bundle.css` lines 156-169; `components/TaggedMedia/README.md` and `preview.html` (pin cards with price block); `names.md` (`ProductPinCard`).

## 4. Proposed change

Recipe: `ce-pin-text` (existing; no new name).

```css
.ce-pin-text { gap: var(--ce-size-product-gap-identity); }
.ce-pin-text :is(.ce-price-block, .ce-store-note, .ce-price-pending) {
  margin-top: calc(var(--ce-size-product-gap-note) - var(--ce-size-product-gap-identity));
}
```

- NAME to Description becomes 2px; Description to the price block stays 8px (2px gap + 6px margin, written from the tokens `--ce-size-product-gap-note` 8px and `--ce-size-product-gap-identity` 2px). No new raw value; the boards' raw `6px` disappears.
- The second selector line also moves the store note and the pending-price message to the price's offset (8px instead of 4px in the recipe, 2px in the boards). That part is a **change of behaviour** beyond "the gap"; owner decision 1.
- Markup is unchanged:

```html
<a class="ce-pin-card" href="…"><div class="ce-pin-text">
  <span class="ce-product-name">MENE</span>
  <span class="ce-product-description">Taza de Vidrio Resistente al Calor</span>
  <div class="ce-price-block">…supplied price…</div></div>
  <span class="ce-pin-chevron" aria-hidden="true">…</span></a>
```

## 5. Accessibility and invariants it must keep

| Invariant | Applies? |
|---|---|
| NAME above Description, 2px / 2px / 12px | Yes. In a pin card there are no specs; the price offset stays at the 8px the recipe and boards already use (see owner decision 2) |
| One-line CE code | The pin card shows no code: unchanged |
| Supplied decimal-string prices | Unchanged; the price block keeps the supplied string and its screen-reader text |
| Focus ring | Unchanged (`.ce-pin-card:focus-visible` 2px outline, 3px offset) |
| 44px targets | Unchanged (dot with 44px hit area, chevron cell 44px per `TaggedMedia/README.md`) |
| Pins never mixed with lettered markers on one photo; every pinned product also listed in text | Unchanged |

## 6. Acceptance checks

To run when the repository work happens (not run here, except where marked):
1. Harness: NAME to Description 2px, Description to price block 8px, Description to store note 8px (or the value the owner picks). Method run here on the current recipe [H]: 4 / 8 / 4.
2. Pin card with a promotional price (the `ce-price-history` block above the offer price, as in the TaggedMedia preview): the block still starts at the same offset.
3. Open card stays inside the photo at 390, 768 and 1440 (`enhancePins()` behaviour unchanged); long NAME and Description wrap.
4. Text x1.5 and x2: no overflow.

## 7. Risks and what it does not change

- Pin cards become about 2px shorter (and about 2px more where a note takes the price offset): the "flip above" placement in `enhancePins()` depends on card height; to verify in the repository tests (not seen).
- The 77 boards keep their local patches as part of the frozen snapshot (X-3); there is no re-synchronisation pass. A board that combined the new recipe with its patches would find `.ce-pin-card .ce-pin-text{gap:2px}` harmless (same value) and the 17 boards' `margin-top: 6px` equal to the new computed value.
- Not changed: card width limits, padding (12px 16px), price size (32px in the pin), chevron cell, hover and focus behaviour.
- Related, not proposed here: boards add `.ce-pin-card .ce-store-note { font-size: 13px }` and `.ce-pin-card .ce-skeleton { width: 72px; height: 24px }` (7 boards each). These are raw values for pin states.

## 8. Owner decisions needed

1. Should the store note and the pending-price message in a pin card start at the price's offset (8px, proposed) or stay tight (2px as drawn in the boards)? Recommended: 8px, so a missing price does not read as part of the identity.
2. Keep the pin card's price at 8px under the Description (current recipe and boards) or move it to 12px like a card with specs? Recommended: keep 8px (no specs in the pin).
