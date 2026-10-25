# Native control styling policy

All user-facing interactive elements across Casa Elida applications use the approved ce-theme visual language. No screen shows an unstyled browser-default control where a ce-theme equivalent exists. This page is the policy, the state contract and the complete control inventory.

## Policy

- **Style the native element first.** Use the semantic HTML element and add a ce-theme class; add JavaScript only to progressively enhance it. Native elements keep form submission, autofill, validation, keyboard behaviour, internationalisation and performance.
- **Customizable select.** `ce-select` uses `appearance: base-select` where the browser supports it (the button, the open list, the options, the group labels and the chevron are drawn with tokens) and falls back to a native select with a token chevron. The open list of the fallback belongs to the operating system.
- **Established primitives for complex widgets.** A rich combobox, listbox, date picker, dialog or menu is built on a vetted accessible primitive (native `<dialog>`, the `popover` attribute, an established headless library), not rebuilt by hand. `ce-combobox`, `ce-listbox`, `ce-menu` and `ce-dialog` define the look, not the behaviour.
- **Do not restyle what the browser or the system owns.** The pop-ups of date, time and colour pickers, file dialogs, validation bubbles, the open list of a native select without `base-select`, and the controls of audio and video stay native. The control that opens them is styled.
- **No identical look at any cost.** Never trade accessibility, mobile usability, native form submission, autofill, internationalisation or performance for the same pixels in every browser.
- **Shared components use Inter, the approved spacing, colour, typography, border and focus tokens, and the Casa Elida UX patterns.** A new interface that needs a control without a ce-theme equivalent adds the recipe (and its names entry) in the same change.

## State contract

Every reusable control documents and supports the states that apply to it:

| State | Look |
| --- | --- |
| Normal | White surface, 1px `color.border.control`, 4px `radius.small`, Inter 16px |
| Hover | Border turns ink; fills lighten to `color.surface.subtle` |
| Focus | 2px ink outline at 3px offset, keyboard focus only (`:focus-visible`) |
| Active / pressed | Pressed fills are ink (`aria-pressed`, `:checked`, `aria-selected`) |
| Selected | Ink ring or ink fill with white text; options show an ink bar |
| Disabled | `color.surface.subtle` or 45% opacity, `not-allowed`, still readable |
| Read-only | `color.surface.subtle`, selectable text |
| Invalid | `aria-invalid="true"` or `:user-invalid`: 2px `color.status.danger.text` border plus a `ce-field-error` sentence that says how to continue; never colour alone |
| Loading | `aria-busy="true"`; subtle surface and `cursor: progress`; `ce-progress` for waits over a second |

Keyboard: Tab and Shift+Tab move between controls; Space activates buttons and toggles checks and switches; arrows move radios, ranges and select options; Enter submits or activates; Escape closes a select, menu, popover or dialog. Touch targets are at least 44px and text is 16px so mobile browsers do not zoom.

## Inventory

| HTML element or behaviour | ce-theme component | Variants and notes | Intentionally native |
| --- | --- | --- | --- |
| `input` text, email, url, tel | `ce-field` + `ce-input` | `ce-field-note`, `ce-field-error`, `ce-input-group` with `ce-input-affix` | Autofill and keyboard type |
| `input type="search"` | `ce-input`, or `ce-search` in headers | Clear button kept native | — |
| `input type="number"` | `ce-input--number`; stepper: `ce-quantity` | Tabular figures; spinners hidden in `ce-quantity` | Numeric keyboard |
| `input type="password"` | `ce-input` | `autocomplete="current-password"`; show/hide is a `ce-icon-button` | Password manager |
| `textarea` | `ce-textarea` | Vertical resize | — |
| `select` | `ce-select` | Groups, disabled options; customizable list with `base-select` | Open list without `base-select` |
| `select multiple` / `size` | `ce-select` listbox look | Ink for selected options | — |
| `datalist` | `ce-input` + native `list` | Suggestions list is the browser's; rich suggestions use `ce-combobox` | Suggestions list |
| Custom combobox / listbox | `ce-combobox`, `ce-listbox` | `role="combobox"`, `aria-activedescendant`; build on a vetted primitive | — |
| `input type="checkbox"` | `ce-check` | Group in `ce-fieldset`; invalid outline | — |
| `input type="radio"` | `ce-radio` | Group in `ce-fieldset` with a legend | — |
| Switch (`role="switch"`) | `ce-switch` | Applies at once, no save button | — |
| `input type="range"` | `ce-range` | Show the value in the label | — |
| `input type="date"`, `time`, `datetime-local`, `month`, `week` | `ce-input` | Tabular figures, `color-scheme: light` | Picker pop-up |
| `input type="file"` | `ce-input[type=file]` or `ce-upload` dropzone | File button drawn as a secondary button | File dialog and its language |
| `input type="color"` | `ce-color` | Campaign colours are checked with `campaignColors()` | Picker pop-up |
| `button`, `submit`, `reset` | `ce-button` | `--secondary`, `--ink`, `aria-busy`, `:disabled` | — |
| Icon-only button | `ce-icon-button` | `--ink`, `--action`, `--small`; always has a name | — |
| Toggle button, filter | `ce-chip` | `aria-pressed` | — |
| `a` | `ce-link`, `ce-arrow-link`, `ce-link-row` | Bold, underlined | — |
| `dialog` | `ce-dialog` | Native `<dialog>` with `showModal()`; focus trap and Escape are native | — |
| Menu / popover | `ce-menu`, `ce-menu-item` | `popover` attribute and `role="menu"` | — |
| Tooltip | `ce-tooltip` | `role="tooltip"`, never the only place for essential information | `title` attribute |
| `details` / `summary` | `ce-disclosure` | Accordion and filter groups | — |
| Validation | `ce-field-error`, `aria-invalid`, `:user-invalid` | Use `novalidate` and write the message | Validation bubble |
| `progress` | `ce-progress` | Determinate and indeterminate | — |
| `meter` | `ce-meter` | Good, low and critical colours | — |
| `table` | `ce-data-table`, `ce-table-wrap` | Sort buttons, row-selection checkboxes drawn by the table recipe, bulk bar | — |
| `audio`, `video` | `ce-media` | Frame and caption are ours | Player controls |
| `fieldset` / `legend` | `ce-fieldset` | Groups choices | — |
| Tabs | `ce-tabs` | `role="tablist"`, arrow keys | — |
| Toast and notices | `ce-toast`, `ce-notice` | Status messages use `role="status"` | — |

## Enforcement

`tests/browser/foundation.spec.mjs` loads every page of the reference site and fails if a form field has no ce-theme class of its own (or, for checks, radios and files, a ce-theme label; for the search field, quantity stepper and table checkboxes, their `ce-search`, `ce-quantity` or `ce-data-table` wrapper), keeps the browser appearance on a select, or is not drawn in Inter. The registry in `recipes/names.mjs` gives each control a standard name and a sample, shown in the `StandardNamesInterface` card.
