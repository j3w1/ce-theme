Status: Decided (section 8: the repository lead's selections, decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed; j3w1 can veto any of them). Implemented in CE Theme source by the CR-01 pull request; the frozen boards are not changed

# CR-01 · Admin navigation (`ce-module-nav`): one module list, density-aware targets

| | |
|---|---|
| Kind | Shared-pattern candidate: completion of an existing recipe (target size, current-page rule, reference composition) |
| CE Theme target | `ce-app`, `ce-app-bar`, `ce-module-nav`, `ce-app-main` (AppShell recipe, `bundle.css` lines 808-821); `components/AppShell/README.md` and `preview.html`; `names.md` (`ModuleNav`) |
| Depends on | Nothing |
| Checked against | CE Theme — Design System artifact version 1793881448-c98f (design-system.json: re-synced to `j3w1/ce-theme@e8b8d7a8`; `bundle.css` sha256 `de102fad7d927541e3c31c2c30dd770fa0d0fca3b4000a84a9e5bfcb7353ed06`) and the workbench boards of 5 November 2026. Evidence tags **[A] [S] [R] [H]** are explained in CR-08. |

## 1. Summary

CE Theme already has the module navigation. What the CE Systems boards add is one fixed composition of it (seven groups, seventeen links, icons, `aria-current="page"` on the page's own module, a full-screen-tool exception) and a target height that the recipe cannot express: the link height is a fixed 40px and ignores the density attribute, so the boards override it and the same shell renders 40, 44, 48 or 56px links depending on the board. The request: make the link height follow density, tighten the current-page selector, and publish the composition as the reference example.

## 2. Problem and evidence

**One navigation, applied everywhere** [S]: `templates/admin-nav.html` (CANON R-06: "Never edit `nav.ce-module-nav`. New admin boards copy `templates/admin-nav.html` and set `aria-current="page"` on their own module"). 66 admin boards carry the nav; all 66 are byte-identical to the template apart from `aria-current="page"`; 17 distinct current modules. The only admin board without it is `Etiquetar`, a full-screen tool frame that carries the back link «← Etiquetado» (`<a class="back" href="Adm05Etiquetado.dc.html">`). `Inventario` is rebuilt into the same shell.

Composition (`<nav class="ce-module-nav" aria-label="Módulos">`, group headings are `h2`, every link starts with an 18 x 18 inline SVG, `aria-hidden`, viewBox 24, stroke 1.7, round caps and joins):

| Group (`h2`) | Links (label, board) |
|---|---|
| Resumen | Resumen (ADM-01, Adm01Resumen) |
| Catálogo | Productos (ADM-02, Inventario) · Categorías (ADM-03) · Medios (ADM-04) · Etiquetado (ADM-05, Adm05Etiquetado) |
| Comercio | Precios por tienda (ADM-06, Adm06Precios) · Promociones (ADM-07) · Disponibilidad (ADM-08) |
| Sitio web | Contenido (ADM-09) · Publicaciones (ADM-10) |
| Operaciones | Pedidos (ADM-11) · Preparación (ADM-12) · Clientes (ADM-13) · Atención (ADM-14, Adm14Casos) · Tiendas y etiquetas (ADM-15, Adm15Tiendas) |
| Análisis | Informes (ADM-16) |
| Administración | Acceso y auditoría (ADM-17, Adm17Acceso) |

**The link height is not stable** [H][R][S]:
- Recipe [A][H]: `.ce-module-nav a { min-height: 40px }` (`bundle.css` line 816). Measured in the scratch harness: 40px with no density attribute, 40px with `data-ce-density="compact"` (control 36px) and 40px with `data-ce-density="touch"` (control 56px). The density rules (lines 801-805) reach buttons, icon buttons, chips, inputs and selects, not the nav.
- Boards, rendered link heights, 66 boards each opened at its own width (Chromium; iframe viewport = board width):

| Viewport | 40px | 44px | 48px | 56px |
|---|---|---|---|---|
| 1440 (40 boards) | 9 (Adm10Escena, Adm10Tiendas, Adm11Estados, Adm11PedidoDetalle, Adm11Pedidos, Adm12Parcial, Adm12Preparacion, Adm15Escena, Etiquetas) | 31 | - | - |
| 768 (11 boards) | - | - | 9 | 2 (Adm12ParcialTableta, Adm12Tableta) |
| 390 (15 boards) | - | 5 (Adm13ClientesMovil, Adm14CasosMovil, Adm15TiendasMovil, Adm16InformesMovil, Adm17AccesoMovil) | 3 (Adm07PromocionesMovil, Adm08Movil, Adm08MovilP2) | 7 (Adm11Movil, Adm11MovilP2, Adm11MovilP3, Adm12Movil, Adm12MovilP2, Adm12ParcialMovil, Adm12ParcialMovilP2) |

- Cause, local overrides [S]: `.ce-module-nav a { min-height: 44px }` (36 boards, one of them through the combined selector in PreciosTienda), `48px` (10 boards), `var(--ce-control)` (11 boards), none (9 boards). The brand link beside it has the same overrides (`.ce-app-brand { min-height: … }`: 44px in 38 boards, `var(--ce-control)` in 11, 48px in 10, 40px in 6).
- Shell density at 1440 is `compact` in 33 boards and unset in 7; at 768 and 390 it is `touch` in all 26. Density therefore does not predict the height.

**Current-page selector** [A]: `.ce-module-nav a[aria-current]` (line 818) matches any value, including `aria-current="false"`, which the ARIA vocabulary means "not current". The boards only ever set `"page"`.

**Icons** [A][S]: five of the seventeen icons are path-identical to CE Theme icons (Productos = `grid`, Precios por tienda = `tag`, Pedidos = `bag`, the identifier of the existing icon (used here for orders; it is an icon name, not a cart name, and X-8 keeps "bag" out of the cart naming, so a cart is drawn with a cart icon), Tiendas y etiquetas = `store`, Etiquetado = `ruler`). Resumen and Clientes differ from the nearest CE Theme icons (`home`, `user`). Ten (Categorías, Medios, Promociones, Disponibilidad, Contenido, Publicaciones, Preparación, Atención, Informes, Acceso y auditoría) have no counterpart by name in the 30-icon list of `assets/Icons/README.md`.

**Below 1024px** [A] (line 821): the nav becomes a horizontally scrolling row and the group headings are hidden (`.ce-module-nav h2 { display: none }`), so the grouping is lost on tablets and phones. Observed, not part of this request.

## 3. Current state in CE Theme

**Partly exists.** Recipe, standard name (`ModuleNav`, "The side navigation of CE apps, grouped by module") and component card exist; `coverage.md`: "App shell, module navigation, context switcher | `ce-app`, `ce-app-bar`, `ce-module-nav`, `ce-app-context` | Implemented | Collapses to a top scrolling nav below 1024 px." Checked: `bundle.css` lines 801-821, `AppShell/README.md` ("`aria-current` marks the module"), `AppShell/preview.html` (two groups, four links, `data-ce-density="compact"`; the icons in it include `truck` and `ruler`). **Missing:** the seventeen-link reference composition, a density-aware height, the current-page value, the tool-frame rule. Not a Vue export.

## 4. Proposed change

Recipe: `ce-module-nav` (existing). Three changes and one rule.

**4.1 Link height follows density** (choose one; owner decision 1):

```css
/* F1, recommended: density can raise, public-target floor (44px, X-1). Compact 44, default 44, touch 56 (--ce-control). */
.ce-module-nav a, .ce-app-brand { min-height: max(var(--ce-size-target-public), var(--ce-control, 0px)); }
/* F2, token only: floor is the existing compact row, 40px. Compact 40, default 40, touch 56. */
.ce-module-nav a, .ce-app-brand { min-height: max(var(--ce-size-row-compact), var(--ce-control, 0px)); }
/* F0: no change; the override stays in every consumer. */
```

Effect on the 66 boards if they were re-synchronised (they are not: the boards are a frozen snapshot, X-3; the effect is kept to size the change for new boards and other consumers), computed from the table above and from the boards' inline custom properties (not re-rendered). Two sources set the height today: the local nav rule (`min-height: 44px | 48px | var(--ce-control)`) and, in fourteen boards, an inline `--ce-control` on the shell that overrides the density value itself: `--ce-control: 44px` in twelve 1440 boards (Adm07Estados, Adm07Promociones, Adm13Clientes, Adm13Estados, Adm14Casos, Adm14Estados, Adm15Estados, Adm15Tiendas, Adm16Estados, Adm16Informes, Adm17Acceso, Adm17Estados) and `--ce-control: 48px` in Adm11Tableta and Adm11TabletaP2. Removing only the nav rule: **F1**: at 1440 the nine 40px boards become 44px and the 31 at 44px stay (the twelve with the inline value stay through `max(44px, 44px)`); at 768, seven of the nine 48px boards move to 56px, Adm11Tableta and Adm11TabletaP2 stay at 48px because of their inline `--ce-control`, and the two already at 56px stay; at 390 five move from 44px to 56px, three from 48px to 56px and seven stay. **F2**: at 1440, nineteen of the 31 boards at 44px become 40px, the twelve with inline `--ce-control: 44px` stay at 44px, and the nine at 40px stay; 768 and 390 as F1. (Fourteen other boards set `--ce-control: 44px` in a stylesheet rule scoped to `.ce-app-main` or `.ce-app-main .ce-table-wrap`; the nav is outside `.ce-app-main`, so those do not reach it.) Removing the inline `--ce-control` values as well is an additional markup change in those fourteen boards; it would take the twelve to 40px under F2 and the two tablets to 56px under either formula. F1 writes its 44px floor with the new `--ce-size-target-public` token (cross-cutting decision X-1, decided 2026-11-06), the same token every 44px target uses; no raw `44px` is added. The 31 desktop boards already draw 44px. `--ce-control` has no default value in the recipe (it is only set by the density attribute), hence the `0px` fallback.

**4.2 Current page:** `.ce-module-nav a[aria-current="page"]` (replaces `a[aria-current]` at line 818); same declarations. The page sets `aria-current="page"` on exactly one link.

**4.3 Reference composition:** extend the AppShell guideline and `preview.html` to the seven groups and seventeen links above, with the rule "the list of modules is supplied by CE Systems; CE Theme shows an example" (data authority sits with the consuming application, `apply-ce-theme.md`). Markup skeleton (shortened):

```html
<nav class="ce-module-nav" aria-label="Módulos">
  <h2>Resumen</h2>
  <a href="Adm01Resumen.dc.html" aria-current="page"><svg width="18" height="18" viewBox="0 0 24 24" … aria-hidden="true"><path d="…"/></svg>Resumen</a>
  <h2>Catálogo</h2>
  <a href="Inventario.dc.html"><svg …/>Productos</a> …
</nav>
```

**4.4 Tool-frame rule (documentation only):** a full-screen tool (for example the label tool) omits `ce-module-nav` and carries a back link to its module («← Etiquetado»). No CSS.

**4.5 Icons (owner decision 3):** either add the twelve missing or differing icons to `assets/Icons` (same 24px grid, 1.7px stroke, round caps), or document that module icons are supplied by the consuming application. No icon is added by this request.

## 5. Accessibility and invariants it must keep

| Invariant | Applies? |
|---|---|
| Landmark | One `nav` with `aria-label="Módulos"`; labels are Spanish UI strings |
| Current page | One link with `aria-current="page"`; not colour alone (bold text and a 3px inset bar in the recipe) |
| Focus ring | `a:focus-visible` 2px outline at `outline-offset: -2px` inside the link (existing; differs from the global 3px offset because links are flush; unchanged) |
| Targets | Staff navigation: 44px (F1, `--ce-size-target-public`) or 40px (F2); the staff floor recorded by the workbench audit is 32px. The 44px public-target rule (R-10) is public-only |
| Text and icons | Visible label on every link; icons `aria-hidden` |
| NAME / Description / specs, CE codes, prices | Not applicable (no product identity in the navigation) |
| Text x1.5 and x2 | Long labels («Tiendas y etiquetas», «Acceso y auditoría») wrap inside the 240px column; heights are `min-height`, so wrapping cannot clip. Single words that do not fit (at x2) break with `overflow-wrap: anywhere`; see section 6 |

## 6. Acceptance checks

Run here [S][R]: all 66 navs compared with the template (identical but for `aria-current`); link heights measured on the 66 boards (table above); recipe heights measured in the harness (40/40/40).
To run when the repository work happens (not run here):
1. Harness: link height equals the chosen formula under no density, `compact` and `touch`; brand link equal.
2. `aria-current="false"` does not draw the current style; `"page"` does.
3. Axe on the AppShell card; keyboard walk through 17 links; focus ring visible on the current link and on a hovered link.
4. 1023px and 1024px breakpoint: column to scrolling row; the current link remains reachable (`scrollIntoView` behaviour is the application's).
5. Text x1.5, x2 at 240px: no overflow.
6. Screen reader walk of the nav and of the hidden group headings at narrow widths: **not run, to schedule**.

In the repository, checks 1 to 5 are browser tests in `tests/browser/app-shell.spec.mjs`. They run on the AppShell design-system card, rendered with only the shipped fonts, tokens and recipes, in Chromium and, in hosted CI, WebKit. Check 6 is not run: to schedule. No screen-reader or real-device result is claimed.

Wrap rule, an implementation decision by the repository lead, decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed: before it, at text x2 (root font size 200%) the words that cannot wrap («Disponibilidad», «Publicaciones», the heading «Administración») gave the nav's grid track a 268px min-content. Every link was then 268px wide and the 240px column scrolled (scrollWidth 280px, clientWidth 239px; measured in Chromium on the AppShell card with the generated tokens and recipes); x1.5 fitted. `overflow-wrap: anywhere` on the existing `.ce-module-nav h2` and `.ce-module-nav a` rules is the smallest change that meets check 5 and section 5's statement that labels wrap inside the column. It adds no class, API or global wrapping rule, does not apply to CE codes or prices, and waives no acceptance.

## 7. Risks and what it does not change

- Every consumer of `ce-module-nav` is affected, not only CE Systems. Other consumers (the CE Radio admin card, CE Meta, CE Meta App) were **not inspected**. Under F1 a default-density consumer's links grow from 40px to 44px; under F2 nothing changes at default or compact density, touch shells grow to 56px.
- The 9 boards at 40px and the 31 at 44px at 1440 would no longer be identical to the new recipe; they keep their local overrides, and fourteen boards their inline `--ce-control`, as part of the frozen snapshot (X-3); new boards use the new recipe and carry no override (section 4.1 gives the per-formula effect of removing each).
- Not changed: the 240px column, colours, the inset current bar, `ce-app-bar`, search, store select, role pill, page header, data table.
- Observed, not requested: the `h2` group headings sit before the page `h1` in document order and disappear below 1024px.

## 8. Owner decisions needed

1. Link height rule: F1 (44px floor), F2 (40px, existing token) or F0 (no change). Recommended: F1. X-1 (decided 2026-11-06) settles only how a 44px floor is written: F1 uses `--ce-size-target-public`, never a literal 44px. **Decided (2026-11-13, the repository lead's selection, decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed; [#11](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)): F1**, the documented density formula with the 44px floor from `--ce-size-target-public`.
2. Touch shells: 56px for every touch board? Twelve touch boards use 48px today (nine tablet, three phone); two of the tablets (Adm11Tableta, Adm11TabletaP2) reach 48px through an inline `--ce-control: 48px` that only a markup change removes. **Decided (2026-11-13, the repository lead's selection, decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed; [#11](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)):** new touch-shell examples use the existing 56px touch density, without local 48px overrides. The frozen boards and their inline overrides are preserved, not rewritten.
3. Icons: add twelve to CE Theme or leave them to the application? **Decided (2026-11-13, the repository lead's selection, decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed; [#11](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)):** module icons remain supplied by the consuming application. No twelve-icon asset set is added; the reference example reuses existing suitable CE Theme icons.
4. Is the module list itself a CE Theme example only (recommended), or a rule for every CE Systems build? CE Systems is planned to be rebuilt in `j3w1/casaelida.com`; its module list is its own decision. **Decided (2026-11-13, the repository lead's selection, decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed; [#11](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)):** the module list is a CE Theme example, not a mandatory module inventory for every CE Systems build. The application owns its navigation data.
5. Accept the stricter `aria-current="page"` selector. **Decided (2026-11-13, the repository lead's selection, decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed; [#11](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)):** accepted. The current non-colour cue, the focus ring and exactly one current-page link stay.
