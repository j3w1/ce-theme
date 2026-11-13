# Apply ce-theme

Entry point for people and agents adopting the Casa Elida design system in another application. Read this first, then open only the references the task needs.

## 1. Load the foundation (always)

**Vue 3 applications** use `@casaelida/vue`, which carries the whole foundation. See [packages/vue/README.md](https://github.com/j3w1/ce-theme/blob/main/packages/vue/README.md#install).

1. Install one pinned package file with pnpm and commit the lockfile: the release asset `https://github.com/j3w1/ce-theme/releases/download/vue-vX.Y.Z/casaelida-vue-X.Y.Z.tgz` once releases are published, a local `casaelida-vue-X.Y.Z.tgz`, committed with the application, until then. Vue `^3.5.0` is a peer: the application installs it.
2. `import '@casaelida/vue/styles.css'` once, in the application entry. It holds Inter (400/600/700/800, OFL), the `--ce-` tokens and the `ce-` recipes, with no global reset.
3. Wrap the application region in `class="ce-scope"` and render the components (`CEButton`, `CETextField`, `CEPrice`, `CEProductCode`, the messaging components); they emit the same classes as the recipes.

Upgrade by pinning the newer version's file and committing the lockfile; roll back by restoring the previous pin and lockfile.

**Without Vue** (server-rendered share images, print, other stacks), pin a commit of this repository and load, in this order:

1. `exports/fonts.css` with the `fonts/inter/` folder beside it. A consumer without the files falls back to Arial.
2. `exports/tokens.css`: `--ce-` custom properties. Use semantic tokens (`--ce-color-text-primary`, `--ce-color-action-primary-bg`…), not palette values.
3. `exports/recipes.css`: framework-neutral component classes (`ce-`), no global reset. Wrap the application region in `class="ce-scope"`.

Optional outputs:

| Output | Use |
| --- | --- |
| `exports/share-card.css` | Server-side share images. |
| `exports/print-label.css` | 80 × 40 mm gondola labels. |
| `exports/adapters/vuetify.mjs` | Legacy Vuetify/Vuexy theme and defaults for the retired CE Systems; not for new applications. New Vue applications use `@casaelida/vue`. |
| `recipes/price.mjs`, `recipes/product.mjs`, `recipes/campaign.mjs` | Formatting helpers. |
| `recipes/behaviors.mjs` | Reference behaviour for the site. |

## 2. Rules that always apply

- **Typography and voice.** Inter only, with the type styles in the tokens. Spanish interface copy (es-PE); spell the brand `Casa Elida`.
- **Product identity** ([product-identity.md](product-identity.md)):
  - NAME uppercase, Description in Title Case (1px larger), specifications lowercase.
  - Codes are exact strings in the black `ce-code` badge.
  - Format through `productView`; never invent missing fields.
- **Prices** ([pricing.md](pricing.md)):
  - Supplied decimal strings through `preparePrice`.
  - Baseline `S/`, full-size decimals.
  - Yellow block for promotions; `ce-price--sale` and the `REBAJAS` card are supported alternatives.
  - Never `S/0` for missing data, never one store's price as universal, never computed discounts.
- **Images.** Catalogue photos whole (`contain`) on white; lifestyle photos may be cropped without misrepresenting the product. Lettered markers `A`, `B`, `C` are black circles, and every marked product is also listed in text.
- **Shared links** ([sharing.md](sharing.md)): use the share-card template; no prices in default previews.
- **Accessibility** ([accessibility.md](accessibility.md)): WCAG 2.2 AA; native elements; visible focus; text, not colour alone.
- **Logos.** Supplied files only, unchanged (`public/assets/manifest.json`).
- **Data authority.** The design system presents data; CE Systems and the commerce services own records, prices, stock, permissions and workflows.

## 3. Pick the patterns for the surface

| Surface | Read | Key classes |
| --- | --- | --- |
| Storefront, campaigns | [usage.md](https://github.com/j3w1/ce-theme/blob/main/docs/usage.md), [coverage.md](coverage.md) | `ce-site-header`, `ce-search`, `ce-category-rail`, `ce-filter-bar`, `ce-product-grid`, `ce-product`, `ce-rail`, `ce-editorial`, `ce-tagged-media`, `ce-tag-list`, `ce-store-context`, `ce-gallery` |
| Messaging apps (CE Meta App) | [coverage.md](coverage.md#messaging-ce-meta-app), [definite width](https://github.com/j3w1/ce-theme/blob/main/packages/vue/README.md#messaging-components) | `ce-conversation-list`, `ce-message-list`, `ce-composer` and the `CEConversationList`, `CEMessageList`, `CEMessageComposer`, `CEAttachmentGroup`, `CEWorkStatus` components. `CEAttachmentGroup` and `CEWorkStatus` are query containers with no width of their own: give them a definite width. Correct: `<div style="display:flex"><CEWorkStatus style="flex:1" …/></div>`. Collapses to zero width: `<div style="display:flex"><CEWorkStatus …/></div>` (the same in `inline-block`, a float or `width: max-content` unless that parent has a width). |
| Internal tools (CE Systems, CE Meta, CE Radio) | [coverage.md](coverage.md) | `ce-app`, `ce-module-nav`, `data-ce-density`, `ce-data-table`, `ce-bulk-bar`, `ce-record-header`, `ce-form-actions`, `ce-audit`, `ce-pos` |
| Print | [product-identity.md](product-identity.md) | `ce-label`, `ce-label-sheet` |
| Overlays and feedback | — | `ce-dialog`, `ce-drawer`, `ce-disclosure`, `ce-tabs`, `ce-notice`, `ce-toast`, `ce-empty`, `ce-skeleton` |

Every form control follows the [native control policy](controls.md): style the native element with its ce-theme class, never ship an unstyled browser control. The reference site (`pnpm dev`) shows runnable markup for each recipe. [coverage.md](coverage.md) states what is implemented, tested, only specified, or waiting for a business rule.

## 4. Do not

- Copy third-party reference code, logos, fonts, photography or copy.
- Fork the tokens per application. Add semantic tokens here instead.
- Re-implement `1688toPL` code allocation, pricing rules, approval chains or financial calculations in the interface.
- Treat a hidden or disabled control as authorization.
