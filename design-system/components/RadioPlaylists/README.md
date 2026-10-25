# RadioPlaylists

The CE Radio playlist sheet: three columns of ce-theme chips in groups, with the close button in its own footer row.

## Anatomy

- `ce-sheet` with `ce-sheet__groups` and `ce-sheet__footer` (hairline rule, `ce-icon-button` close).
- `ce-group` with an uppercase eyebrow title (`ce-group__title`, red icon) and `ce-group__list`.
- `ce-card ce-chip`: one playlist. `is-current` adds the ink ring; `is-playing` shows the green dot.
- `ce-group--navidad`: the Navidad group as a flat Navidad campaign panel (green, white text) with white chips and a red base rule.

## Do and don't

- Do keep the full playlist name readable through the chip's title when it ellipsizes.
- Don't add gradients or stripes; the season is carried by the flat Navidad green and brand red.

## Source

The markup is the CE Radio renderer's own DOM, captured from `j3w1/ce-radio` at `a3671d8` with sample Spanish data, and the styles are its `chrome.css`, `user.css` and `admin.css`. CE Radio loads ce-theme 0.2.0 (tokens, recipes and Inter) and draws everything else with `--ce-*` tokens: no literal colours, shadows or gradients. Change the app, not this card, then capture again.
