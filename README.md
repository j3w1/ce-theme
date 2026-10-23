# Casa Elida

The Casa Elida design-system foundation: identity, portable design tokens, HTML/CSS recipes, and a visual reference for retail, internal tools, marketing, and signage.

The visual direction pairs IKEA-inspired clarity, space, photography, and hierarchy with Casa Elida's supplied logos, red/yellow palette, product codes, and distinctive pricing. The interface and retail examples are Spanish; technical documentation is English.

## Start locally

Requires Node.js 24 and pnpm 12.14.0.

```sh
pnpm install --frozen-lockfile
pnpm generate
pnpm dev
```

Open the loopback URL printed by Astro. This is local development, not a CE deployment. Shared previews must use the reviewed CE deployment workflow.

```sh
pnpm check          # validate sources, check generated files, test contracts, build
pnpm test:browser   # responsive layouts, accessibility, interactions, downloads
```

Install a compatible test browser when necessary with `pnpm exec playwright install chromium`.

## Use the foundation

Load `exports/tokens.css` before `exports/recipes.css`. Add `ce-scope` to your container to apply the shared typography and local box sizing. All reusable classes use `ce-`; variables use `--ce-`. Recipes do not apply a global reset.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="recipes.css">
<main class="ce-scope">
  <span class="ce-code">CE26061509</span>
  <h2>Dispensador aceite</h2>
  <p>Vidrio, 350ml</p>
  <span class="ce-price"><span class="ce-sr-only">Precio actual: 8.5 soles</span>
    <span class="ce-price-currency" aria-hidden="true">S/</span>
    <span class="ce-price-value" aria-hidden="true">8.5</span>
  </span>
</main>
```

Set the price's font size for its context. `ce-product` sets it to 44px; campaign examples use larger values. Load the optional Noto Sans font locally; the CSS includes system fallbacks.

## Source map

| Location | Owns |
| --- | --- |
| `tokens/` | DTCG 2025.10 primitive and semantic token sources |
| `ce-theme.json` | Version, supported exports, and contrast pairs |
| `recipes/` | Framework-neutral styles and decimal-string price formatting |
| `docs/` | Usage, accessibility, identity, and decisions |
| `site/` | Static Astro reference site and demonstration fixtures |
| `design-system/` | Brand book, component guidelines and previews for the Claude Design System bundle |
| `exports/`, `public/downloads/` | Generated consumer files, including `exports/design-system/`; never hand-edit |
| `public/assets/manifest.json` | Supplied and public-company asset provenance and hashes |

Run `pnpm generate` after changing token, recipe, manifest, or usage sources. Generated files are committed and checked for drift. The first foundation has 98 tokens and a light theme; the separate `j3w1/theme` project is not a dependency.

Read [the consumer guide](docs/usage.md), [pricing contract](docs/pricing.md), [accessibility rules](docs/accessibility.md), [foundation decisions](docs/decisions.md), and [the Claude Design System bundle](docs/design-system.md).

## Status and rights

Version 0.1.0 is the first foundation. It does not migrate any existing Casa Elida application. Catalogue and campaign prices are demonstration fixtures, not current offers. The formatter renders supplied commercial terms and does not calculate discounts.

The GitHub repository is public. Public visibility does not grant a general license to the company identity, photos, or source. Brand assets retain their ownership; see [asset notes](docs/assets.md). Noto Sans is distributed under its [SIL Open Font License](public/licenses/noto-sans-OFL.txt). This repository does not contain IKEA marks or purchased template source.
