# RecordEditor

A record page for internal tools: record header, editable sections, locked fields that explain who owns them, save state and the audit history.

## Classes

- `ce-record-header`: thumbnail, `ce-record-title` (code, `h1`/`h2`, `ce-record-meta`) and a status `ce-pill`.
- A product record's title follows the ProductStack. The code (or the row that holds it with its pills), the `ce-product-heading` and the optional `ce-product-specs` are direct children of `ce-record-title`: code to heading 8px, NAME to Description 2px, heading to specs 2px, then the meta line at the title's 4px gap. The heading keeps the level its page gives it (`h1`, `h2` or `h3`); set `--ce-product-text` on the title to size the identity. A title with neither a direct-child `ce-product-heading` nor a direct-child `ce-product-specs` keeps the 4px gap between every line. Don't nest the code or the identity inside a heading: the spacing applies only to direct children.
- `ce-record-layout`: form beside a 320px side column from 1024px.
- `ce-form-section` (`h2` + content) and `ce-form-grid` of `ce-field`s; `ce-field-note` shows how the value will display (“Vista: Taza de Vidrio Resistente al Calor”).
- `ce-locked`: why a field cannot be edited here (“El código lo asigna 1688toPL”). `ce-readonly`: label/value pairs.
- `ce-form-actions`: sticky footer with `ce-save-state` (`data-state="dirty|saved|error"`) and the actions.
- `ce-audit`: dated history entries. `ce-compare` shows before/after with `ins`/`del`.

## The consumer supplies

The record, field-level permissions, validation messages, save results and the audit trail.

## Do and don't

- Do store NAME, Description and specs as supplied and show the formatted view beside them.
- Do keep copy actions exact: copying a code returns the stored code.
- Don't let the interface allocate, split or rewrite codes.
