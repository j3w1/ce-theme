Status: Implemented in CE Theme by pull request [#29](https://github.com/j3w1/ce-theme/pull/29) as the StateFrame documentation kit: `design-system/doc-kit/state-frame.css` and its `README.md`, shipped in the design-system bundle as `doc-kit/`. It is not a recipe, a component, a registry entry or a design-system card; the name `StateFrame` appears only in the kit's documentation. Decisions 2, 4, 5 and 7 were decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed ([issue #11 comment](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)). Four corrections to the section 4.1 rule, found by the acceptance checks of section 6 (“Implemented with the kit”), were accepted by the repository lead under the same standing delegation, not j3w1-typed; j3w1 may veto them. Check 1 of section 6 remains unmet, as the repository lead recorded: strict pixel preservation is proved for 863 of 900 comparisons against the unpositioned plain block and 869 of 900 against the positioned one; the scroll-context diagnostics do not count as passes, and five Adm15Estados comparisons remain unexplained.

# CR-02 · State-sheet frame (`ce-state-frame`): one frame and label for documentation sheets

| | |
|---|---|
| Kind | Documentation-pattern candidate: new small recipe for the frame, marker, label and body that state sheets draw around every state (look only; the text is supplied). Home: a documentation kit beside CE Theme, not the recipe bundle (X-4, decided 2026-11-06; section 4.3) |
| CE Theme target | A kit stylesheet with `ce-state-frame` and its parts that loads after `components/bundle.css` and uses only `tokens.css` (X-4); the standard name `StateFrame` is accepted (X-8) |
| Depends on | CR-03 (`ce-demo-cue`): the frame body starts with the cue, and the documentation kit's frame depends on CE Theme's cue, never the reverse (X-4; section 9) |
| Checked against | CE Theme — Design System artifact version 1793881448-c98f (design-system.json: re-synced to `j3w1/ce-theme@e8b8d7a8`; `components/bundle.css` sha256 `de102fad7d927541e3c31c2c30dd770fa0d0fca3b4000a84a9e5bfcb7353ed06`) and the workbench boards of 5 November 2026. Evidence tags **[A] [S] [R] [H]** are explained in CR-08. This request uses only [A] and [S]: nothing was rendered or measured in a browser or harness |

## 1. Summary

Thirty-six boards named `*Estados*` and the long-string stress board `Pub20Largos` are state sheets: documentation boards that stack several states of one page, each inside a frame with a label (a letter, a number or a tag, a title and a one-line note). The canon records the sheet as documentation (CANON R-16). The frame and label are not a CE Theme pattern, so every family drew its own: **twelve markup and style variants** across the 37 boards (261 frames), with two raw colours, no shared marker, and labels that are a `p`, a `div`, a `strong`, an `h2`, an `h3` or a `figcaption` depending on the board. The request: one frame recipe written from tokens, living in a documentation kit (X-4), and the rule that ties it to the demonstration cue of CR-03.

## 2. Problem and evidence

**The rule** [S]: CANON R-16 "Heading structure of state sheets: a state sheet is documentation: stacked frames reproduce a page heading inside each frame. Recorded as an accepted exception; every sheet still has one document-level title." CANON R-03 and R-15: scenario frames (confirmed sold out, few units) are "tagged «Escenario» in English in the annotation and in the frame label"; a family is complete only when "each frame has an annotation with walkthrough". The workbench templates `templates/tpl-storefront-1440.dc.html` and `templates/tpl-admin-1440.dc.html` define no frame or label chrome (searched for `.frame`, `.st`, `.var`, `.an-label`, `.frame-label`: 0 hits), so each sheet author invented one.

**Boards in scope** [S]: 36 files whose name contains `Estados` plus `Pub20Largos` (37 of the 251 boards). Frames were counted statically as container elements carrying the variant's frame class; a label was counted as the element that names the frame. Counts are per file.

### 2.1 Inventory by variant

| # | Variant (frame / label / marker) | Boards (frames) | Markup | Local CSS of the frame chrome (abridged) |
|---|---|---|---|---|
| A | **Lettered frame card**: `section.frame[aria-labelledby]` > `header.frame-h` (`span.frame-tag[aria-hidden]` letter A–H, `div` > `h2` or `h3` + `p`) + `div.frame-b`; sheet grid `.frames` (2 columns, `.three`), `.frame.wide`; strip `.boardlabel`; notes `.notes` | Pub10Estados (6), Pub10EstadosMovil (5), Pub10EstadosMovilP2 (3), Pub11Estados (8), Pub11EstadosMovil (4), Pub11EstadosMovilP2 (3) · **6 boards, 29 frames** | the cue `p.demo-cue[role="note"]` is the first child of every `frame-b` (rule `.frame-b>.demo-cue{justify-self:start}`); «Escenario» as `span.scn` inside the `h2` (Pub10EstadosMovil) | `.frame{border:1px solid var(--ce-color-border-default);background:#fff;min-width:0}` · `.frame-h{display:flex;gap:12px;align-items:flex-start;padding:16px 24px;background:var(--ce-color-surface-subtle);border-bottom:1px solid var(--ce-color-border-default)}` (`12px 16px` in the phone boards and below 640px) · `.frame-tag{width:28px;height:28px;border-radius:999px;background:var(--ce-color-surface-inverse);color:#fff;font-size:13px;font-weight:700}` · `.frame-h h2{font-size:16px;line-height:1.3;letter-spacing:-.01em}` · `.frame-h p{margin:2px 0 0;font-size:13px;line-height:1.4;color:var(--ce-color-text-secondary)}` · `.frame-b{padding:24px;display:grid;gap:20px}` · `.frames{gap:32px}` · phone: `.sheet{gap:24px}`, `.sheet .frame{border-inline:0}`, `.sheet-h1{font-size:24px}` · `.boardlabel{padding:10px 48px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--ce-color-text-secondary)}` · `.scn{padding:2px 8px;border:1px solid var(--ce-color-text-primary);font-size:11px;letter-spacing:.08em;text-transform:uppercase}` |
| B | **Labelled frame, desktop**: `section.frame[style]` > `div.frame-label` (text + `span`) + `div.frame-body[style]`; `.frames`; notes `.notes` with `ce-eyebrow` | Pub13Estados (9), Pub14Estados (6), Pub15Estados (7), Pub17Estados (5) · **4 boards, 27 frames** | the label is a `div`, so the `section` has no accessible name (0 `aria-label`, 0 `aria-labelledby`). Inline styles: 54 `style` attributes on frame and body elements (method: every element whose class tokens include `frame` or `frame-body` and that carries a `style` attribute), **51 of them empty** (`style=""`), one each `padding: 16px`, `max-width: 390px` (Pub14Estados), `grid-column: 1 / -1` (Pub15Estados) | `.frame{border:1px solid var(--ce-color-border-control);background:var(--ce-color-surface-canvas)}` · `.frame-label{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:10px 16px;background:var(--ce-color-surface-subtle);border-bottom:1px solid var(--ce-color-border-control);font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}` · `.frame-label span{font-weight:400;letter-spacing:0;text-transform:none;color:var(--ce-color-text-secondary)}` · `.frame-body{padding:24px;display:grid;gap:16px}` · `.notes{border-top:2px dashed var(--ce-color-border-control);padding-block:32px 40px}` |
| B-m | **Labelled section, phone**: `section.st[aria-label]` > `div.st-label` (`strong` + `span`) + `div.st-body`; sheet head `.an-top` | Pub14EstadosMovil (9), Pub15EstadosMovil (8), Pub17EstadosMovil (6) · **3 boards, 23 frames** | no box: a 4px top rule marks the frame; the three boards also carry the whole Variant B rule set unused. Pub15EstadosMovil adds `span.tag` (outline tag, 4) and `.card` (5) | `.st-label{padding:12px 16px 14px;background:var(--ce-color-surface-subtle);border-top:4px solid var(--ce-color-text-primary);font-size:12px;line-height:1.5}` · `.st-label strong{display:block;letter-spacing:.06em;text-transform:uppercase;margin-bottom:2px}` · `.st-body{padding:16px 16px 28px;display:grid;gap:16px}` · `.an-top{padding:20px 16px;background:var(--ce-color-surface-subtle)}`, `.an-top h1{font-size:26px}` · `.tag{padding:2px 8px;border:1px solid var(--ce-color-text-primary);font-size:12px;letter-spacing:.06em;text-transform:uppercase}` |
| C | **Staff state section**: `section.st[aria-labelledby]` > `header` > `p#id` (title + `small` note) + `div.st-body`; inner `.panel`; notes `.annot` | Adm01Estados (6), Adm02Estados (7), Adm03Estados (7), Adm02TabletaEstados (2; `header` > `h2` + `p`) · **4 boards, 22 frames** | «Escenario» written in the title text («State 4 · Locked fields · «Escenario»»). Adm02Estados defines an unused dashed `.frame`; Adm02TabletaEstados defines an unused `.frame-label` and uses an inverse `span.tag` (2) | `.st{display:grid;align-content:start;border:1px solid var(--ce-color-border-default)}` · `.st > header{padding:10px 16px;background:var(--ce-color-surface-subtle);border-bottom:1px solid var(--ce-color-border-default)}` (`12px 16px` tablet) · `.st > header p{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}` · `.st > header small{display:block;margin-top:2px;font-size:12px;font-weight:400;color:var(--ce-color-text-secondary)}` · `.st-body{padding:16px;display:grid;gap:16px}` · `.annot{margin-top:40px;padding:20px 24px;border:1px solid var(--ce-color-border-default);background:var(--ce-color-surface-subtle)}` (tablet: `border-top:2px solid var(--ce-color-text-primary)`) · `.tag{padding:2px 8px;background:var(--ce-color-surface-inverse);color:var(--ce-color-text-inverse);font-size:var(--ce-font-size-xs);font-weight:var(--ce-font-weight-bold)}` |
| D | **Dashed variant box with inverse tag**: `section.var[aria-label]` (Adm07, 13, 14, 15, 16, 17) or `section.var[aria-labelledby]` → `span.vt#id` (Adm10, 11); `span.vt` first child; notes `.dn` | Adm07Estados (9), Adm10Estados (9), Adm11Estados (7), Adm13Estados (8), Adm14Estados (9), Adm15Estados (13), Adm16Estados (10), Adm17Estados (8) · **8 boards, 73 frames** | the tag is the whole label; the note is a `p.note` inside the box. Inner panels per board (`.sc`, `.card`, `.met`, `.res`, `.proj`, `.pv`: 1px solid border on canvas) | `.var{display:grid;gap:12px;align-content:start;min-width:0;padding:16px;border:1px dashed var(--ce-color-border-control)}` · `.vt{display:inline-block;justify-self:start;padding:2px 8px;background:var(--ce-color-surface-inverse);color:var(--ce-color-text-inverse);font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}` · `.stack{gap:24px}` · `.dn{padding:20px 24px;border-top:2px solid var(--ce-color-text-primary);background:var(--ce-color-surface-subtle);font-size:13px;line-height:1.5}` · `.note{font-size:14px;color:var(--ce-color-text-secondary)}` |
| E | **Ruled state block**: `article.st[aria-labelledby]` > `div.st-h` (`h3`) + `p.an-note` + `div.st-b`; sheet head `.an-eyebrow`, `.an-title`, `.an-lead`; notes `.an-block`; sheet-level cue strip `.cue` | Pub09Estados (8), Pub18Estados (7) · **2 boards, 15 frames** | no box around the state in Pub09 (`.st-b{gap:0}`); a box in Pub18. Both define the inverse `.an-label` (`span{color:#dddddd}`) and do not use it | `.st{display:grid;gap:12px;padding-top:16px;border-top:2px solid var(--ce-color-text-primary)}` · `.st-h h3{font-size:18px;letter-spacing:-.01em}` · `.an-note{font-size:13px;line-height:1.5;color:var(--ce-color-text-secondary)}` · Pub18 `.st-b{border:1px solid var(--ce-color-border-default);padding:24px;gap:20px}` · `.an-title{font-size:22px;line-height:1.25;letter-spacing:-.02em}` · `.an-block{padding:32px 48px 48px;border-top:1px solid var(--ce-color-border-default)}` · `.cue{padding:8px 0;background:var(--ce-color-surface-subtle);border-bottom:1px solid var(--ce-color-border-default);font-size:12px;line-height:1.4}` |
| F | **Full-width label band**: `div.an-label` (`strong` + `span`) followed by a full-width page region `section.ce-container[aria-label]`; same sheet head, notes and cue strip as E | Pub03Estados (5), Pub03EstadosMovil (4), Pub05Estados (5), Pub05EstadosMovil (7) · **4 boards, 21 bands**; also Pub20Largos (1, counted in J) | no frame box: the band sits between page replicas. The 48px band padding is kept on the 390px boards (not rendered here). Pub05EstadosMovil marks three regions with `data-frame` | `.an-label{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 16px;padding:10px 48px;background:var(--ce-color-surface-subtle);color:var(--ce-color-text-primary);border-top:4px solid var(--ce-color-surface-inverse);border-bottom:1px solid var(--ce-color-border-default);font-size:12px;line-height:1.4}` · `.an-label strong{font-size:12px;letter-spacing:.08em;text-transform:uppercase}` · `.an-label span{color:var(--ce-color-text-secondary)}` |
| G | **Numbered caption panel**: `div.bd-panel` > `span.bd-step[aria-hidden]` (1, 2, 3…) + `h3.bd-cap-title` [+ `span.ce-badge` «Escenario»] + `p.bd-cap-note`, then `section.bd-frame.bd-frame--pad[aria-label]`; sheet head `.bd-band`, `.bd-eyebrow`; notes `.bd-notes` | Pub04Estados (7), Pub06Estados (10 frames in 11 panels) · **2 boards, 17 frames** | the only variant whose «Escenario» mark is a CE Theme element (`ce-badge`); the marker is a number. Pub06 adds `.bd-quiet{border-color:transparent}` on 9 inner elements | `.bd-frame{border:1px solid var(--ce-color-border-default);background:var(--ce-color-surface-canvas);min-width:0}` · `.bd-frame--pad{padding:24px}` · `.bd-step{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:999px;background:var(--ce-color-surface-inverse);color:var(--ce-color-text-inverse);font-size:13px;font-weight:700}` · `.bd-cap-title{font-size:15px;font-weight:700;line-height:1.3;padding-top:3px}` · `.bd-panel{display:grid;gap:12px}` · `.bd-band{background:var(--ce-color-surface-subtle);border-bottom:1px solid var(--ce-color-border-default);padding-block:28px 24px}` · `.bd-notes{margin-top:64px;padding:24px 28px;background:var(--ce-color-surface-subtle);border-left:4px solid var(--ce-color-text-primary)}` |
| H | **Pill-numbered section**: `section.sframe[aria-labelledby]` > `header` (`span.ce-pill.ce-pill--info` "State 2" + `h3#id`) + `p.an-note` + `div.sbody[style="padding: 0;"]` | Pub02Estados (4) · **1 board, 4 frames** | the marker is the CE Theme info pill; every body carries the inline `padding: 0`. Also `.strip` (dashed, 5), `.dnote` (2px dashed, 1) and `.mini-home{zoom:.43}` (a non-standard property, 1) | `.sframe{display:grid;gap:12px}` · `.sframe > header{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 16px}` · `.sframe > header h3{font-size:20px;letter-spacing:-.02em}` · `.sbody{display:block;border:1px solid var(--ce-color-border-default)}` |
| I | **Captioned page replica**: `figure.fig` > `figcaption` (`strong` "A1 · Unknown route (404)" + text) + `div.frame` (page replica with its own header `.fh`) > `section.stt[aria-label]`; groups `section[aria-labelledby]` > `h2.grp` | Pub20Estados (14) · **1 board, 14 frames** | the label is a caption, not a heading; the frame has no header strip | `.frame{box-sizing:border-box;border:1px solid var(--ce-color-border-control);background:var(--ce-color-surface-canvas);display:grid;grid-template-rows:auto 1fr}` · `.fig{display:grid;gap:8px}` · `.fig figcaption{font-size:13px;line-height:1.45;color:var(--ce-color-text-secondary)}` · `.fig figcaption strong{display:block;font-size:15px;color:var(--ce-color-text-primary)}` · `.stt{display:grid;gap:16px;justify-items:start;max-width:520px;padding:36px 24px 40px}` · `.grp{font-size:22px;letter-spacing:-.02em}` |
| J | **Long-string case**: `div.lg-case-h` (`span.lg-step[aria-hidden]` a, b, c + `h2.t` + `p`) ; `p.lg-tag` ("Rule drawn", "1440 · real width of the region", "390 · phone width", "What this case proves"); `div.lg-frame[data-frame]` > `p.lg-cue[role="note"]` + content; `div.lg-row` > `div.ph` (390px frame); one `div.an-label` | Pub20Largos: 4 `lg-frame` + 4 `.ph` · **1 board, 8 frames**, 13 labels, 8 cues | the border is drawn as a box shadow; every frame has its own cue (`.lg-frame > .lg-cue{margin:-24px -24px 24px}`) | `.lg-frame{padding:24px;box-shadow:0 0 0 1px var(--ce-color-border-default);background:var(--ce-color-surface-canvas)}` · `.ph{width:390px;padding:16px;box-shadow:0 0 0 1px var(--ce-color-border-default)}` · `.lg-step{min-width:28px;min-height:28px;padding:0 6px;border-radius:999px;background:var(--ce-color-surface-inverse);color:var(--ce-color-text-inverse);font-size:13px;font-weight:700}` · `.lg-tag{margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--ce-color-text-secondary)}` · `.lg-case-h{grid-template-columns:28px minmax(0,1fr);gap:2px 12px}`, `.lg-case-h .t{font-size:18px;line-height:1.3}` · `.lg-cue{padding:8px 16px;background:var(--ce-color-surface-subtle);border-bottom:1px solid var(--ce-color-border-default);font-size:12px;line-height:1.4;font-weight:700}` |
| K | **Scenario card**: `article.sc[aria-labelledby]`; board label `p.board-tag`; notes `.annot` (tablet style) | Adm06Estados (8) · **1 board, 8 frames** | the only sheet whose board label is a dashed outline tag; the tag uses token font sizes | `.sc{display:grid;gap:12px;align-content:start;padding:16px;border:1px solid var(--ce-color-border-default);background:var(--ce-color-surface-canvas)}` · `.board-tag{display:inline-block;padding:2px 8px;border:1px dashed var(--ce-color-border-control);color:var(--ce-color-text-secondary);font-size:var(--ce-font-size-xs);font-weight:var(--ce-font-weight-bold);letter-spacing:.06em;text-transform:uppercase}` |

Totals [S]: 37 boards, 261 frames, 12 variants (A, B, B-m, C, D, E, F, G, H, I, J, K). Variant D alone holds 73 frames on 8 staff sheets; Variant A holds the cart and checkout families. Boards that define a variant's rules without using them: Pub14EstadosMovil, Pub15EstadosMovil and Pub17EstadosMovil (Variant B rules), Adm02Estados (`.frame`), Adm02TabletaEstados (`.frame-label`), Pub02Estados, Pub09Estados, Pub18Estados and Pub20Estados (inverse `.an-label`).

### 2.2 What differs, in one place

| Aspect | Values found (variants) |
|---|---|
| Frame container element | `section` (A, B, B-m, C, D, G, H), `article` (E, K), `figure` (I), `div` (J) |
| Accessible name of the frame | `aria-labelledby` → the label (A, C, E, H, K, and Adm10/11 in D); `aria-label` written in English (B-m, D, G, I); none (B: the label is a `div`) |
| Label element | `h2` or `h3` with a `p` note (A, E, G, H, C-tablet); `p` + `small` (C); `div` + `span` (B, B-m, F); `span` tag only (D); `figcaption` + `strong` (I); `p.lg-tag` + `h2` (J) |
| Marker | 28px ink circle with a letter A–H (A, 29) or a number (G, 17); 28px ink pill with a, b, c (J, 4); `ce-pill--info` "State n" (H, 4); inverse rectangular tag (D, 73; C-tablet, 2); no marker, uppercase text label (B, B-m, C, F, I, K) |
| «Escenario» mark | `span.ce-badge` (G, Pub06Estados); `span.scn` outline tag (A, Pub10EstadosMovil); in the title text (C, Adm02Estados); only in the annotation (others). CANON R-03 asks for it "in the frame label" |
| Frame border | `1px solid --ce-color-border-default` (A, C, G, H, K, E-Pub18); `1px solid --ce-color-border-control` (B, I); `1px dashed --ce-color-border-control` (D); `box-shadow 0 0 0 1px` (J); 2px or 4px top rule, no box (E, B-m, F) |
| Frame background | `--ce-color-surface-canvas` (B, G, I, J, K); raw `#fff` (A); none (C, D, E, F, H) |
| Label strip background | `--ce-color-surface-subtle` with a 1px bottom border (A, B, B-m, C, F); none (D, E, G, H, I, J) |
| Label type | 12px bold uppercase with letter-spacing .06em (B, B-m, K), .08em (C, D, F), .1em (A boardlabel, J); 15px (G, I), 16px (A), 18px (E, J), 20px (H) titles |
| Note type | 12px (C), 13px (A, E, G, I, J), 14px (D) secondary; line-height 1.4, 1.45 or 1.5 |
| Body padding | 24px (A, B, G, I-ish 36/24, J), 16px (C, D, K, B-m, J phone), 0 (H, E-Pub09) |
| Sheet grid | 2 columns, 32px gap (A, B); 24px (C `.grid2`); single column stacks (D, B-m) |
| Notes block | subtle ground with a 1px top rule (A), 2px dashed top rule (B), 1px box (C), 2px solid top rule (C-tablet, D, K), 4px left rule (G), 1px top rule (E, F) |
| Raw colours | `#fff` (A: frame ground and marker text; also `body`), `#dddddd` (unused inverse `.an-label span` in 4 boards). All other colours are `--ce-color-*` tokens |
| Raw sizes | every padding, gap, radius, font size, letter-spacing and line-height is a raw value except the `--ce-font-size-xs` and `--ce-font-weight-bold` of the K and C-tablet tags |

**Relation to the cue** [S] (CR-03 decision 4): Variant A, J and the phone sheets of B-m put the cue in every frame (Pub10Estados 7 cues for 6 frames, Pub20Largos 8, Pub14EstadosMovil 9, Pub15EstadosMovil 8, Pub17EstadosMovil 6, Pub20Estados 10, Pub05EstadosMovil 7). Variants B, C, D, G, K and the desktop E and F sheets carry one cue for the whole sheet (1 occurrence each), in two shapes: the bordered `demo-cue` block or the quiet `.cue` strip (12px on the subtle ground, Variants E, F, H, I). The strip is a third shape of the cue that CR-03 did not count as such.

## 3. Current state in CE Theme

**Missing as a pattern; its pieces exist.** `components/bundle.css` was searched in full for a documentation frame or state-frame pattern: none. The words "caption" and "sheet" do match four unrelated rules, all of them product or print patterns, not documentation chrome: `.ce-detail-inset figcaption` (line 189), `.ce-media figcaption` (line 387), `.ce-attachment-caption` (line 964) and `.ce-label-sheet` (line 1092, the A4 label sheet). `names.md` has no entry for a documentation frame; its registry sections are Producto, Precios, Superficies, Fotos, Tienda, Salidas, Interfaz, Retroalimentación, Navegación and Mensajería [A]. `coverage.md` lists no documentation pattern; its statuses describe recipes rendered by the reference site and the applications [A].

Nearest existing pieces [A]:

| Need | Nearest recipe | Gap |
|---|---|---|
| 28px ink marker with a letter or number | `.ce-steps > [aria-current="step"]::before` (28px, `--ce-radius-pill`, `--ce-color-text-inverse` on `--ce-color-surface-inverse`, bold; `bundle.css` lines 646-652) and the 28px `ce-pin` dot (README) | The step marker is a `::before` of a list item inside a horizontal stepper with connectors; it cannot sit alone in a frame header. The 28px is a raw value in the bundle too |
| Uppercase 12px label | `.ce-eyebrow` (`--ce-font-size-xs`, bold, `.1em`, uppercase; line 402); `.ce-type-eyebrow` in `tokens.css` | Exists; the boards only use it in Pub20Estados and in the B-variant notes. The frame label can reuse it as is |
| Title and one-line note | `.ce-section-head` (`h2` at `--ce-font-size-title`, `p` secondary at `--ce-font-size-sm`, 60ch; line 397-399); `.ce-page-header` (line 824-825) | Both are page-level heads with `margin-bottom: var(--ce-space-24)`; the section head's `h2` is 24px (`--ce-font-size-title`) below 1024px and `1.75rem` (28px) from 1024px (line 757), the page header's title is 24px; the frame needs a 16px title and no outer margin |
| Bordered box with a subtle header strip | `.ce-table-wrap` (thin border, line 844); `.ce-record-header` (bottom rule, line 827); `.ce-form-section` (bottom rule, line 867); `.ce-locked` (subtle ground, line 875) | None combines a thin box with a header strip on the subtle ground |
| «Escenario» mark | `.ce-badge` (line 38: ink ground, `--ce-font-size-xs`, bold) | Exists; Pub06Estados already uses it. Nothing to add |
| "State n" marker | `.ce-pill--info` (line 832-837) | Exists (Variant H). A status pill for a documentation index is a borrowed meaning: the pill's `::before` dot says "status" |
| Sheet-level cue strip | none; CR-03 proposes the block cue | The quiet strip of Variants E, F, H, I is not covered by CR-03 (section 2.2) |

Where the design system keeps its own documentation chrome [A, and the repository checkout read outside the artifact]: the showcase stylesheet `site/styles/site.css` defines `.demo-row`, `.demo-fields`, `.demo-prices`, `.demo-label` (lines 137-141) and `.demo-notice`, `.demo-notice-inner` (lines 236-237). Their spacing, colour and type declarations use tokens; one declaration does not (`.demo-prices .ce-price { font-size: clamp(40px, 5vw, 64px) }`, line 140, a responsive price scale for the price specimens), so the precedent is for the separation, not for token purity. They are **not** recipes: they are not in `recipes/*.css`, not in `bundle.css` and not in `names.md`. `docs/workflow.md`: "The showcase renders, it does not copy" and "Recipes first, components second. A component renders recipe classes". `docs/design-system.md`: the artifact's `components/<Name>/README.md` and `preview.html` are "authored in `design-system/`" and previews "are static markup styled by `bundle.css`". So the repository already separates what consumers render (recipes) from what documents them (site and design-system chrome).

## 4. Proposed change

### 4.1 One recipe: `ce-state-frame`

As implemented, the rule lives in `design-system/doc-kit/state-frame.css`, which is the source to copy. It differs from the block below in the marker's sizing and in the body's layout (section 6, “Implemented with the kit”).

Standard name: `StateFrame` («Marco de estado»), accepted (X-8) for the documentation kit's frame (X-4): "The documentation frame around one state of a page: a marker, a title, a one-line note and the page fragment." The frame is documentation chrome. No consumer application renders it, so it never carries a product, a price or a control of its own.

```html
<section class="ce-state-frame" aria-labelledby="st-b">
  <header class="ce-state-frame-label">
    <span class="ce-state-frame-mark" aria-hidden="true">B</span>
    <div lang="en">                                          <!-- English documentation label on a lang="es" page: X-7 -->
      <h2 class="ce-state-frame-title" id="st-b">Store change pending <span class="ce-badge" lang="es">Escenario</span></h2>
      <p class="ce-state-frame-note">Old amounts removed; lines kept; <span lang="es">«Actualizando»</span> replaces the link.</p>
    </div>
  </header>
  <div class="ce-state-frame-body">
    <p class="ce-demo-cue" role="note">Demostración — datos y operaciones simulados</p>   <!-- CR-03; see section 9 -->
    …the page fragment, built from the ordinary recipes…
  </div>
</section>
```

```css
.ce-state-frame { display: grid; align-content: start; min-width: 0;
  border: var(--ce-stroke-thin) solid var(--ce-color-border-default);
  background: var(--ce-color-surface-canvas); }
.ce-state-frame--wide { grid-column: 1 / -1; }
.ce-state-frame--band { border: 0; }                      /* label band over a full-width page replica (Variants F, I) or a phone section without a box (B-m) */
.ce-state-frame--band > .ce-state-frame-label { border-top: var(--ce-stroke-heavy) solid var(--ce-color-surface-inverse); }   /* the 4px rule of B-m and F stays: stroke.heavy, X-2 */

.ce-state-frame-label { display: flex; align-items: flex-start; gap: var(--ce-space-12);
  padding: var(--ce-space-12) var(--ce-space-16);
  background: var(--ce-color-surface-subtle);
  border-bottom: var(--ce-stroke-thin) solid var(--ce-color-border-default); }
.ce-state-frame-label > div { min-width: 0; }

.ce-state-frame-mark { flex: none; display: grid; place-items: center;
  width: var(--ce-size-marker); height: var(--ce-size-marker);   /* 28px: size.marker, X-2; see 4.2 */
  border-radius: var(--ce-radius-pill);
  background: var(--ce-color-surface-inverse); color: var(--ce-color-text-inverse);
  font-size: var(--ce-font-size-sm); font-weight: var(--ce-font-weight-bold); }

.ce-state-frame-title { margin: 0; font-size: var(--ce-font-size-body);
  line-height: var(--ce-font-line-heading); font-weight: var(--ce-font-weight-bold); }
.ce-state-frame-title .ce-badge { vertical-align: middle; margin-left: var(--ce-space-8); }

.ce-state-frame-note { margin: var(--ce-space-2) 0 0; color: var(--ce-color-text-secondary);
  font-size: var(--ce-font-size-sm); line-height: var(--ce-font-line-body); }

.ce-state-frame-body { display: grid; align-content: start; gap: var(--ce-space-16); min-width: 0;
  padding: var(--ce-space-24); }
.ce-state-frame-body > .ce-demo-cue { justify-self: start; max-width: 100%; }
@media (max-width: 639.98px) {                            /* the bundle's own literal breakpoint; a media query cannot read a token */
  .ce-state-frame-body { padding: var(--ce-space-16); }
  .ce-state-frame { border-inline: 0; } }
```

Rules of use (documentation, not CSS):

- One `ce-state-frame` per state. Two separate requirements: (a) structure: the title is a heading (`h2` on a sheet with one `h1`, `h3` inside a group), so Variants B, C, D, F and I, whose labels are a `div`, a `p`, a `span` tag or a `figcaption`, gain a heading; (b) name: every frame has `aria-labelledby` pointing at its title, or `aria-label`. Today only Variant B frames lack a name (their `section` has neither attribute); Variants C and D are already named through `aria-labelledby` on a `p` or a `span`, or through `aria-label`, which is valid naming without being a heading.
- The marker is a letter (reading order A, B, C) or a number; it is decorative (`aria-hidden="true"`) because the title carries the name. The text inside the marker is one or two characters.
- «Escenario» is the existing `ce-badge` inside the title (CANON R-03 "in the frame label"), never a colour and never only in the annotation. On a `lang="es"` page the English label carries `lang="en"` and the Spanish badge (and any Spanish string quoted in the note) carries `lang="es"` (X-7).
- The body starts with the demonstration cue when the fragment shows commercial or staff data (CR-03). The frame does not restyle anything inside the body: the page fragment uses the ordinary recipes at their real size.
- Sheet grid, sheet head, notes block and the board strip are **not** part of this recipe: they stay in the sheet (owner decision 5 records the option of a second kit class for them).

### 4.2 Tokens, and where a value has no token

| Board value | Recipe value | Status |
|---|---|---|
| Frame border 1px solid, `border-default` or `border-control` or dashed or shadow | `--ce-stroke-thin` solid `--ce-color-border-default` | Token; the `border-control` boxes (B, I) become 1px lighter, the dashed boxes (D) become solid |
| Frame ground `#fff` (A) | `--ce-color-surface-canvas` | Token; raw colour removed |
| Marker 28px, `#fff` text (A) | `--ce-size-marker` (28px); `--ce-color-text-inverse` | Token: `size.marker` is added (X-2, decided 2026-11-06). Raw colour removed. The raw 28px that `ce-steps` and `ce-pin` already use is not changed by this request |
| Marker text 13px | `--ce-font-size-sm` (14px) | Token; 1px larger |
| Label padding 16px 24px / 12px 16px / 10px 16px | `--ce-space-12` `--ce-space-16` | Token; the A desktop header loses 4px top and 8px side padding |
| Label ground, bottom border | `--ce-color-surface-subtle`, `--ce-stroke-thin` `--ce-color-border-default` | Token |
| 4px top rule (B-m, F) | `--ce-stroke-heavy` top rule on the band label (`ce-state-frame--band`) | Token: `stroke.heavy` is added (X-2, decided 2026-11-06); the 4px rule stays |
| 2px top rule (E) | dropped | Not part of the recipe; X-2 adds no 2px stroke token for it |
| Title 16px / 1.3 / letter-spacing -.01em | `--ce-font-size-body`, `--ce-font-line-heading` (1.2) | Token; **letter-spacing has no token** and is dropped (the bundle's own `-.02em` values are raw too) |
| Note 13px / 1.4 secondary | `--ce-font-size-sm` (14px), `--ce-font-line-body` (1.5) | Token; 1px larger, slightly taller; **there is no 13px token** |
| Note offset 2px | `--ce-space-2` | Token |
| Body padding 24px / 16px, gap 20px or 16px | `--ce-space-24` / `--ce-space-16`, gap `--ce-space-16` | Token; the A bodies lose 4px of gap |
| Pill radius 999px | `--ce-radius-pill` | Token |
| Uppercase 12px labels with .06em / .08em / .1em | not in the recipe; a sheet that wants an uppercase label uses `ce-eyebrow` (.1em) | Token through the existing recipe |
| Inverse rectangular tag (D `vt`, C-tablet `tag`) | not proposed; the marker replaces it | The 73 D frames change from a tag to a marker plus a title (owner decision 4) |
| `ce-pill--info` "State n" (H) | not proposed; the marker replaces it | Removes the borrowed status meaning |

No new raw value enters: the 28px marker and the 4px rule are tokens (X-2). The breakpoint `639.98px` is the bundle's own literal.

### 4.3 Recommendation: where state sheets belong

**Decided (X-4, 2026-11-06): a documentation kit beside CE Theme, not the recipe bundle.** Concretely: one stylesheet (`ce-state-frame` and, if j3w1 wants, the sheet grid and notes classes) that loads after `components/bundle.css`, uses only `tokens.css`, and is distributed with the design-system bundle or with the workbench templates. Reasons:

1. No consumer renders a frame. `decisions.md` (2026-10-23 "Scope") makes CE Theme "the canonical specification for the Casa Elida ecosystem" that "defines presentation of verified data"; `workflow.md` moves recipes to Vue components that applications install by version. A state frame would be a recipe nobody imports.
2. The repository already keeps documentation chrome out of the recipes (`site/styles/site.css` `.demo-*`, section 3). Putting the frame in `bundle.css` would break that separation; putting it in a kit follows it.
3. The names rule would force a card in CE Theme. `names.md`: "New pattern, new name. Add the entry to `recipes/names.mjs` and this page in the same change as its recipe, and give it a card in the design system." A card for the frame that frames cards adds noise to the registry that CE Meta and CE Radio read. The accepted name `StateFrame` (X-8) therefore belongs to the kit's own documentation; where the registry mentions it is settled in the implementation pull request.
4. The need is real and shared: 12 variants on 37 boards, and the next sheet author will invent a thirteenth. A kit gives one source without widening the shared system.
5. It keeps CR-03 coherent: X-4 puts the cue in CE Theme and the frame in the kit, so the kit depends on the bundle in one direction only (section 9).

Not taken (X-4): adopting `ce-state-frame` in `recipes/workspace.css` with a `StateFrame` registry entry and a design-system card.

## 5. Accessibility and invariants it must keep

| Invariant | Applies? |
|---|---|
| One document-level title per sheet; frames reproduce a page heading inside (CANON R-16) | Yes: the frame title is an `h2` (or `h3` in a group) and names the `section`; the page fragment inside the body keeps its own heading, which is the recorded exception. The recipe adds no heading level of its own |
| «Escenario» in the frame label (CANON R-03) | Yes: `ce-badge` inside the title; the badge is words, not a colour |
| Status never by colour alone | Yes: the marker is decorative and the title carries the name; the frame itself expresses no state |
| Demonstration cue on every commercial or staff frame (CANON section B; CR-03) | Yes: the cue is the first child of the body of every frame whose fragment shows simulated commercial or staff data; a sheet-level cue may be added but does not replace it. Only frames with no simulated data (route shells, documentation fragments) omit it. The recipe positions the cue; the author of the sheet must place it (acceptance check 2b) |
| Contrast | Marker: `--ce-color-text-inverse` on `--ce-color-surface-inverse` (the CECode and badge pair, validated in `ce-theme.json` per `coverage.md`); note: `--ce-color-text-secondary` on `--ce-color-surface-subtle` (the same pair as `ce-section-head p` on a subtle band); not recomputed here |
| Focus ring, 44px targets | Not applicable: the frame chrome has no control. Controls inside the fragment keep the ordinary rules |
| NAME / Description / specs 2px / 2px / 12px, one-line CE code, supplied decimal-string prices | Not touched: the body does not restyle the fragment. A frame must never scale or zoom its fragment (Pub02Estados `.mini-home{zoom:.43}` would be retired) |
| Text at x1.5 and x2 without overflow | Must hold: the label wraps (`min-width: 0` on the text column), the marker is fixed, the body is a grid with `min-width: 0` |
| Language | The frame label is English (documentation); the fragment is Spanish UI. The boards write labels in English today; `lang="en"` goes on the label when the page is `lang="es"`, and the «Escenario» badge keeps `lang="es"` (X-7, decided 2026-11-06) |
| Reduced motion | Not applicable: no motion |

## 6. Acceptance checks

Run here [S]: the inventory of sections 2.1 and 2.2 (static scan of the 37 files; class tokens, selectors, inline styles, cue and «Escenario» occurrences); `bundle.css`, `names.md`, `coverage.md`, `decisions.md`, `tokens.css` searched for existing pieces.
Not run here: no board was rendered, no distance was measured, no contrast was recomputed.
To run when the kit or repository work happens:
1. Render, in a scratch harness (the frozen boards are not rebuilt: X-3), one sheet per variant family (Pub10Estados, Pub13Estados, Pub14EstadosMovil, Adm01Estados, Adm15Estados, Pub09Estados, Pub03Estados, Pub06Estados, Pub02Estados, Pub20Estados, Pub20Largos, Adm06Estados) rebuilt on the recipe at 390, 768, 1440 and text x1.5, x2: no overflow, the label wraps, the marker stays 28px, the fragment inside is pixel-identical to its standalone board.
2. Axe on a rebuilt sheet: every `section.ce-state-frame` has an accessible name; heading order is one `h1` then frame headings; no empty `style=""` attributes remain (Variant B has 51).
2b. Cue presence (static, per frame): every `ce-state-frame` whose body shows simulated commercial or staff data (a price, an amount, an availability line, an order, a case, a store or staff record) contains the exact string «Demostración — datos y operaciones simulados» inside its own `ce-state-frame-body`. A cue outside the frame (a sheet-level strip or block) does not satisfy the check for that frame. Frames with no simulated data (route shells, documentation fragments) are listed by name in the sheet's notes as exempt; any other frame without the string fails.
3. A test that the kit stylesheet contains no raw colour and no raw size in a declaration (the 28px marker and the 4px rule are tokens: X-2); media-query constants are layout queries, not declarations, and the bundle's own `639.98px` breakpoint is the one permitted query value.
4. A test that the kit loads after `bundle.css` and overrides nothing in it (no selector in the kit targets a `ce-` class other than its own and `.ce-demo-cue`, `.ce-badge`).
5. Measured heights of the scratch-rebuilt sheets against the frozen boards' `$preview` values (a comparison only; no board is changed; the label is 4 to 8px shorter than Variant A and 1 to 2px taller than Variants B and C; the sum per sheet is **to measure**).
6. Screen-reader reading of a sheet (marker skipped, title read, badge read as a word): **not run, to schedule**.

Implemented with the kit:

- **Checks 2b, 3 and 4** are `tests/state-frame.test.mjs`:
  - every declaration holds only `--ce-` tokens and CSS keywords, and the one media query is the bundle's `639.98px`;
  - every selector starts from a kit class and reaches only kit classes, `.ce-demo-cue` and `.ce-badge`;
  - the kit is absent from the recipe sources, `exports/recipes.css`, `bundle.css`, the `@casaelida/vue` styles, the registry and the Components view;
  - every shipped frame is named by a heading title, with a decorative marker of one or two characters, an English label, no inline style on the kit's own elements and no empty `style` attribute anywhere in a frame (a fragment keeps the consumer inputs its recipes document);
  - every frame starts its body with the canon cue, unless the sheet's notes name it as exempt;
  - sheets link the kit after the bundle.
- **Checks 1 and 2** are `tests/browser/state-frame.spec.mjs`, run on a synthetic sheet, `tests/fixtures/state-frame-sheet.html`. Its nine frames cover a lettered card, the «Escenario» badge, a route shell exempt from the cue, a staff record, a two-character marker on a wide frame, a wide table of codes that stay on one line (ending in a link whose name ends in a clipped `ce-sr-only` label), the band, and frames inside a group. The sheet is tested at 390, 768 and 1440 px with text at 100%, 150% and 200%. Text is enlarged the way a reader's text-size setting does it: every font size grows, including px sizes such as the 28px cart price, and so does the root size. The test checks:
  - no overflow, and the label wraps;
  - the marker stays `size.marker` tall, is `size.marker` wide unless its characters and inline padding need more, and keeps its characters' ink inside it horizontally and vertically. This is checked with the sheet's own markers (A to E, 1, 2, 10), which are 28px circles at 100% text, and with wider valid markers on the same frames (W, M, WW, MW, 88, H, A1, 20; for example WW is 38px wide at 100% text and 66px at 200%);
  - each fragment, copied into a page that loads only the tokens and the bundle at the same place and width, draws the same pixels and keeps every element box (to 0.02px) as in the frame;
  - axe finds no violations, the sheet has one `h1`, frames are named by their titles in heading order, and labels and badges carry their `lang`;
  - every frame with simulated data carries its own cue;
  - a fragment wider than its body scrolls inside it, with no page or frame overflow. The body is reached with Tab and shows its focus ring inside its edge. It scrolls to its end with the arrow keys, a wheel and a touch pan. Tab continues into the fragment's link, whose ring stays inside the scrollport, and then out. Removing the body's `position: relative` makes 14 of these tests fail on their unchanged page assertions, because the link's clipped label then widens the page.

  A further test loads every design-system component card with and without the kit after the bundle and finds every computed style and box unchanged.
- **Check 5 and the private part of check 1** were measured in a scratch harness on the twelve frozen boards of check 1.
  - **Method.** The boards were read-only, in Chromium with `--font-render-hinting=none`. The evidence, kept outside the repository, holds the harness, every number and the mapping of each variant onto the kit.
  - **Bundle.** The boards' copy of the bundle predates `size.marker`, `stroke.heavy` and `ce-demo-cue`, so the harness added those two tokens and the cue rule before the kit.
  - **Frozen heights.** The frozen boards measure 2 to 7px under their stored `$preview` heights. The workbench stores the rounded natural height plus 2, and eleven stored values equal that; Adm06Estados is 4px above it.
  - **Rebuilt heights.** Rebuilt on the kit, with a first-body cue in every one of the 100 frames, the sheets change against the frozen measurement by:

    | Sheet (variant) | Height change |
    | --- | --- |
    | Pub10Estados (A) | −202px |
    | Pub13Estados (B) | +293px |
    | Pub14EstadosMovil (B-m) | +14px |
    | Adm01Estados (C) | +199px |
    | Adm15Estados (D) | +496px |
    | Pub09Estados (E) | +280px |
    | Pub03Estados (F) | +559px |
    | Pub06Estados (G) | +349px |
    | Pub02Estados (H) | +377px |
    | Pub20Estados (I) | +590px |
    | Pub20Largos (J) | +565px |
    | Adm06Estados (K) | +80px |

  - **Labels.** The label estimate in check 5 does not hold:
    - Variant A labels change by −4.0 to +17.0px; a note that wraps to a second line adds the gain.
    - Variant B labels grow by 28.2px each: their title and note shared one row, and the anatomy puts the note on its own line.
    - Variant C labels grow by 8.2 to 35.4px: 12px text becomes the 16px title and the 14px note.
    - Variant D labels grow by 31 to 129px: a 22px tag becomes a marker, a title and a note.

    The per-frame cues and the separate title and note account for most of the growth. This is a comparison only; the frozen boards stay as they are (X-3).
  - **At each board's stored width.** All twelve rebuilt sheets have no horizontal overflow, every marker is 28px tall, every frame is a named region, and axe reports no violations.
  - **Across 390, 768 and 1440 px with text at 100%, 150% and 200%** (108 cases, 900 fragment comparisons):
    - Text grows by the factor in every case.
    - No label, title or note overflows, and every marker is 28px tall with its characters inside it.
    - The selection box of a title's first line, at the heading line height of 1.2, starts up to 1px above the label's text column. That is Chromium's selection rectangle, not painted ink.
  - **Overflow on the boards' own sheet layout.** The kit's label, title, note and marker stay inside in every case. The pages and frames that overflowed did so equally with and without the kit:
    - **Page overflow, 55 of 108 cases.** Nine 1440px boards keep their 1440px page at 390 and 768 px, with 1050px and 672px of overflow, frozen and rebuilt alike. Pub06Estados at 390px with 200% text overflows by 5px frozen and 3px rebuilt.
    - **Frame overflow, 11 of 108 cases.** In each, the fragment is wider than the frame body and overflows a plain block of the same width by the same amount. In Pub06Estados at 390 and 768 px, the sheet's grid gives frame 1 a zero-width cell; the long-string phone replica of Pub20Largos (frame 4) overflows at 150% and 200% text.
  - **With a responsive sheet layer.** Each sheet's own grid, head and notes stay with the sheet (decision 5), so the harness gave each of the twelve sheets a responsive layer of its own, which changes no kit class or fragment.
    - Page overflow fell to 11 cases and frame overflow to 11 cases (29 frames).
    - Every remaining case was a fragment whose intrinsic width exceeds its body. For example, Pub20Largos frame 4 at 390px and 150% text has 358px and needs 369.5px: the cart-line image, its gap and a CE code that stays on one line.
    - No sheet-setup failure remained.
  - **The body scrolls (third correction).** With `overflow-x: auto` on the body, frame overflow fell to 0 in all 108 cases.
    - The 29 scrolling bodies, given `tabindex="0"`, `role="group"` and `aria-labelledby` to their title, scroll with the arrow keys to their native end and back.
    - Page overflow remained in the six Pub02Estados cases at 390 and 768 px (53px at 390px and 100% text). Six absolutely positioned `ce-sr-only` price labels caused it: their containing block lay outside the static body, so the body did not clip them.
  - **The body is positioned (fourth correction).** With `position: relative`, page and frame overflow are 0 in all 108 cases. Keyboard reach holds for all 29 scrolling bodies, axe reports no violations in 24 runs, and the Chrome DevTools Protocol finds no rule of the kit matching any of the 36,630 fragment elements audited.
    - Every fragment still keeps its intrinsic width; where that exceeds its body, the body scrolls.
    - At the native end, the rightmost box of seven scrolling bodies ends up to 0.39px past the scrollport, counting a board's own nested rails as clipping their content: the browser rounds the scroll range to whole pixels. Two of them were checked pixel by pixel, and no ink is lost in either. Pub02Estados frames 1 and 2 hold such rails, which scroll on their own and were not driven with keys.
  - **Fragment preservation, compared in the same rebuilt page** (900 fragment comparisons, with the kit's source at its final state). Each fragment is measured in its frame. It is then moved into a plain block that takes the frame's place, with the body's content width and the same board ancestors, and measured again.
    - Boxes are compared to 0.02px, and every standard computed property of every element and pseudo-element is compared (custom properties are not).
    - Pixels are compared on the same clip, each taken once two screenshots agree. A scrolling body is compared at its start and at its end, against the plain block's clip shifted by the scroll offset.
    - A difference only in the last captured pixel row, where the body's padding paints the canvas after the plain block has ended, counts when the plain block with 1px more bottom padding is byte-identical.
    - Two plain blocks were measured:

    | Plain block | Boxes | Computed styles | Pixels |
    | --- | --- | --- | --- |
    | Unpositioned, as before the fourth correction | 900/900 | 567/900 | 863/900 |
    | Positioned like the body: `position: relative`, the body's padding, a spacer reproducing the cue's height and margins, and its padding box at the body's place | 900/900 | 900/900 | 869/900 |

    - **Computed styles.** All 5,292 style differences against the unpositioned block are the `top`, `right`, `bottom` and `left` values (and their logical forms) of 837 clipped `ce-sr-only` boxes. They are resolved against the containing block: the positioned body here, the page there. The boxes do not move, and every difference disappears against the positioned block, whose containing block matches the body's to 0.02px in all 900 comparisons.
    - **26 of the 31 pixel comparisons not proved against the positioned block are fragments inside a body that scrolls.**
      - The same plain block with only `overflow-x: auto`, scrolled to the body's native offset, is byte-identical to the framed body in all 58 start and end windows of the 29 scrolling comparisons.
      - With the framed body's `overflow-x` set to `visible`, 28 of the 29 start windows are byte-identical; the remaining one differs in one pixel by one level, on a status pill's text.
      - The largest difference, 50,101 pixels in Pub02Estados frame 3 at 390px and 200% text, comes almost entirely from the comparison itself. The body's native end is 137px, while its integer scroll range is 138px. Shifted by the native 137px, the plain block still differs in 2 pixels, by up to 3 levels.
      - With geometry and computed styles equal, these observations support the explanation that the differences come from painting inside a scroll container rather than from a layout change. They do not prove a rendering mechanism, or that every residual difference comes from scrolling; both residuals above stay reported, and these comparisons are not counted as identical.
    - **Five comparisons stay unexplained** (Adm15Estados frames 3 and 6). They differed between screenshots of the same state in earlier runs, around a multiply-blended logo image and a disabled button, and are held unproved in every run.
    - An earlier comparison, against a separate page without the board's ancestors, differed in 253 of the 900 comparisons, and is superseded.
- **Check 1 is not met.** Its containment parts hold in all 108 cases: no page or frame overflow, and labels that wrap and stay inside. Its pixel-identity part holds in 869 of the 900 comparisons against the positioned block, and in 863 against the unpositioned block. The 26 scrolling comparisons are explained by the scroll-context diagnostics, which do not count as passes, and the five Adm15Estados comparisons remain unexplained. The repository lead recorded check 1 as unmet; this is no waiver and no change of the criterion.

The acceptance checks found four corrections to the rule in section 4.1. The repository lead accepted all four under the same standing delegation, not j3w1-typed, and j3w1 may veto them. Measured in Chromium with the supplied Inter files:

- **The marker.** As proposed (`width` and `height` 28px, with the inherited 1.5 line height), characters at 200% text leave the marker. Two characters measure 33.0 to 33.7px across the 28px circle. Every marker's ink also sits 3px below the circle, because a line box taller than the marker is start-aligned instead of centred. The kit uses `min-width: var(--ce-size-marker)`, `padding-inline: var(--ce-space-4)` and `line-height: var(--ce-font-line-tight)`. Every marker stays 28px tall. It is 28px wide while its characters and inline padding fit, which holds for single letters and numbers and for `10` at 100% text, and it widens into a pill whenever they need more, at any text size: `WW` is 38px wide at 100% text. Variant J's marker already behaved this way.
- **The body.** As proposed (`display: grid` with a 16px gap), a fragment does not lay out as it does on its own. A grid item shrink-wraps when its margins are `auto`: the `ce-empty` route shell is 370px wide in the frame and 420px on its own at 768 and 1440 px. A grid item also keeps its children's margins inside it: a staff record header fragment is 316.97px tall in the frame and 292.97px on its own. The kit's body is ordinary block flow (`display: flow-root`), and the cue keeps its 16px gap through `margin-block-end`.
- **A fragment wider than its body.** Some fragments are wider than any body at a given page width and text size: a code that stays on one line, a wide table, a rail, a phone replica. As proposed, such a fragment leaves its frame and the page. The kit's body scrolls it horizontally (`overflow-x: auto`), at its real size. A sheet gives such a body `tabindex="0"`, `role="group"` and `aria-labelledby` pointing at its title, and the kit draws the focus ring inside the body's edge.
- **Absolute boxes inside the fragment.** A static scrolling body does not clip an absolutely positioned descendant whose containing block lies outside it. In Pub02Estados, six clipped `ce-sr-only` price labels widened the page from 390px to 443px while every frame stayed contained. The kit's body is `position: relative`, so it is the containing block of those boxes. They scroll and clip with it, and their boxes and pixels do not change; only their resolved offsets refer to the body instead of the page.

Registry: `StateFrame` is named only in the kit's documentation (`design-system/doc-kit/README.md`); `recipes/names.mjs` and `names.md` do not list it.

Not run:

- check 6 (no screen reader was used): to schedule;
- WebKit locally (hosted CI runs it), and WebKit, other pixel densities and real devices on the twelve rebuilt boards;
- real devices;
- forced colours.

## 7. Risks and what it does not change

- **Scope creep into the shared system.** Avoided by X-4: the frame lives in the kit, so no documentation-only recipe or card enters the registry that applications read. The kit must stay downstream of the bundle (section 9).
- **Boards keep their twelve variants** as part of the frozen snapshot (X-3): the 37 sheets are not rebuilt, and new sheets use the kit frame. A rebuild would change heights and need the re-measure and re-audit routine of the handoff; Variant D (73 frames, 8 staff sheets) would change most visibly: a tag becomes a marker plus a title.
- **Lost detail.** Two things the variants express are not in the recipe: the dashed "variant" border (D, meaning "one of several variants of the same screen") and the number-versus-letter distinction (G numbers "steps", A letters "states"). The heavy 4px top rule (B-m, F) is kept (X-2). If either of the two carries meaning j3w1 wants kept, it needs a modifier and a decision.
- **The quiet cue strip** (Variants E, F, H, I) is neither this recipe nor CR-03's block cue. It is recorded here and left to CR-03 decision 3 (compact forms).
- **Not changed:** any recipe in `bundle.css`, `ce-badge`, `ce-pill`, `ce-steps`, `ce-eyebrow`, the sheet grid, sheet heads, notes blocks and board strips (they stay local), the executable prototypes (`Proto01Compra`, `Proto02Publicacion` are not state sheets), any board.
- **Not verified:** rendering of any variant; whether the 48px band padding of Variant F overflows at 390px; whether the inline `style=""` attributes of Variant B are generator artefacts (the generator is not in `tools/`).

## 8. Owner decisions needed

1. **Home:** Decided (X-4, 2026-11-06): the frame goes in a documentation kit beside CE Theme, not the recipe bundle; the name `StateFrame` is accepted (X-8).
2. Decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed ([issue #11 comment](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)): the anatomy is approved: a decorative marker, a heading title with the optional `ce-badge` «Escenario», a one-line note and the body; the frame is named by its title.
3. Marker size: Decided (X-2, 2026-11-06): the `size.marker` token (28px, `--ce-size-marker`) is added and the marker uses it; the 4px rule stays through the `stroke.heavy` token.
4. Decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed ([issue #11 comment](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)): new kit sheets retire the inverse rectangular tag in favour of the marker and title; no tag modifier is added. The frozen Variant D boards stay as they are.
5. Decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed ([issue #11 comment](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)): the sheet grid, sheet head and notes block stay with each sheet; the kit adds no class for them.
6. Decided (X-7, 2026-11-06): English frame labels carry `lang="en"` on Spanish pages.
7. Decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed ([issue #11 comment](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)): every frame showing simulated commercial or staff data carries its own cue, first in its body. A sheet-level cue is optional and never replaces it. A frame with no simulated data may omit it only when the sheet's notes name it as exempt, in the form `doc-kit/README.md` documents. The sheets that today carry one cue for the whole sheet (Variants B, C, D, G, K; section 2.2) stay as they are in the frozen snapshot (X-3).

## 9. Dependency on CR-03

- The frame body's first child is `ce-demo-cue` (CR-03). The rule `.ce-state-frame-body > .ce-demo-cue { justify-self: start; max-width: 100% }` repeats what Variant A does locally (`.frame-b>.demo-cue`). If CR-03 is not accepted, that rule and the markup line are removed and the frame has no opinion about the cue.
- The kit's frame depends on CE Theme's cue, never the reverse: a kit frame may reference a bundle cue, but a bundle frame must not reference a kit cue. X-4 puts the cue in CE Theme and the frame in the kit, so the kit sits downstream of the bundle and the frame references the cue, never the reverse.
- CR-03 decision 4 asks the owner to confirm the CANON reading (a cue in every frame with simulated commercial or staff data); the body rule then applies to every such frame. The inventory in section 2.2 (last paragraph) lists the sheets that today carry only a sheet-level cue and therefore need the per-frame cue added when rebuilt.
- CR-03 decision 3 (compact forms) should also consider the quiet 12px strip (`.cue`, `.lg-cue`) that four variants here use for the sheet-level cue; it is not in CR-03's table.
- Order of submission: CR-03 first (it defines the element this recipe positions), then CR-02. The README of this folder records the order.
- CR-03 is implemented (pull request [#17](https://github.com/j3w1/ce-theme/pull/17)), so the kit's body places the bundle's `ce-demo-cue` as its first child; the kit never defines a cue of its own.
