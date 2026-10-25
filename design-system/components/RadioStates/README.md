# RadioStates

CE Radio states that change the whole player: not connected, and confirmed Navidad playback.

## Anatomy

- Not connected: the stage ring and `ce-status` take the ce-theme danger pair; the song area becomes `ce-offline` with a danger sign and one large Reintentar (`ce-offline__retry`, action red).
- Navidad (`ce-player.is-christmas`): the white canvas stays. The badge wears its hat (`logo-ce-radio-navidad.png`), the antenna becomes a green tree with a yellow star, the playlist chip and progress take brand red, and light snow falls only while the music is seen advancing.

## Do and don't

- Do use the Navidad look only while a Navidad playlist is confirmed playing.
- Do keep SPOT, pause and alert signs in their own colours in Navidad too, so every state stays truthful.
- Don't animate anything with reduced motion; every state keeps a still sign (ring colour, dash, held wave, badge).

## Source

The markup is the CE Radio renderer's own DOM, captured from `j3w1/ce-radio` at `def1171` with sample Spanish data, and the styles are its `chrome.css`, `user.css` and `admin.css`. CE Radio loads ce-theme 0.2.0 (tokens, recipes and Inter) and draws everything else with `--ce-*` tokens: no literal colours, shadows or gradients. Change the app, not this card, then capture again.
