# DemoCue

The demonstration cue (Aviso de demostración): a bordered note at the top of the main content that says, in words, that the data and the operations shown are simulated.

## Classes

- `ce-demo-cue`: one block form, no modifiers. Small bold ink text at the heading line height, inside a 2px ink border (`ce-stroke-focus`, reused) with 8px × 12px padding. As wide as its words, never wider than its container, inside which it wraps. No margin, no background and no text of its own.

## The consumer supplies

- The words. CE Theme's examples and the design workbench use exactly «Demostración — datos y operaciones simulados», with an em dash (U+2014); an application's demonstration mode may say that its data is simulated in its own words.
- `role="note"` on the element, and `lang="es"` when the surrounding page is in another language.
- The space around it: the page places it and sets its margins.

## Do and don't

- Do put it first in the main content of every page that shows simulated data, before the page header or the `h1` (breadcrumbs may come first).
- Do put one inside every frame of a state sheet that shows simulated commercial or staff data. A cue for the whole sheet may be added above the frames, but it never replaces a frame's cue; a frame with no simulated data needs none.
- Do leave it out of production output entirely. Don't hide it with CSS, `hidden` or `aria-hidden` instead.
- Don't draw it as a pill, a badge or a quiet strip, and don't add a modifier for them.
- Don't use it in place of the «Escenario» label of a scenario frame, or as a status, a button or a link.

The full rule is in `names.md` (“Demonstration cue”).
