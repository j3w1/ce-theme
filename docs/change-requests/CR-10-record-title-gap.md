Status: Implemented in CE Theme by pull request [#21](https://github.com/j3w1/ce-theme/pull/21) (recipe `recipes/workspace.css`, RecordEditor sample and README, `docs/decisions.md`). Decisions 2 and 3 were decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed: the repository lead's selection in [j3w1/ce-theme#11](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160). Decision 4 (below) fixes the record-header overlap that acceptance 4 exposed, so `ce-record-header` changes after all (section 7 said it would not). The frozen boards are unchanged (X-3). Sections 2 to 7 are the dated proposal

# CR-10 · Record title with product identity follows the ProductStack

| | |
|---|---|
| Kind | Recipe-spacing gap ("record-title grid gap 4px", recorded but not changed) |
| CE Theme target | `ce-record-title` in the RecordEditor recipe (`bundle.css` lines 829-830); the RecordEditor design-system card |
| Depends on | Nothing |
| Checked against | CE Theme — Design System artifact version 1793881448-c98f (design-system.json: re-synced to `j3w1/ce-theme@e8b8d7a8`; `bundle.css` sha256 `de102fad7d927541e3c31c2c30dd770fa0d0fca3b4000a84a9e5bfcb7353ed06`) and the workbench boards of 5 November 2026. Evidence tags **[A] [S] [R] [H]** are explained in CR-08. |

## 1. Summary

The title block of a product record (code, NAME and Description, optional specs, meta line) is a grid with a uniform 4px gap. The ProductStack asks for 8px between the code and the NAME and 2px between the heading and the specs. Of the seven boards with a product title, four use the recipe's direct-child structure (and one of them patches the specs distance), three nest the identity inside the heading with their own inline 6px gap; none reaches 8px. The request: keep the grid as it is and add explicit margins for the product-identity children only, so titles without product identity are untouched by construction, and, for new boards, use the direct-child structure (the three frozen nested titles stay as they are: X-3).

## 2. Problem and evidence

**Approved rule.** `names.md` [A]: the ProductStack spacing applies "on cards, lists, details and tools" (CECode to NAME 8px, NAME/Description/specs 2px). CANON R-21 (boards): NAME on its own line above Description, 2px, specs 2px. X-5 (decided 2026-11-06) confirms that the ProductStack applies to details and tools, which covers record titles.

**Recipe defaults** [A][H]: `.ce-record-title { display: grid; gap: var(--ce-space-4); min-width: 0 }`. Measured in the scratch harness (shared bundle only) with a code, an `h1.ce-product-heading` (`--ce-product-text: 22px`), a specs line and a meta line:

| Between | Measured | ProductStack |
|---|---|---|
| code and heading | **4px** | 8px |
| NAME and Description | 2px | 2px |
| heading and specs | **4px** | 2px |
| specs and meta line | 4px | (not part of the stack) |

**Boards** [S]:
- `class="ce-record-title"` appears in 19 boards (20 occurrences). 7 of them hold product identity (`ce-product-heading` plus a code), in two structures:
  - **Direct children (4):** Adm02Editor, Adm02Tableta and Adm02TabletaAbierto (`div.row` with the code and two pills, then `h1.ce-product-heading` or `h2.ce-product-heading`), and Proto02Publicacion (`p.eb` eyebrow, `span.ce-code`, `h2.ce-product-heading`, `p.ce-product-specs`, meta). The recipe's 4px gap separates them.
  - **Nested (3):** Adm10Publicaciones and Adm10Tiendas (`p.eb`, then an `h2` with inline `display:grid; gap:6px` that contains `span.ce-code` and `span.ce-product-heading`), and the second title of Adm10Estados (`div.ce-record-title` with inline `gap:6px`, then an `h3` with the same inline grid containing code and identity). In these three the code-to-identity distance is the inline **6px**, not the recipe's 4px, and the identity is not a child of the title.
- The other 12 hold a plain `h1`/`h2` and a meta line, some with an eyebrow or breadcrumbs before the heading (Adm03Categorias: `nav.ce-breadcrumbs` then `h2`; Adm09Escena: `p.eb` then `h2`; also Adm11PedidoDetalle, Adm14Casos).
- Only Proto02Publicacion has specs inside the title, and only it patches: `.ce-record-title .ce-product-specs { margin-top: -2px; }` (4px - 2px = 2px).

**Rendered boards** [R]:
- Adm02Editor: row (code and two pills) to heading **4px**, heading to meta line 4px. No specs in this title.
- Proto02Publicacion: eyebrow to code 4px, code to heading **4px**, heading to specs 2px (through the -2px margin), specs to meta line 4px.
- The other five product titles were not rendered. By static scan, the two Adm02 tablets use the recipe gap (4px) with no override; the three nested titles set their own inline 6px.

**CE Theme's own sample** [A]: `components/RecordEditor/preview.html` draws the title as one run-in heading, `<h1>MENE · Taza de Vidrio Resistente al Calor</h1>`, with the code above it and no specs. The boards draw the same record with NAME and Description as separate lines (`h1.ce-product-heading`). `decisions.md` (2026-10-23, "Product NAME") says the NAME is separate from the Description.

## 3. Current state in CE Theme

**Exists, with the uniform 4px gap.** Checked: `bundle.css` lines 827-832 (`ce-record-header`, `ce-record-title`, `ce-record-meta`); `components/RecordEditor/README.md` ("`ce-record-title` (code, `h1`/`h2`, `ce-record-meta`)"); the preview named above; `names.md` (ProductStack).

## 4. Proposed change

Recipe: `ce-record-title` (existing name; no modifier class). The existing rule `display: grid; gap: var(--ce-space-4)` is **kept**; two margins are added for the identity children only.

```css
/* existing, unchanged: .ce-record-title { display: grid; gap: var(--ce-space-4); min-width: 0; } */
.ce-record-title > .ce-product-heading { margin-top: calc(var(--ce-size-product-gap-code) - var(--ce-space-4)); }      /* 4px gap + 4px = 8px */
.ce-record-title > .ce-product-heading:first-child { margin-top: 0; }
.ce-record-title > .ce-product-specs { margin-top: calc(var(--ce-size-product-gap-identity) - var(--ce-space-4)); }    /* 4px gap - 2px = 2px */
```

- A title without a `.ce-product-heading` or `.ce-product-specs` child is untouched by construction: no selector matches it and the grid gap is unchanged, so an eyebrow or breadcrumbs followed by a plain `h2` (Adm03Categorias, Adm09Escena) keeps its 4px. An earlier draft of this request set `gap: 0` and relied on `.ce-record-title > * + * { margin-top: 4px }`; that would have failed, because the bundle's `.ce-record-title :is(h1, h2) { margin: 0 }` (line 830, specificity 0,1,1) outranks a `* + *` margin (0,1,0) and would have collapsed the eyebrow-to-heading distance to 0. The margins above are on `.ce-product-heading` (0,2,0), which outranks line 830 on `h1` and `h2` headings alike.
- The code (or the row that holds the code and its pills) to the heading becomes 8px; heading to specs 2px; every other neighbour stays at 4px. Values are the existing tokens `--ce-size-product-gap-code`, `--ce-size-product-gap-identity` and `--ce-space-4`, combined with `calc()`. No new raw value.
- **Nested titles (markup normalisation, owner decision 3).** The rule does not reach a `span.ce-product-heading` nested inside an `h2` or `h3` (Adm10Publicaciones, Adm10Tiendas, Adm10Estados). Those titles stay at their inline 6px until their markup is normalised to the direct-child structure the four other boards use. Normalisation keeps each title's contextual heading level (`h2` in Adm10Publicaciones and Adm10Tiendas, `h3` in Adm10Estados), adds `ce-product-heading` to that heading element, moves the `ce-code` out to be its preceding sibling in the title, and removes the obsolete inline `display:grid; gap:6px` on the heading and the inline `gap:6px` on the title, so the recipe's default 4px grid applies; the CSS above works for either heading level. That is a board-side matter, not a recipe rule: under X-3 the three frozen boards are not normalised, and new boards use the direct-child structure. The alternative, a second selector for the nested shape, is not proposed: it would make the heading element's inline grid part of the contract.
- Preview change (documentation, in the same change): draw the RecordEditor sample title with `h1.ce-product-heading` (NAME and Description as two spans) instead of the run-in text. Skeleton:

```html
<div class="ce-record-title">
  <span class="ce-code" style="justify-self:start">CE2606<span class="ce-code-number">1441</span></span>
  <h1 class="ce-product-heading"><span class="ce-product-name">MENE</span>
      <span class="ce-product-description">Taza de Vidrio Resistente al Calor</span></h1>
  <p class="ce-product-specs">vidrio borosilicato, 250ml</p>   <!-- optional -->
  <div class="ce-record-meta">…</div></div>
```

## 5. Accessibility and invariants it must keep

| Invariant | Applies? |
|---|---|
| NAME above Description, 2px / 2px / 12px | Yes (2px identity gap and 2px to the specs; there is no price in a record title, so the 12px does not apply) |
| One-line CE code | Yes: `ce-code` stays `nowrap`; pills beside it wrap onto their own line instead (boards use a `row` that wraps) |
| Supplied decimal-string prices | Not applicable |
| Focus ring, 44px targets | Not touched; the title has no control |
| One `h1` per page | The title is the page's `h1` in Adm02Editor, an `h2` in most boards and an `h3` in the second title of Adm10Estados; this request changes no heading level, and the normalisation of the three nested titles keeps each one's level |

## 6. Acceptance checks

To run when the repository work happens (not run here, except where marked). Implemented as `tests/browser/record-title.spec.mjs`, which measures each item in a harness that loads only the generated tokens and recipes; item 4 runs both in a page-wide title and in a record header beside the image and the status pill, and checks that the enlarged text really is larger; the RecordEditor sample is measured there too.
1. Harness: code (row) to heading 8, NAME to Description 2, heading to specs 2, specs to meta 4. Method run here on the current recipe [H]: 4 / 2 / 4 / 4.
2. A title without product identity: plain `h2` and meta, and a plain `h2` preceded by an eyebrow paragraph or by `nav.ce-breadcrumbs` (the Adm03Categorias and Adm09Escena shapes): every distance unchanged at 4px, with the bundle's `.ce-record-title :is(h1, h2) { margin: 0 }` still in force.
3. A title with a code and a meta line but no specs: heading to meta 4px.
3b. A nested title (an `h2` containing `span.ce-code` and `span.ce-product-heading`, as in Adm10Publicaciones): unchanged by the recipe; after normalisation to the direct-child shape it measures as item 1.
4. Long NAME and Description wrap, code stays on one line, at 390, 768, 1440 and text x1.5, x2.

## 7. Risks and what it does not change

- Proto02Publicacion's local `.ce-record-title .ce-product-specs { margin-top: -2px }` is the same value the recipe now computes (4px gap - 2px); the later board rule replaces the recipe's margin with an equal one, so it is harmless; it stays in the frozen board (X-3) and a new board does not need it. Nothing is applied automatically.
- The four direct-child product titles would grow by 4px (code to heading 4px to 8px) if re-synchronised, which X-3 rules out for the frozen boards; the three nested titles do not change, and would move from 6px to 8px only after their markup is normalised. Heights in `$preview` would then need re-measuring (design task, not part of this request).
- Not changed: heading size (`--ce-product-text` is set per board: 22px in Adm02Editor, 18px in Proto02Publicacion), `ce-record-header` grid, the meta line style, the pill and the thumbnail.

## 8. Owner decisions needed

1. Decided (X-5, 2026-11-06): the ProductStack applies to details and tools, which covers record titles, so the code to NAME distance is 8px. Four boards draw 4px and three draw 6px today; they stay as they are in the frozen snapshot (X-3).
2. Decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed ([issue #11 comment](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)): the RecordEditor sample uses the identity heading (`h1.ce-product-heading`, NAME and Description as two spans) instead of the run-in title.
3. Nested titles (Adm10Publicaciones, Adm10Tiendas, Adm10Estados): X-3 (decided 2026-11-06) rules out the re-synchronisation pass, so these frozen boards keep their inline 6px and are not normalised. Decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed ([issue #11 comment](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)): new examples use the direct-child identity structure, and the recipe gets no selector for the nested shape. Contextual heading levels are kept, the frozen nested titles stay untouched, and titles without product identity keep their current spacing.
4. Decided by the repository lead under the same standing delegation, not j3w1-typed ([issue #11 comment](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)): fix inside CR-10 the record-header overlap that acceptance 4 exposed. At 390px with 200% text the header left the title about 119px beside the image and the status pill, while the one-line code needs about 189px, so the code and the identity ran under the pill. The header now lays out the thumbnail, the title and the status on one wrapping line; the title is never narrower than its one-line code, and where the line has no room the status moves to the next line. Markup, classes, type scale, the one-line code, the status and heading levels are unchanged, and so is the header wherever the line has room.
