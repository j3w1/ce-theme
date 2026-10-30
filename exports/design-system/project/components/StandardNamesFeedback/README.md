# StandardNamesFeedback

Standard names for feedback and layers: **Badge** (Distintivo), **StatusPill** (Estado), **Pill** (Píldora), **Notice** (Aviso), **Toast** (Notificación), **Progress** (Barra de progreso), **Dialog** (Diálogo), **Disclosure** (Desplegable).

## Classes

- **Badge** · Distintivo: `ce-badge`. A small square label for a short fact; ProductTag is its product-specific form.
- **StatusPill** · Estado: `ce-status`, `ce-status--success`, `ce-status--warning`, `ce-status--danger`, `ce-status--info`. A status with colour and a word, never colour alone.
- **Pill** · Píldora: `ce-pill`. A compact neutral label for roles and densities in tools.
- **Notice** · Aviso: `ce-notice`. An inline message with an icon, a title and a sentence.
- **Toast** · Notificación: `ce-toast`. A short confirmation that disappears.
- **Progress** · Barra de progreso: `ce-progress`. A thin determinate progress bar.
- **Dialog** · Diálogo: `ce-dialog`. A modal window that asks for a decision.
- **Disclosure** · Desplegable: `ce-disclosure`. A native details block that shows or hides content.

## The consumer supplies

Real products, each with a NAME; supplied prices, discount labels and bases. Nothing in a sample is a live offer.

## Do and don't

- Do say the name, not the look: “Precio Promo”, not “the yellow price”.
- Don't rename a pattern or reuse a name for another one; add a new entry to `recipes/names.mjs` in the same change as its recipe.
