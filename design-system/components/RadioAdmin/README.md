# RadioAdmin

The CE Radio Admin password prompt and the 320 px Admin sidebar, built from ce-theme recipes.

## Anatomy

- `ce-admin-prompt`: an extra-bold title, a `ce-field` with `ce-input`, Entrar (`ce-button`) and Cancelar (`ce-button--secondary`).
- `ce-admin ce-admin--sidebar`: header (`ce-admin__title`, `ce-admin__health` with a status dot), scrolling sections (`ce-admin-card`), and a footer with Modo usuario and Salir.
- Controls are the recipes, sized to 40 px for the small window: `ce-button`, `ce-button--secondary`, `ce-select`, `ce-check`, `ce-fieldset` (`ce-admin-week`), ink range sliders and a `ce-disclosure` for diagnostics.
- `ce-admin-danger`: destructive secondary buttons in the danger pair; their two-step confirm stays.

## Do and don't

- Do keep one primary action per section where possible; everything else is secondary.
- Don't use a monospace or dark theme here; Admin is a ce-theme surface like the player.

## Source

The markup is the CE Radio renderer's own DOM, captured from `j3w1/ce-radio` at `092454c` with sample Spanish data, and the styles are its `chrome.css`, `user.css` and `admin.css`. CE Radio loads ce-theme 0.2.0 (tokens, recipes and Inter) and draws everything else with `--ce-*` tokens: no literal colours, shadows or gradients. Change the app, not this card, then capture again.
