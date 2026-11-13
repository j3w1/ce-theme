# Casa Elida foundation

Read `/etc/ce-devbox/AGENTS.md` first. Work in a registered CE task worktree.

- `tokens/` owns literal design values; `docs/` owns their usage rules.
- `recipes/` owns framework-neutral CSS, the decimal-string price formatter, the product-display helpers and optional reference behaviour.
- `packages/vue/` (`@casaelida/vue`) owns the reusable Vue 3 + TypeScript components. They render recipe classes and reuse the recipe helpers; they never add CSS. The package build also packs the foundation (`styles.css`, the Inter files, OFL) from `tokens/`, `recipes/` and `fonts/` through `scripts/package.mjs`. Vuexy is a reference only, never a dependency.
- Public Vue components are named `CE` + PascalCase (`CEButton`, `CETextField`, `CEDateRangePicker`), never `CeButton`: file `CE<Name>.vue`, export `CE<Name>`, props type `CE<Name>Props`, test `CE<Name>.test.ts`, and the same name in docs, examples and the `vue` field of the names registry. CSS stays `ce-*` and `--ce-*`. `tests/vue-naming.test.mjs` enforces this; see [packages/vue/CONTRIBUTING.md](packages/vue/CONTRIBUTING.md).
- `site/` is the Astro documentation and showcase only. It renders components from `@casaelida/vue` instead of copying their markup; do not add showcase pages unless asked.
- Follow [docs/workflow.md](docs/workflow.md): Claude Design → approved Git source → reusable component → optional showcase.
- `fonts/` holds the owner-supplied Inter files; `fonts/manifest.json` records their provenance.
- `exports/` and `public/downloads/` are generated. Run `pnpm generate`; never edit them directly.
- Keep CSS variables prefixed `--ce-` and recipe classes prefixed `ce-`. Recipes must not reset a consumer's page.
- Preserve supplied logos and product identifiers exactly. Numeric codes are strings, never numbers.
- Keep prices as decimal strings. Display supplied commercial terms; do not introduce discount calculations or business rules.
- Preserve the user-approved direction in `docs/decisions.md`. It does not migrate consumer applications.
- English technical documentation; Spanish interface and retail examples. Spell the brand `Casa Elida`.
- Do not import private portfolio source, customer data, secrets, or screenshot social-account chrome into public assets.
- Maintain asset provenance in `public/assets/manifest.json` (production) and `public/references/manifest.json` (reference-only), and retain third-party licenses.
- Never name the external retail reference used for design research in any public file, commit message or generated output.
- To adopt the system in another application, start from `docs/apply-ce-theme.md`.

After changes: `pnpm generate`, `pnpm check` (includes the Vue package's typecheck, tests and build), `pnpm test:browser`, `pnpm test:consumer` (the clean install proof of the packed package; it needs the npm registry), and `git diff --check`.
Browser tests require a compatible Playwright Chromium installation. Locally `pnpm test:browser` runs Chromium and says WebKit was not run; hosted CI runs both. Report unrun checks accurately.
Publication runs only from merged `main` under SEAL #7: the B1-release workflow publishes the package and B2's site workflow deploys the site; nothing else publishes the package or deploys the site. Design System artifact synchronization (B7) stays possible under its own PES. The repository is public.
