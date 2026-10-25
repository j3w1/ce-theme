# CE Radio theme

The dark theme for CE Radio, Casa Elida's in-store music and announcement player for Windows. It formalises the player's existing "station" look as part of the Casa Elida foundation: charcoal and warm white, with the brand yellow and red used as signals, never as a flood.

**Status:** theme defined and tested in `ce-theme`; adoption in the CE Radio application is pending the owner's review. The CE Radio Admin sidebar and its password prompt keep their own pinned theme (owner decision, 2026-10-12) and are out of scope.

## What it contains

| Output | Use |
| --- | --- |
| `color.radio.*` tokens (`--ce-color-radio-…`) | Station palette and the Christmas look (`color.radio.navidad.*`). Contrast pairs are validated in `ce-theme.json`. |
| `exports/radio.css` | `[data-ce-theme="radio"]` scope that turns the shared recipes dark, and `ce-radio-*` classes for the player's own surfaces. Used by the reference site and the Claude Design system. |
| `exports/adapters/ce-radio.css` | Drop-in values for CE Radio's existing `--station-*` variables. CE Radio adopts the theme without renaming its classes. |
| `public/assets/logo-ce-radio.png` | The CE Radio badge, byte-identical to CE Radio's `icon-512.png`. |

## Palette and roles

| Token | Value | Role | Contrast |
| --- | --- | --- | --- |
| `color.radio.bg` | `#1D1B19` | Player background | — |
| `color.radio.chrome` | `#161412` | Window title strip | — |
| `color.radio.surface` | `#262320` | Buttons, chips, cards | — |
| `color.radio.raised` | `#302C28` | Hover and pressed | — |
| `color.radio.line` | `#3A3530` | Decorative dividers and outlines | Decorative only |
| `color.radio.control` | `#776E64` | Control boundaries | 3.1:1 on surface |
| `color.radio.text` | `#F3EDE2` | Primary text | 11.9:1 on raised |
| `color.radio.muted` | `#B3AA9C` | Secondary text | 6.8:1 on surface |
| `color.radio.faint` | `#A0978A` | Small supporting text: times, neighbour songs, hints | 5.4:1 on surface |
| `color.radio.signal` | `#F9EB10` (brand yellow) | Music: live dot, song progress, next SPOT, focus | 11.2:1 on raised |
| `color.radio.alert` | `#E46B63` | SPOT on air, alerts, offline | 4.9:1 on surface |
| `color.radio.ok` | `#7F9C86` | Added files; the Navidad group | 5.2:1 on surface |

The Christmas look (`color.radio.navidad.*`) swaps the background, surfaces and lines to snowy pine and adds a pine accent (`#8CC79C`), a decorative red (`#D8383F`, never text) and snow white. It applies only while a Christmas playlist is confirmed playing. SPOT, pause and alert signs keep their own yellow and red, so every state stays truthful.

## Changes from the current CE Radio look

The theme keeps CE Radio's layout, components and owner-approved decisions. It changes values where the foundation's rules require it:

| Item | CE Radio today | Theme | Why |
| --- | --- | --- | --- |
| Faint text | `#7D756A`, 3.8:1 | `#A0978A`, 5.4–6.0:1 | Song times and neighbour-song labels are 10–11px text and need 4.5:1. |
| Alert red | `#B9504A`, 3.5:1 | `#E46B63`, 4.9–5.4:1 | The same red marks text (“El reproductor no responde”) and small icons; it also fell below 3:1 on raised surfaces. |
| Signal yellow | `#FBD900`, sampled from the badge | `#F9EB10`, the Casa Elida palette yellow | One brand yellow across Casa Elida; the difference is barely visible at 14–80% opacity. |
| Control boundary | none (only `#3A3530` lines, 1.4:1) | `color.radio.control`, 3.1:1 | Inputs and checkboxes need a 3:1 boundary. Round icon buttons can keep the quiet line; their icons carry the contrast. |
| Typeface | Public Sans | Inter (the Casa Elida typeface) | One family across the ecosystem. CE Radio must bundle the Inter files, because its content policy allows only local fonts. |
| Close button hover | the alert red | `color.action.primary.bg` with white | White text on a red fill needs 4.5:1. |

## States

| Player state | Sign |
| --- | --- |
| Tuning in | Dashed muted ring; calm waves from the badge. |
| Live | Yellow progress arc and live dot; gentle waves. |
| Next SPOT due | Solid yellow ring; yellow SPOT line. |
| SPOT on air | Red ring; red SPOT line; the music arc steps back. |
| Restoring volume | Warm-white dashed ring; waves return to the badge. |
| Paused (Admin) | Dashed muted ring; badge desaturated. |
| Alert or offline | Red ring; red sign with one large Reintentar. |
| File notices | Small badge on the stage: yellow (checking, folder), pine (added), red (invalid). |

Colour never stands alone: each state also has a status line in Spanish, and with reduced motion every animated sign has a still alternative.

## Rules

- The CE Radio badge is shown whole and contained: never cropped to a circle, recoloured, redrawn or dragged. Below 120px wide the full badge loses legibility; Windows icon sizes accept that until a compact mark is approved.
- Yellow and red are signals: dots, rings, thin fills and tinted surfaces at 14–22%. Large yellow or red fills are reserved for the Reintentar call to action and the close button hover.
- One readable status line under the badge; file names appear only on the SPOT line.
- Window sizes: 480 × 360 and 480 × 320. The badge stage gives up height first; rows below it never move.
- Interface text is Spanish; this documentation is English.

## Adopting it in CE Radio

1. Copy `exports/adapters/ce-radio.css` into the renderer styles and replace the `:root` block of `src/renderer/styles/tokens.css` with an import of it. The variable names are unchanged.
2. Bundle Inter 400/600 locally (for example the `fonts/inter/` files with their OFL notice), and replace the Public Sans imports.
3. Point the close button hover at `--station-action`, and use `--station-control` for any input or checkbox boundary in the player view.
4. Remove the Christmas literal colours from `user.css` in favour of the adapter's `.ce-player.is-christmas` values.
5. Run CE Radio's own checks and Windows runner suites; record the evidence there.

These steps change a separate, private application and need the owner's approval; this repository does not modify it.
