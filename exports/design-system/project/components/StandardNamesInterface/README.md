# StandardNamesInterface

Standard names for actions and forms: **ButtonPrimary** (Botón principal), **ButtonSecondary** (Botón secundario), **ButtonInk** (Botón oscuro), **IconButton** (Botón de ícono), **Chip** (Filtro rápido), **TextLink** (Enlace), **TextField** (Campo de texto), **SelectField** (Selector), **CheckOption** (Casilla), **Switch** (Interruptor), **Swatch** (Muestra de color).

## Classes

- **ButtonPrimary** · Botón principal: `ce-button`. Action red with white text: the one main action of a view.
- **ButtonSecondary** · Botón secundario: `ce-button--secondary`. White with a control border, for the other actions.
- **ButtonInk** · Botón oscuro: `ce-button--ink`. Ink with white text, for neutral strong actions.
- **IconButton** · Botón de ícono: `ce-icon-button`. A round icon-only button; always has an accessible name.
- **Chip** · Filtro rápido: `ce-chip`. A pill toggle or filter; pressed state shows an ink ring.
- **TextLink** · Enlace: `ce-link`. Bold, underlined text link in ink.
- **TextField** · Campo de texto: `ce-field`, `ce-input`. A label above a bordered input.
- **SelectField** · Selector: `ce-select`. A native select with the input styling.
- **CheckOption** · Casilla: `ce-check`. A checkbox with its label in one tap target.
- **Switch** · Interruptor: `ce-switch`. An on/off setting that applies at once.
- **Swatch** · Muestra de color: `ce-swatch`. A round colour choice; the name is in its accessible label.

## The consumer supplies

Real products, each with a NAME; supplied prices, discount labels and bases. Nothing in a sample is a live offer.

## Do and don't

- Do say the name, not the look: “Precio Promo”, not “the yellow price”.
- Don't rename a pattern or reuse a name for another one; add a new entry to `recipes/names.mjs` in the same change as its recipe.
