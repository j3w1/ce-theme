# @casaelida/vue

Casa Elida's reusable Vue 3 + TypeScript components. Each component renders an approved ce-theme recipe and reuses the recipe helpers, so an application gets the same markup, classes and behaviour that the foundation documents. The package adds no CSS of its own.

Status: `0.1.0`, private. It is built and tested in this repository; how applications such as `j3w1/casaelida.com` install it (workspace, Git dependency or a registry) is still an owner decision.

## Components

| Component | Recipe | Standard names | What it does |
| --- | --- | --- | --- |
| `CEButton` | `ce-button` | ButtonPrimary, ButtonSecondary, ButtonInk | `variant`: `primary`, `secondary`, `ink`. `type` defaults to `button`. `href` renders a link. `loading` sets `aria-busy` and disables it. |
| `CETextField` | `ce-field`, `ce-input` | TextField | Visible `label`, `v-model`, `note`, `error` (sets `aria-invalid` and `aria-describedby`), optional `prefix` such as `S/`. Native attributes go to the input. |
| `CEPrice` | `ce-price` | PriceRegular, PricePromo, PriceSale, PricePhoto, PriceOld, PriceUnit, PricePresentation | Formats supplied decimal strings with `recipes/price.mjs`. Never calculates a discount. Invalid input throws. |
| `CEProductCode` | `ce-code` | CECode | Shows a code exactly as supplied; underlines the four-digit number of a Casa Elida code. `size`: `sm`, `md`, `lg`. |

## Use

```ts
import { CEButton, CEPrice, CEProductCode, CETextField } from '@casaelida/vue';
```

```vue
<CEProductCode code="CE26061441" />
<CEPrice amount="6.00" previous-amount="7.50" discount-label="20%" />
<CETextField v-model="email" label="Correo electrónico" type="email" :error="emailError" />
<CEButton type="submit" :loading="saving">Guardar</CEButton>
```

Load the foundation CSS once in the application: `fonts.css`, `tokens.css` and `recipes.css` from `exports/` (see `docs/apply-ce-theme.md`). Without it the components render unstyled.

When several Vue apps render on one page (for example Astro islands), give each `CETextField` an `id`; generated ids are unique only within one app.

## Develop

From the repository root: `pnpm check` typechecks, tests and builds this package with the rest of the foundation. In this folder: `pnpm typecheck`, `pnpm test`, `pnpm build`. See [CONTRIBUTING.md](CONTRIBUTING.md).
