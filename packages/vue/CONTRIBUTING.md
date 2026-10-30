# Contributing to @casaelida/vue

Read [docs/workflow.md](../../docs/workflow.md) first: Claude Design → approved Git source → reusable component → optional showcase. A component implements a recipe the owner has approved in `docs/decisions.md`; it is not where a design is decided.

## Naming

**Every public component is named `CE` followed by PascalCase:** `CEButton`, `CETextField`, `CEPrice`, `CEProductCode`, `CEDateRangePicker`, `CEAppShell`, `CEConversationList`. Never `CeButton` or `CEbutton`.

- The file is `src/components/CE<Name>.vue`, exported from `src/index.ts` as `CE<Name>` with its props type `CE<Name>Props`.
- Tests are `test/CE<Name>.test.ts`. Documentation, examples and the names registry (`vue` field in `recipes/names.mjs`) use the same name.
- CSS keeps its own convention: recipe classes are `ce-*` and tokens are `--ce-*`. Components never rename them.
- `tests/vue-naming.test.mjs` fails on a wrongly named component, export, props type or registry entry, and on any `Ce` + capital name in code, docs or examples.

## A component

- Renders recipe classes only. `test/recipe-contract.test.ts` fails if it emits a class the recipes do not define. It adds no CSS; a missing style is a recipe change, proposed and approved first.
- Reuses the recipe helpers (`recipes/price.mjs`, `recipes/product.mjs`) instead of reimplementing them. Prices stay decimal strings; codes stay strings.
- Uses native elements first, follows [docs/controls.md](../../docs/controls.md) and [docs/accessibility.md](../../docs/accessibility.md): visible labels, `aria-describedby` for help and errors, keyboard behaviour of the native element.
- Has Spanish interface text and English props, comments and documentation.
- Has tests for its variants, states, accessibility attributes and events.

## A pull request

- Adds a few components, not a library. It names the decisions it implements.
- Replaces hand-written markup on an existing showcase page with the component where that page already shows the recipe. It does not add showcase pages.
- Passes `pnpm check` and `pnpm test:browser` from the repository root.
