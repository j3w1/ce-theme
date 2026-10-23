# ProductCode

Black badge with bold white type that shows a Casa Elida product code exactly as supplied.

## Classes

- `ce-code`: `ce-color-code-text` on `ce-color-code-bg`, bold, tabular figures, padding 0.3em × 0.35em and a 0.2em radius, so the badge scales with its font size.
- `ce-code-number`: wraps the four-digit item number of a `CE` code (`CE2606` + `1441`) and underlines it on screen as a reading aid. The underline is removed in print and is never part of barcode or carton artwork.

## The consumer supplies

The code as a text string. `codeSegments()` in `recipes/product.mjs` splits `CEYYMM` + four digits + ending for display; codes that don't match are shown whole. Copying returns the exact stored code.

## Do and don't

- Do keep leading zeros, case and every character.
- Do use the badge for Casa Elida codes only; supplier article numbers and order numbers stay plain text.
- Don't truncate, reformat, split the variant and size suffixes, or replace a code with a NAME such as MENE.
