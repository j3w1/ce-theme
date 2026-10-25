# StandardNamesInterface

Standard names for actions and forms: **ButtonPrimary** (Botón principal), **ButtonSecondary** (Botón secundario), **ButtonInk** (Botón oscuro), **IconButton** (Botón de ícono), **Chip** (Filtro rápido), **TextLink** (Enlace), **TextField** (Campo de texto), **SelectField** (Selector), **CheckOption** (Casilla), **Switch** (Interruptor), **Swatch** (Muestra de color), **TextArea** (Área de texto), **RadioOption** (Opción única), **RangeSlider** (Deslizador), **DateField** (Campo de fecha), **FileField** (Campo de archivo), **ColorField** (Selector de color), **MeterBar** (Medidor), **Tooltip** (Ayuda emergente), **Menu** (Menú), **MediaFrame** (Marco de medios).

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
- **TextArea** · Área de texto: `ce-textarea`. A multi-line native textarea with the field look.
- **RadioOption** · Opción única: `ce-radio`. A native radio drawn as a ring with an ink dot; one choice per group.
- **RangeSlider** · Deslizador: `ce-range`. A native range with a thin track and an ink thumb.
- **DateField** · Campo de fecha: `ce-input`. A native date, time, month or week field; the pop-up picker belongs to the browser.
- **FileField** · Campo de archivo: `ce-input`, `ce-upload`. A native file input with a secondary-button file selector, or the dashed dropzone.
- **ColorField** · Selector de color: `ce-color`. A native colour input as a square swatch; the pop-up belongs to the browser.
- **MeterBar** · Medidor: `ce-meter`. A native meter: green is good, amber is low, red is critical.
- **Tooltip** · Ayuda emergente: `ce-tooltip`. A short ink hint with role tooltip; never the only place for essential information.
- **Menu** · Menú: `ce-menu`, `ce-menu-item`. A popover menu with role menu and 44px items.
- **MediaFrame** · Marco de medios: `ce-media`. Audio and video keep the browser controls; the frame and caption are ours.

## The consumer supplies

Real products, each with a NAME; supplied prices, discount labels and bases. Nothing in a sample is a live offer.

## Do and don't

- Do say the name, not the look: “Precio Promo”, not “the yellow price”.
- Don't rename a pattern or reuse a name for another one; add a new entry to `recipes/names.mjs` in the same change as its recipe.
