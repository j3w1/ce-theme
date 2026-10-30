# From design to component

One path, four steps. Each step starts only from what the previous one approved.

| Step | Where | Who decides | What it produces |
| --- | --- | --- | --- |
| 1. Explore | Claude Design (the Casa Elida design system and the exploration canvas) | Anyone; nothing is approved here | Options to compare |
| 2. Approve | A pull request to this repository | The owner | A row in [decisions.md](decisions.md), and tokens or recipes in `tokens/` and `recipes/` |
| 3. Implement | `packages/vue` (`@casaelida/vue`) | Reviewed in a pull request | A Vue 3 + TypeScript component that renders an approved recipe, with tests |
| 4. Show (optional) | The Astro site in `site/` | Reviewed in a pull request | The real component on an existing showcase page |

## Rules

- **Git is the source.** The Claude Design System is regenerated from this repository (`pnpm generate`, then a sync); an exploration in Claude Design never becomes a standard by itself.
- **Recipes first, components second.** A component renders recipe classes and reuses the recipe helpers (`recipes/price.mjs`, `recipes/product.mjs`). It does not add its own CSS or restyle a recipe. A test fails if a component emits a class that the recipes do not define.
- **The showcase renders, it does not copy.** Astro pages import components from `@casaelida/vue`. They do not hand-write a component's markup.
- **Small batches.** A pull request adds a few components with tests. It does not add showcase pages, deploy, or migrate an application. The one exception is `/mensajeria/`, the interactive example of the messaging components, which the owner approved specifically ([decisions.md](decisions.md), “Showcase exception”). Every other new page still needs the owner's explicit request.
- **Applications adopt by version.** `j3w1/casaelida.com` and other applications install the package and the foundation CSS at a version; this repository does not change them.

## Adding a component

1. Confirm the recipe and its behaviour are approved in `decisions.md`. If not, propose them first.
2. Add `packages/vue/src/components/CE<Name>.vue` (always `CE` + PascalCase), export it from `src/index.ts`, add `test/CE<Name>.test.ts`, and set the `vue` field of its entry in `recipes/names.mjs`. Follow [packages/vue/CONTRIBUTING.md](../packages/vue/CONTRIBUTING.md).
3. Run `pnpm check` (it builds and tests the package) and `pnpm test:browser`.
4. If a showcase page already shows that recipe, replace the hand-written markup there with the component.
5. Open a pull request that names the decision it implements.
