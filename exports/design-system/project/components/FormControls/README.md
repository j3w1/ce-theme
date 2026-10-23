# FormControls

Form controls beyond text fields: checkbox, switch, amount with prefix, quantity stepper, upload, removable tokens and choice cards. Every control has a visible label.

## Classes

- `ce-check`: checkbox and label, 44px row. `ce-switch`: `input[type=checkbox][role=switch]` styled as a switch.
- `ce-fieldset` with a bold `legend`.
- `ce-input-group` with `ce-input-affix` (“S/”) and `ce-input ce-input--number` (tabular, right aligned).
- `ce-quantity`: two 44px buttons around a number input; `enhanceQuantity()` respects `min`/`max`.
- `ce-upload`: a dashed drop area wrapping a file input. `ce-token-list` > `ce-token` with a named remove button.
- `ce-choice-cards` > `ce-choice-card`: radio or checkbox cards with `ce-choice-card-title` and a note; checked gets an ink ring, disabled explains why.
- `ce-combobox` with `ce-listbox` options for type-ahead lists (the application owns filtering and active-descendant handling).

## The consumer supplies

Labels, notes, validation messages and allowed values. Amounts stay decimal strings; the pricing service validates them.

## Do and don't

- Do describe the expected format in a `ce-field-note`, not only in the placeholder.
- Don't use a switch for choices that need a save step; use a checkbox.
