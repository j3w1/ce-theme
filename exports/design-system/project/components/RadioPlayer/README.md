# RadioPlayer

The CE Radio player window (480 × 360) in the ce-theme look: Casa Elida's in-store music and SPOT player.

## Anatomy

- `ce-chrome`: the frameless window's title strip, the ce-theme ink utility bar; the close action fills with action red on hover.
- `ce-player`: the antenna volume (`ce-antenna`, a larger ink tower with a brand-red top; the level is ink) beside the deck.
- `ce-hero`: Previous and Next (`ce-icon-button` at 48 px, with `ce-track-skip__label`) around `ce-stage`, which holds the whole CE Radio badge. `data-state` sets the ring: ink while live, action red for `spot-next` (dashed) and `spot-on` (solid), the danger colour for `alert`.
- `ce-status`: the ce-theme status pill, tinted by `data-sign` (success while playing, info for SPOT notices, danger for alerts).
- `ce-player__chip ce-chip` (playlist, with the green `ce-live` dot) and the mode `ce-icon-button` (ink ring when Aleatorio or Inteligente).
- `ce-player__now`, the 4 px ink progress track (`ce-player__bar`) and the 2 px SPOT line (`ce-spot-progress`), the only place file names appear.

## Do and don't

- Do show the badge whole and contained, with no shadow or glow; never crop, recolour or drag it.
- Do reserve yellow for promotions: the antenna is ink and brand red, never yellow.
- Do use action red only for SPOT signs and the main recovery action.
- Don't add a dark or tinted canvas: CE Radio is a white Casa Elida surface.

## Source

The markup is the CE Radio renderer's own DOM, captured from `j3w1/ce-radio` at `092454c` with sample Spanish data, and the styles are its `chrome.css`, `user.css` and `admin.css`. CE Radio loads ce-theme 0.2.0 (tokens, recipes and Inter) and draws everything else with `--ce-*` tokens: no literal colours, shadows or gradients. Change the app, not this card, then capture again.
