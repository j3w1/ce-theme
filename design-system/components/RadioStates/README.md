# RadioStates

CE Radio states that change the whole player: not connected, and confirmed Navidad playback.

## Anatomy

- Not connected: the stage ring and `ce-status` take the ce-theme danger pair; the song area becomes `ce-offline` with a danger sign and one large Reintentar (`ce-offline__retry`, action red).
- Navidad (`ce-player.is-christmas`): the whole window takes the Navidad campaign surface (green `#1f5f45` with white text, set through `--ce-campaign-surface`, 7.5:1), so it can never be mistaken for the white default. The badge wears its hat, the antenna becomes a mint tree with a red garland and star, the controls are tonal (outlined buttons with white icons, a mid-green chip with a red ring and a mid-green status pill), the progress fill and rings turn white, and white snow falls only while the music is seen advancing.

## Do and don't

- Do use the Navidad look only while a Navidad playlist is confirmed playing.
- Do keep SPOT, pause and alert signs readable in Navidad: the status pill keeps its colours and the ring changes style (dashed, solid), because red on the green has too little contrast.
- Don't animate anything with reduced motion; every state keeps a still sign (ring colour, dash, held wave, badge).

## Source

The markup is the CE Radio renderer's own DOM, captured from `j3w1/ce-radio` at `3851c1d` with sample Spanish data, and the styles are its `chrome.css`, `user.css` and `admin.css`. CE Radio loads ce-theme 0.2.0 (tokens, recipes and Inter) and draws everything else with `--ce-*` tokens: no literal colours, shadows or gradients. Change the app, not this card, then capture again.
