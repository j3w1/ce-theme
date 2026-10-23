# Status

Inline status message with a tinted surface, for stock, sync and form states in retail and internal tools.

## Classes

- `ce-status` plus one of `--success`, `--info`, `--warning`, `--danger`; each uses its `ce-color-status-*-text` on `ce-color-status-*-bg`.

## The consumer supplies

A short Spanish message that names the state in words, with an optional leading glyph or icon (“✓ Disponible”).

## Do and don't

- Do always name the state in text; color is a second signal.
- Don't use brand red or yellow for status.
