# RadioTheme

The CE Radio dark theme: the station palette and the scope that turns the shared Casa Elida recipes dark.

## Classes

- `data-ce-theme="radio"`: remaps the semantic colour tokens (surfaces, text, borders, focus, status) to `ce-color-radio-*`, so buttons, chips, fields and notices render on charcoal.
- Tokens: `ce-color-radio-bg`, `-chrome`, `-surface`, `-raised`, `-line`, `-control`, `-text`, `-muted`, `-faint`, `-signal` (brand yellow), `-on-signal`, `-alert`, `-ok`, `-focus`, and the Christmas set `ce-color-radio-navidad-*`.

## The consumer supplies

For the CE Radio application itself, `exports/adapters/ce-radio.css` fills its existing `--station-*` variables with these values; see `radio.md`.

## Do and don't

- Do use `-faint` only on `-bg` and `-surface` (4.5:1); on `-raised` use `-muted`.
- Do use `-alert` for text and icons; the Christmas red (`-navidad-accent`) is decorative only.
- Don't use the radio theme on retail surfaces; it belongs to CE Radio.
