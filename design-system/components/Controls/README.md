# Controls

Every native HTML control family in the ce-theme look. Casa Elida screens never show an unstyled browser control: each one is a native element with a ce-theme class, so forms, autofill, validation and keyboard behaviour stay the browser's.

## Classes

- Fields: `ce-field` (label, control, `ce-field-note`, `ce-field-error`) around `ce-input` (text, email, search, password, number with `ce-input--number`, tel, url, date, time, datetime-local, month, week, file), `ce-textarea` and `ce-select`.
- Select: `ce-select` uses a customizable select (`appearance: base-select`) where the browser supports it, so the button and the list are drawn with tokens; elsewhere a native select with a token chevron and the operating system's own list. `multiple` and `size` give a listbox look.
- Choice: `ce-radio`, `ce-check`, `ce-switch`; `ce-fieldset` groups them.
- Values: `ce-range`, `ce-color`, `ce-progress`, `ce-meter`, `ce-quantity`, `ce-upload`.
- Actions: `ce-button` (`--secondary`, `--ink`, `aria-busy`), `ce-icon-button`, `ce-chip` (`aria-pressed`).
- Layers: `ce-menu` and `ce-menu-item`, `ce-tooltip`, `ce-dialog`; `ce-data-table`; `ce-media` around audio and video.

## States

Every control has normal, hover (ink border), focus (2px ink outline at 3px offset, keyboard only), active or selected (ink fill or ring), disabled (45% or subtle surface, `not-allowed`), invalid (`aria-invalid="true"` or `:user-invalid`: 2px danger border plus a `ce-field-error` sentence, never colour alone), read-only (subtle surface) and loading (`aria-busy`, with `ce-progress` for long waits).

## Keyboard and accessibility

Native keyboard behaviour is kept: Tab and Shift+Tab, Space for checks, switches and buttons, arrows for radios, ranges and selects, Escape closes a select, menu or dialog. Every control has a visible label or an `aria-label`; hints use `aria-describedby`; touch targets are at least 44px; text is 16px so mobile browsers do not zoom.

## Intentional native fallbacks

The pop-ups of date, time and colour pickers, the open list of a select where `base-select` is not supported, file dialogs, validation bubbles (use `novalidate` and `ce-field-error`) and the controls of audio and video belong to the browser or the operating system and are not restyled; the controls that open them are.

## Do and don't

- Do start from the native element and add a ce-theme class; use a vetted primitive for a complex combobox, date picker or menu (`ce-combobox` and `ce-listbox` document the pattern).
- Don't add a control without a ce-theme equivalent; add the recipe in the same change.
- Don't trade accessibility, native form submission, autofill, internationalisation or performance for an identical look in every browser.
