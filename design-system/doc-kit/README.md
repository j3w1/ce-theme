# StateFrame documentation kit

`state-frame.css` draws **StateFrame** («Marco de estado»): the documentation frame around one state of a page on a state sheet, with a marker, a title, a one-line note and the page fragment. It is a documentation kit beside CE Theme, not a recipe ([CR-02](https://github.com/j3w1/ce-theme/blob/main/docs/change-requests/CR-02-state-sheet-frame.md)). No application renders a state frame, so the kit is not in `components/bundle.css`, the `@casaelida/vue` styles, the standard names registry or the Components view, and it never carries a product, a price or a control of its own.

- X-2, X-4, X-7 and X-8 are j3w1's decisions of 2026-11-06 ([issue #11](https://github.com/j3w1/ce-theme/issues/11)): the kit sits downstream of the bundle, the marker and the heavy rule use the `size.marker` and `stroke.heavy` tokens, English labels carry `lang="en"`, and the name `StateFrame` is accepted.
- The anatomy, the retired inverse tag, the per-sheet grid, head and notes, and the cue in every frame with simulated data were decided under j3w1's delegation (msg 2026-11-13 12:35, Supervisor recommendation), not j3w1-typed ([issue #11 comment](https://github.com/j3w1/ce-theme/issues/11#issuecomment-6844081160)). j3w1 may veto any of them.

## Load it after the bundle

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="components/bundle.css">
<link rel="stylesheet" href="doc-kit/state-frame.css">
```

The kit needs a bundle that has the `size.marker` and `stroke.heavy` tokens and `ce-demo-cue`, so the frozen workbench boards' copy of the bundle (5 November 2026) cannot load it as it is. Wrap the sheet in `class="ce-scope"`, as every CE Theme region. The kit reads only `--ce-` tokens and styles only its own `ce-state-frame` classes. It places the bundle's `ce-demo-cue` and `ce-badge` inside them and restyles nothing else, so a sheet that loads it renders every recipe exactly as before. The bundle never references the kit.

## Anatomy

```html
<section class="ce-state-frame" aria-labelledby="st-b">
  <header class="ce-state-frame-label">
    <span class="ce-state-frame-mark" aria-hidden="true">B</span>
    <div lang="en">
      <h2 class="ce-state-frame-title" id="st-b">Store change pending <span class="ce-badge" lang="es">Escenario</span></h2>
      <p class="ce-state-frame-note">Old amounts removed; lines kept; <span lang="es">«Actualizando»</span> replaces the link.</p>
    </div>
  </header>
  <div class="ce-state-frame-body">
    <p class="ce-demo-cue" role="note">Demostración — datos y operaciones simulados</p>
    <div>…the page fragment, built from the ordinary recipes…</div>
  </div>
</section>
```

| Class | Part |
| --- | --- |
| `ce-state-frame` | The frame: a thin border on the canvas ground. One per state. |
| `ce-state-frame--wide` | The frame spans every column of the sheet's own grid. |
| `ce-state-frame--band` | No box: a label band with the heavy top rule (`stroke.heavy`) over a full-width page replica or a phone section. |
| `ce-state-frame-label` | The label strip on the subtle ground: the marker, then the title and note. |
| `ce-state-frame-mark` | The decorative ink marker: one or two characters, letters A, B, C in reading order or numbers. It is `size.marker` (28px) tall and at least as wide; text enlarged by the reader widens it into a pill instead of spilling out of it. |
| `ce-state-frame-title` | The frame's heading; it names the frame. |
| `ce-state-frame-note` | One line of secondary text under the title. |
| `ce-state-frame-body` | The cue, then the page fragment, in ordinary block flow. A fragment wider than the body scrolls inside it. |

## Rules

- **One frame per state, named by its title.** The title is a heading: `h2` on a sheet with one `h1`, `h3` when the frame sits in a group headed by an `h2`. The `section` points at it with `aria-labelledby`. The fragment keeps its own headings (CANON R-16, the recorded exception for state sheets); keep them below the frame title's level.
- **The marker is decorative** (`aria-hidden="true"`): the title carries the name. It holds one or two characters, never a word or a status. The inverse rectangular tag of earlier staff sheets, the info pill marker and every other tag are retired in new sheets; there is no tag modifier.
- **«Escenario»** is the existing `ce-badge` inside the title, as a word, never a colour and never only in the notes.
- **Language.** The label is English documentation on a Spanish page: `lang="en"` on the label's text column, `lang="es"` on the badge and on any Spanish string quoted in the note. The fragment is Spanish interface.
- **The body never scales its fragment.** No `zoom`, no `transform`, no reduced copy: the fragment uses the ordinary recipes at their real size. The body is ordinary block flow, so the fragment lays out exactly as it does on its own in a block of the same width; the cue keeps 16px above it. Put the fragment in one element after the cue. The sheet's own grid gives a fixed-width fragment room: a 390px phone replica on a desktop sheet needs a frame 440px wide (24px of body padding on each side and the 1px borders), because the body padding follows the page width, not the frame's.
- **A fragment wider than its body scrolls inside the body.** Some fragments cannot fit the body at a given page width and text size: a code that stays on one line, a wide table, a rail, a fixed-width phone replica. Such a fragment keeps its real size and scrolls horizontally inside `ce-state-frame-body`, so the frame and the page never overflow and the whole fragment stays reachable. It is never shrunk, clipped, wrapped or scaled to fit.
  - Give such a body `tabindex="0"`, `role="group"` and `aria-labelledby` pointing at the frame title. Keyboard users can then focus it, scroll it with the arrow keys and leave it with Tab. The kit draws its focus ring inside the body, where the edge of the page cannot hide it.
  - A scrolling body is a scroll container, so a sticky element in the fragment sticks within the body, not the page.
- **The demonstration cue in every frame with simulated data.** When the fragment shows simulated commercial or staff data (a price, an amount, an availability line, an order, a case, a store or a staff record), the first child of its `ce-state-frame-body` is `<p class="ce-demo-cue" role="note">Demostración — datos y operaciones simulados</p>`, in those exact words. A cue above the frames may be added for the whole sheet, but it never counts as a frame's cue.
- **The named exemption.** A frame with no simulated data (a route shell, a documentation-only fragment) may leave the cue out only when the sheet's notes name it. Write the exemption in the notes as a list after the sentence “Exempt from the demonstration cue (no simulated data):”, one item per frame, each the frame's title without its badge:

  ```html
  <p>Exempt from the demonstration cue (no simulated data):</p>
  <ul><li>Unknown route</li></ul>
  ```

  Any other frame without the cue in its own body is incomplete.
- **What stays with each sheet.** The sheet grid, the sheet head, the notes block and any board strip are the sheet's own markup and CSS; the kit adds no class for them. The sheet's CSS must not restyle the kit's classes or the recipes inside a fragment.
- **No inline styles** on frames, labels or bodies; an empty `style=""` is never left behind.

## Tokens it uses

`--ce-stroke-thin`, `--ce-stroke-heavy`, `--ce-stroke-focus`, `--ce-size-marker`, `--ce-radius-pill`, `--ce-space-2`, `--ce-space-4`, `--ce-space-8`, `--ce-space-12`, `--ce-space-16`, `--ce-space-24`, `--ce-font-size-sm`, `--ce-font-size-body`, `--ce-font-line-tight`, `--ce-font-line-heading`, `--ce-font-line-body`, `--ce-font-weight-bold` and the colours `--ce-color-border-default`, `--ce-color-surface-canvas`, `--ce-color-surface-subtle`, `--ce-color-surface-inverse`, `--ce-color-text-inverse`, `--ce-color-text-secondary`, `--ce-color-focus`. The only literal is the bundle's own `639.98px` phone breakpoint in a media query, where a token cannot be read. Below it the frame drops its side borders and the body padding falls from 24px to 16px.

## Accessibility

The marker is skipped, the title is read and names the frame, and the badge is read as the word «Escenario». The frame chrome has no control, no motion and no state of its own. The one exception is a body that scrolls: it takes keyboard focus, shows the 2px focus ring inside its edge, and is named by the frame title. Controls inside the fragment keep their own focus and target rules. The kit's text pairs, computed from the tokens, are 18.88:1 for the marker (`--ce-color-text-inverse` on `--ce-color-surface-inverse`), 8.39:1 for the note (`--ce-color-text-secondary` on `--ce-color-surface-subtle`) and 17.32:1 for the title on the label strip; the kit test keeps each at 4.5:1 or more.

## The frozen boards

The 251 workbench boards of 5 November 2026 keep their twelve local frame variants as a dated snapshot (X-3). They are not rebuilt or re-synchronised for this kit; new sheets use it.
