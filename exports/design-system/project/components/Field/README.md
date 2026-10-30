# Field

Labelled text input or select with an optional note or error message below.

## Classes

- `ce-field`: the vertical stack; its `label` is bold 14px.
- `ce-input`, `ce-select`: 48px tall, `ce-radius-small`, `ce-color-border-control` border.
- `ce-field-note`: muted helper text. `ce-field-error`: danger text.
- Invalid: `aria-invalid="true"` thickens the border to 2px in `ce-color-status-danger-text`.

## The consumer supplies

A visible `<label for>` in Spanish, the native control, and an `aria-describedby` link to its note or error. Errors say what went wrong and how to fix it. The application owns validation.

## Do and don't

- Do keep the visible label; a placeholder is not a label.
- Do keep product codes in inputs exactly as entered.
- Don't signal an error by color alone; always add the message.
