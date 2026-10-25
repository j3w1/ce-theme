# RadioPlayer

The CE Radio player window: Casa Elida's in-store music and announcement player, in the dark CE Radio theme.

## Classes

- Scope: `data-ce-theme="radio"` on the window; `data-ce-season="navidad"` for the Christmas look.
- `ce-radio-chrome`, `ce-radio-chrome-title`, `ce-radio-chrome-button` (`--close` fills with action red on hover): the frameless window's title strip.
- `ce-radio-player`: volume column (`ce-radio-volume`, the antenna slider) beside `ce-radio-deck`.
- `ce-radio-hero`: Previous and Next (`ce-radio-skip` with `ce-radio-skip-label`) around `ce-radio-stage`, which holds the whole CE Radio badge. `data-state` (`live`, `tuning`, `spot-next`, `spot-on`, `paused`, `alert`) sets the ring; `--ce-progress` the yellow arc. `ce-radio-badge` with `data-tone` (`signal`, `ok`, `alert`) marks file notices.
- `ce-radio-status` with `data-sign` (`playing`, `spot`, `alert`): one Spanish status line.
- `ce-radio-row`: `ce-radio-chip` (playlist, with `ce-radio-live` dot) and the mode `ce-radio-button` (`aria-pressed`).
- `ce-radio-now` (`ce-radio-song`, `ce-radio-artist`), `ce-radio-progress` (`ce-radio-progress-bar`, `ce-radio-times`), and `ce-radio-spot` with `data-phase` (`due`, `playing`): the thin SPOT line, the only place file names appear.

## The consumer supplies

The CE Radio application supplies every state, song, playlist and SPOT name; the theme only draws them. Window sizes are 480 × 360 and 480 × 320.

## Do and don't

- Do show the badge whole and contained; never crop it to a circle, recolour it or let it be dragged.
- Do keep yellow and red as signals (dots, rings, thin lines, 14–22% tints). Large fills are only for Reintentar and the close hover.
- Do pair every coloured state with its status line; colour never stands alone.
- Don't use the Christmas look unless a Christmas playlist is confirmed playing.
- Don't restyle the Admin sidebar with this theme; it keeps its own pinned theme.
