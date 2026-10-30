import { readFile } from 'node:fs/promises';

// Component recipe sources, concatenated in this order into exports/recipes.css.
// Share-card, print-label and font files stay separate opt-in exports.
export const RECIPE_SOURCES = ['recipes/recipes.css', 'recipes/interface.css', 'recipes/retail.css', 'recipes/workspace.css'];

export async function readRecipes() {
  const parts = await Promise.all(RECIPE_SOURCES.map((path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')));
  return parts.join('\n');
}
