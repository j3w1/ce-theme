# Casa Elida foundation

Read `/etc/ce-devbox/AGENTS.md` first. Work in a registered CE task worktree.

- `tokens/` owns literal design values; `docs/` owns their usage rules.
- `recipes/` owns framework-neutral CSS and the decimal-string price formatter.
- `exports/` and `public/downloads/` are generated. Run `pnpm generate`; never edit them directly.
- Keep CSS variables prefixed `--ce-` and recipe classes prefixed `ce-`. Recipes must not reset a consumer's page.
- Preserve supplied logos and product identifiers exactly. Numeric codes are strings, never numbers.
- Keep prices as decimal strings. Display supplied commercial terms; do not introduce discount calculations or business rules.
- Preserve the user-approved direction in `docs/decisions.md`. This milestone is a light foundation, not a consumer migration.
- English technical documentation; Spanish interface and retail examples. Spell the brand `Casa Elida`.
- Do not import private portfolio source, customer data, secrets, or screenshot social-account chrome into public assets.
- Maintain asset provenance in `public/assets/manifest.json` and retain third-party licenses.

After changes: `pnpm generate`, `pnpm check`, `pnpm test:browser`, and `git diff --check`.
Browser tests require a compatible Playwright Chromium installation. Report unrun checks accurately.
Do not publish or deploy automatically. The repository is public; publication follows the owner's CE delivery rules.
