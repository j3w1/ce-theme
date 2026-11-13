Status: Implemented in CE Theme by pull request [#17](https://github.com/j3w1/ce-theme/pull/17): recipe `ce-demo-cue`, standard name `DemoCue`, the `DemoCue` design-system card and the rules in `docs/names.md` (“Demonstration cue”). Decisions 2 to 4 were decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed ([issue #11 comment](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)).

# CR-03 · Demonstration cue (`ce-demo-cue`)

| | |
|---|---|
| Kind | Shared-pattern candidate: new small recipe (look only; the text is supplied) |
| CE Theme target | New recipe `ce-demo-cue` in CE Theme (X-4); standard name `DemoCue` (accepted, X-8); a design-system card |
| Depends on | Nothing |
| Checked against | CE Theme — Design System artifact version 1793881448-c98f (design-system.json: re-synced to `j3w1/ce-theme@e8b8d7a8`; `bundle.css` sha256 `de102fad7d927541e3c31c2c30dd770fa0d0fca3b4000a84a9e5bfcb7353ed06`) and the workbench boards of 5 November 2026. Evidence tags **[A] [S] [R] [H]** are explained in CR-08. |

## 1. Summary

Every commercial and staff board must say, in words, that the data and the operations are simulated: «Demostración — datos y operaciones simulados». The boards draw it with a hand-written class `demo-cue` that exists in 119 files with at least eleven slightly different definitions, plus pills, badges, fine-print paragraphs and bare `strong` text (243 of the 251 boards carry the exact string; counts in section 2 are the 5 November 2026 recount). CE Theme has no recipe for it. The request: one recipe for the look, the exact text kept in the consumer, and a decision on where the cue is allowed.

## 2. Problem and evidence

**The rule** [S]: CANON section B: "Demonstration cue, exact text, visible on every commercial page/frame: **Demostración — datos y operaciones simulados**". README-HANDOFF section 2: the cue on commercial and staff boards. The string uses an em dash (U+2014) and appears exactly in **243 of the 251 board files** (recounted on 5 November 2026 after the last 16 boards were added: exact-string search over every `.dc.html`; the earlier snapshot of 235 files gave 227). The eight files without it are not commercial or staff pages: the three index parts, the four decision boards and `Shared02Contracts`.

**Placement in the boards** [S][R]:
- Staff pages: first child of `.ce-app-main`, before the page header (Adm01Resumen: `<p class="demo-cue" role="note">` then `.ce-page-header`).
- Public pages: under the breadcrumbs and above the `h1` (Pub10Bolsa, a frozen board; its name is an identifier, not copy: X-3), and again in the footer fine print with a longer sentence («Demostración — datos y operaciones simulados. Importes y disponibilidad de demostración; no son precios ni stock vigentes.»).
- State sheets: inside every frame in Pub10Estados, Pub11Estados, Pub20Largos and the phone sheets of Pub14/15/17 (CR-02 section 2.2 gives the per-sheet counts); "once per sheet instead of per frame where the frames are plain route states" in some boards (`IndiceP3`, State sheets note). CR-02's inventory shows that several sheets whose frames do show simulated prices or operations (for example the Variant B, C, D, G and K sheets) carry only one cue for the whole sheet. Those frames do not meet CANON section B today; they stay as they are in the frozen snapshot (README decision X-3), and new sheets carry the cue in each such frame.
- Split boards (parts 2 and 3 of a long board) carry a banner with the cue (README-HANDOFF section 4).

**Local definitions** [S]: 119 boards define `.demo-cue`. Common to all of them: `padding: 8px 12px; border: 2px solid var(--ce-color-text-primary); font-weight: 700`. They differ in font size (`14px` in 73 boards, `var(--ce-font-size-sm)` in 15, `13px` in 31), margin (`0` or `0 0 16px`), display (`flex` with `width: fit-content; max-width: 100%; gap: 8px` in 25 definitions, `inline-flex` in 29, plain block in the rest, `flex: 1 0 100%` in one), `line-height: 1.3` in some, and one definition adds `background: #fff` (a raw colour). The counts of definitions are per file; whether each rule is used on its board was not checked for the 31 boards at 13px.

**Markup shapes of the exact text** [S]. Method (recount of 5 November 2026 over the 251 files): every element whose opening tag is immediately followed by the exact string; the innermost wrapper counts, so a `strong` inside a fine-print paragraph counts as `strong`; template strings in scripts are not matched because the string there is not preceded by a tag. 529 occurrences; first board in brackets:

| Wrapper | Occurrences |
|---|---|
| `p.demo-cue[role="note"]` (Adm01Estados) | 163 |
| `strong` in fine print (Categoria) | 159 |
| `span.ce-pill.ce-pill--info` in a page header's actions (Adm07Estados) | 32 |
| `span.ce-badge` on the share-link boards (Compartir) | 23 |
| `span` without class, in the utility bar of the shell boards (Pub01Shell) | 23 |
| `p.wrap[style]` (Main) | 21 |
| `p.demo-cue[role="note"][style]` (Proto01Compra) | 21 |
| `p.ce-fine-print[style]` on the photo boards (Pub04FotosMovil) | 18 |
| `p.demo[role="note"]` (Fixtures) | 14 |
| `span[style]` (Adm11MovilP2) | 13 |
| `p.foot-note` on the photo boards (Pub10FotosTableta) | 13 |
| `p.lg-cue[role="note"]` (Pub20Largos) | 8 |
| `span.ce-pill.ce-pill--info[style]` (Adm07PromocionesMovil) | 6 |
| `p.demo-cue.sc[role="note"]` (Pub11Compra) | 5 |
| `p.ce-fine-print` (Pub04Filtros) | 4 |
| `p.banner[role="note"][lang="es"]` (Shared01Inventory) | 2 |
| `p[role="note"][style]` (AccionesCompra) | 1 |
| `p.demo-cue` without `role` (Proto02Publicacion) | 1 |
| `p.ce-pill.ce-pill--info[role="note"][style]` (Pub16Respuesta) | 1 |
| `strong[style]` (Publicacion) | 1 |

One visual shape is not distinguished by this innermost-wrapper inventory: the quiet 12px strip that several state sheets use for the sheet-level cue (CR-02 section 2.2). Its `.cue` instances (Pub02Estados, Pub03Estados, Pub09Estados, Pub18Estados, Pub20Estados and others) put the exact string in a nested `strong`, so they are counted in the `strong` row above, not omitted; the `.lg-cue` instances of Pub20Largos have their own row (8). The 529 total already includes both. The strip is a matter of visual ancestry (a subtle band with a bottom border instead of the bordered block) and is part of owner decision 3.

## 3. Current state in CE Theme

**Missing.** `bundle.css` (searched in full) has no cue, demo or notice-for-simulation selector. Searched in text, no hit for a demonstration notice: `names.md`, `README.md`, `apply-ce-theme.md`, `decisions.md`, `coverage.md`, `evolution.md`, `ce-systems-organization.md` and ten component READMEs (Cart, StoreContext, ProductCard, TaggedMedia, AppShell, StandardNamesStore, StandardNamesNavigation, RecordEditor, Status, Callout); the other component cards, `sharing.md`, `pricing.md`, `controls.md` and `product-identity.md` were **not** searched. The nearest existing idea is wording: `decisions.md` (2026-10-30, "Message status wording") says "a simulated message adds «· simulado»", and `coverage.md` says the messaging example "is fixture-backed and says so on the page". The nearest recipes are `ce-notice` (icon, bold title and sentence; informational by default) and `ce-pill--info`.

## 4. Proposed change

Recipe: `ce-demo-cue`. Standard name: `DemoCue` («Aviso de demostración»), accepted under X-8. The element is a note, not a status and not a button.

```html
<p class="ce-demo-cue" role="note">Demostración — datos y operaciones simulados</p>
```

```css
.ce-demo-cue {
  display: flex; width: fit-content; max-width: 100%; align-items: center;
  gap: var(--ce-space-8); margin: 0;
  padding: var(--ce-space-8) var(--ce-space-12);
  border: var(--ce-stroke-focus) solid var(--ce-color-text-primary);   /* 2px: reuses the focus stroke; X-2 adds no 2px token */
  color: var(--ce-color-text-primary);
  font-size: var(--ce-font-size-sm); font-weight: var(--ce-font-weight-bold);
  line-height: var(--ce-font-line-heading);
}
```

- Tokens only. The 2px border reuses `--ce-stroke-focus` (value 2px), which is semantically the focus stroke; X-2 (decided 2026-11-06) adds no dedicated 2px token. `line-height` uses the heading line (1.2); the boards use 1.3 in some definitions, so the box is slightly shorter (about 1.4px per line at 14px, **to measure**).
- The string is **not** part of the recipe: the consumer supplies it, so CE Meta App can say «simulado» in its own words.
- Compact forms (the info pill in a page header, the badge on the share-link boards) are not proposed; owner decision 3.
- Placement rule for the documentation: once at the top of the main content of a page that shows simulated data. In a state sheet, **inside every frame that shows simulated commercial or staff data**: CANON section B requires the exact cue "visible on every commercial page/frame", and a frame is viewed and cropped on its own. A sheet-level cue may be added above the frames but never replaces the per-frame cue; only frames with no simulated data (a route shell, a documentation-only fragment) need none. Owner decision 4 asks the owner to confirm this reading, not to choose a weaker one. In production the element is not rendered; hiding it with CSS is not enough.
- The cue never replaces the label «Escenario» that the boards put on scenario frames.

## 5. Accessibility and invariants it must keep

| Invariant | Applies? |
|---|---|
| Status never by colour alone | Yes: words plus a 2px border; no colour is used |
| Contrast | Ink on the page ground, the same pair as body text (`--ce-color-text-primary` on `--ce-color-surface-canvas`), which CE Theme validates in `ce-theme.json`; not recomputed here |
| Focus ring | Not applicable: the cue is not interactive and takes no focus |
| 44px targets | Not applicable |
| `role="note"` | Required on the cue, as the boards use it (X-7, decided 2026-11-06) |
| Language | The Spanish string carries `lang="es"` where the surrounding page language differs (Shared01Inventory does; the product pages are `lang="es"`) |
| NAME / Description / specs, CE codes, prices | Not applicable; the cue carries no product, code or amount |
| Share images and metadata | CE Theme's README says the share card "never carries a price"; `sharing.md` was not read. Whether the cue may appear inside a 1200 x 630 image was **not checked** (the Compartir boards place a badge on the board next to the image) |

## 6. Acceptance checks

Run here [S]: exact-string search across the 251 boards (243 contain it; recount of 5 November 2026); wrapper shapes recounted with the method stated in section 2; local definitions inventoried (119 files, unchanged by the recount).
To run when the repository work happens (not run here):
1. Render at 390, 768, 1440 and text x1.5, x2: the cue wraps, never overflows, never overlaps the page header.
2. Axe on the new design-system card; reading order puts the cue at the top of main content.
3. A test that the recipe contains no literal text and no raw colour.
4. A check that the consumer's string equals «Demostración — datos y operaciones simulados» where the owner wants that exact wording.

Implemented with the recipe: checks 1 and 2 are `tests/browser/demo-cue.spec.mjs` (the `DemoCue` card at 390, 768 and 1440 px with text at 100%, 150% and 200%, a consumer word longer than the container inside and outside `.ce-scope`, axe, and the ARIA order of the main region); checks 3 and 4 are `tests/demo-cue.test.mjs` (the rule holds only tokens and keywords, no `content` and no raw colour; every shipped `ce-demo-cue` example is a `role="note"` element whose text is exactly the canon wording). Measured once in Chromium on the same card with the generated `tokens.css` and `recipes.css` and the Inter files (the tests themselves assert geometry, not these numbers): at 14px the line is 16.8px and the box 36.8px tall and 380px wide; at 390px it wraps to two lines (three at 200% text). The recipe adds `overflow-wrap: anywhere` to the section 4 rule so that a word longer than its container wraps (*pending review*). Not run: WebKit locally (hosted CI runs it), screen readers, real devices, forced colours.

## 7. Risks and what it does not change

- A demonstration-only element enters the shared system, as decided (X-4, 2026-11-06): the cue goes in CE Theme and the state frame (CR-02) in a documentation kit.
- If a build forgets to remove the cue in production, simulated-data wording appears on real data; the recipe cannot prevent that.
- The 119 local rules stay in the frozen snapshot (X-3); new boards use the recipe. 31 of them (13px) would change to 14px if re-synchronised; the other definitions differ by margin, display and line height.
- Not changed: `ce-notice`, `ce-pill`, the footer fine-print sentence, any board.

## 8. Owner decisions needed

1. Decided (X-4, X-8, 2026-11-06): the cue is a shared recipe in CE Theme, `ce-demo-cue`, with the standard name `DemoCue` accepted with its changes (CE Meta App also shows simulated data and `decisions.md` already has «· simulado»).
2. Decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed ([issue #11 comment](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)): the text stays in the consumer. The recipe is appearance only; examples that need the canon wording use «Demostración — datos y operaciones simulados».
3. Decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed ([issue #11 comment](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)): the block cue is the only form of the shared recipe. The compact pill, badge and quiet-strip forms are retired in new examples and get no modifier; the frozen snapshot is preserved.
4. Decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed ([issue #11 comment](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)): every frame showing simulated commercial or staff data carries the cue. An additional sheet-level cue is optional and never counts as a frame's cue. The cue is left out of production output, not merely hidden.
5. Border: Decided (X-2, 2026-11-06): the cue reuses `--ce-stroke-focus` (2px); no dedicated token is added.
6. Decided (X-7, 2026-11-06): `role="note"` stays on the cue, as a recipe-level rule.
