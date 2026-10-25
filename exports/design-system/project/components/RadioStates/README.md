# RadioStates

How the CE Radio player signals each state. See `RadioPlayer` for the classes.

## Classes

- `ce-radio-stage[data-state]`: `live` (yellow arc), `tuning` (dashed muted ring), `spot-next` (yellow ring), `spot-on` (red ring; music arc steps back), `paused` (dashed ring, desaturated badge), `alert` (red ring).
- `ce-radio-offline` with `ce-radio-offline-sign` and one `ce-radio-button--signal ce-radio-button--large` Reintentar: replaces the song area when the player is not connected.
- `ce-radio-badge[data-tone]`: file notices on the stage (yellow checking, pine added, red invalid).
- `[data-ce-season="navidad"]`: the snowy pine Christmas look; SPOT, pause and alert signs keep yellow and red.

## The consumer supplies

The state, the status text and the notice. With reduced motion, waves and spinning rings stop, and the ring colour, dash and badge remain.

## Do and don't

- Do keep the rows below the stage still when the window is short (320): the stage gives up height first.
- Don't invent states; the application owns playback and SPOT timing.
