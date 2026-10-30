# Casa Elida

The Casa Elida design-system foundation: identity, portable design tokens, HTML/CSS recipes, reusable Vue 3 + TypeScript components (`@casaelida/vue`), and an Astro showcase for retail, internal tools, marketing, and signage.

The visual direction pairs image-led home-retail clarity, space, photography, and hierarchy with Casa Elida's supplied logos, red/yellow palette, product codes, and distinctive pricing. The interface and retail examples are Spanish; technical documentation is English.

## Start locally

Requires Node.js 24 and pnpm 12.14.0.

```sh
pnpm install --frozen-lockfile
pnpm generate
pnpm dev
```

Open the loopback URL printed by Astro. This is local development, not a CE deployment. Shared previews must use the reviewed CE deployment workflow.

```sh
pnpm check          # validate sources, check generated files, test contracts, test and build the Vue package, build the site
pnpm test:browser   # responsive layouts, accessibility, interactions, downloads
```

Install a compatible test browser when necessary with `pnpm exec playwright install chromium`.

## Use the foundation

People and agents adopting the system start with [docs/apply-ce-theme.md](docs/apply-ce-theme.md). Load `exports/tokens.css` before `exports/recipes.css`. Add `ce-scope` to your container to apply the shared typography and local box sizing. All reusable classes use `ce-`; variables use `--ce-`. Recipes do not apply a global reset.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="recipes.css">
<main class="ce-scope">
  <span class="ce-code">CE26061509</span>
  <h2 class="ce-product-heading">
    <span class="ce-product-name">ALDEN</span>
    <span class="ce-product-description">Dispensador de Aceite</span>
  </h2>
  <p class="ce-product-specs">vidrio, 350ml</p>
  <span class="ce-price"><span class="ce-sr-only">Precio actual: 8.5 soles</span>
    <span class="ce-price-currency" aria-hidden="true">S/</span>
    <span class="ce-price-value" aria-hidden="true">8.5</span>
  </span>
</main>
```

In a Vue 3 application, render the same recipes with the components instead of writing the markup by hand. Public components are always named `CE` + PascalCase:

```vue
<CEProductCode code="CE26061509" />
<CEPrice amount="8.50" />
```

See [packages/vue/README.md](packages/vue/README.md). The components still need the CSS above.

Set the price's font size for its context. `ce-product` sets it to 44px; campaign examples use larger values. Load the optional `exports/fonts.css` (Inter, self-hosted from `fonts/inter/`) before the tokens; the CSS includes Arial and sans-serif fallbacks.

## Source map

| Location | Owns |
| --- | --- |
| `tokens/` | DTCG 2025.10 primitive and semantic token sources |
| `ce-theme.json` | Version, supported exports, and contrast pairs |
| `packages/vue/` | `@casaelida/vue`: Vue 3 + TypeScript components (`CEButton`, `CETextField`, `CEPrice`, `CEProductCode`) that render the recipes, with tests |
| `recipes/` | Framework-neutral styles (base, interface, retail, workspace), font faces, share-card and label templates, and the price, product, campaign and behaviour helpers |
| `fonts/` | Owner-supplied Inter files with provenance hashes and OFL license |
| `docs/` | Adoption entry point, usage, product identity, pricing, sharing, accessibility, coverage, sources and decisions |
| `site/` | Static Astro documentation and showcase; it renders the real `@casaelida/vue` components: recipe pages, a demonstration storefront (`/tienda/`), internal tools (`/sistemas/`), labels and share previews |
| `design-system/` | Brand book, component guidelines and previews for the Claude Design System bundle |
| `exports/`, `public/downloads/` | Generated consumer files, including `exports/design-system/`; never hand-edit |
| `public/assets/manifest.json` | Production assets (logos, product photos) with original names, provenance and hashes |
| `public/references/manifest.json` | Reference-only material (historical campaigns and labels, approved card direction); not production assets |
| `AGENTS.md`, `CLAUDE.md` | Agent instructions; `CLAUDE.md` is a symbolic link to `AGENTS.md` |

Run `pnpm generate` after changing token, recipe, manifest, or doc sources. Generated files are committed and checked for drift. Version 0.2.0 has 113 tokens and a light theme; the separate `j3w1/theme` project is not a dependency.

Read [the adoption guide](docs/apply-ce-theme.md), [the consumer guide](docs/usage.md), [product identity](docs/product-identity.md), [pricing contract](docs/pricing.md), [shared-link specification](docs/sharing.md), [accessibility rules](docs/accessibility.md), [coverage and status](docs/coverage.md), [native control policy](docs/controls.md), [foundation decisions](docs/decisions.md), [source inventory](docs/sources.md), [the October 2026 design evolution record](docs/evolution/2026-10-design-evolution.md), [the Claude Design System bundle](docs/design-system.md) and [the changelog](CHANGELOG.md).

## Status and rights

Version 0.2.0 is a light foundation for owner review. It does not migrate any existing Casa Elida application. Catalogue and campaign prices are demonstration fixtures, not current offers. The formatter renders supplied commercial terms and does not calculate discounts.

The GitHub repository is public. Public visibility does not grant a general license to the company identity, photos, or source. Brand assets retain their ownership; see [asset notes](docs/assets.md). Inter is distributed under its [SIL Open Font License](fonts/inter/OFL.txt). This repository does not contain third-party retail marks, reference captures, or purchased template source.
