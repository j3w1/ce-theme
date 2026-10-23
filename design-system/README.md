Casa Elida is a Peruvian home-goods retailer. The system pairs IKEA-inspired clarity, generous white space, product photography and strong hierarchy with Casa Elida's own logos, red and yellow palette, product codes and distinctive prices. It serves retail first (catalogue, product cards, campaigns), then internal tools, marketing and in-store signage. Light theme only in this version.

Load `tokens.css`, then `components/bundle.css`, and wrap every region in `class="ce-scope"`. Components are framework-neutral HTML and CSS recipes: there is no JavaScript bundle. Every class starts with `ce-` and every variable with `--ce-`. The recipes never reset the page.

## Content fundamentals

- **Interface copy is Spanish (Peru).** Technical notes are English. Spell the brand `Casa Elida`, never all caps, never abbreviated.
- **Voice:** warm, short and plain. Address the shopper as *tú*. Short declarative sentences, often in pairs: “Que se vea. Que se entienda.”, “La misma marca. En cada formato.” No exclamation marks, no emoji, no superlatives.
- **Taglines from the brand:** “El buen gusto, no cuesta más.” · “Todo lo que hace casa.” · “Diseñamos para la vida en casa.”
- **Casing:** sentence case for headings, buttons and labels (“Ver productos”, “Conocer más”). Uppercase only for eyebrows (`ce-type-eyebrow`) and catalogue model names (MENE, NOME, TILEN).
- **Buttons say what happens:** “Ver productos”, “Explorar el catálogo”, “Buscar un producto”. Errors explain how to continue: “Escribe un correo completo, por ejemplo: nombre@ejemplo.com.”
- **Product information order:** product code → model or name → description → material, capacity or size → price. Show only fields the data supplies; never invent a code, size or price.
- **Product codes are strings.** `CE26061509`, `7730744292227`, `CE26031111R/12R` keep every character, case, separator and leading zero. Never format them as numbers, truncate them or replace them with a model name.
- **Prices** read `S/` + amount with no space, a decimal point and no thousands separator: `S/550`, `S/20`, `S/8.5`, `S/0.05`. Drop trailing zeros; never show `.00`. A previous price reads “Antes S/16.5”. A supplied discount reads once as `−31.25%` (true minus sign). Quantity qualifiers such as “cada uno” sit beside the amount.
- **Never calculate commercial terms.** Display the prices, discounts and offers the brief supplies. Do not compute a percentage, a tax or a sale price, and label example prices as examples (“Precio de ejemplo”).

## Visual foundations

### Color

- The page is white: `ce-color-surface-canvas`. Use `ce-color-surface-subtle` for chips, table headers and quiet bands, and `ce-color-surface-inverse` (ink) for dark bars, badges and ink buttons.
- Brand red `ce-color-brand-red` (#E6303D) is for large brand surfaces, logo grounds and decoration. It is **not** a small-text button fill. Primary buttons use `ce-color-action-primary-bg` (#DA2E3A) with `ce-color-action-primary-text`, then `-hover` and `-active`.
- Brand yellow `ce-color-brand-yellow` (#F9EB10) is reserved for offers and promotional panels. It always carries `ce-color-text-primary`, never white.
- Text: `ce-color-text-primary` for headings and body, `ce-color-text-secondary` for supporting paragraphs, `ce-color-text-muted` for details, notes and captions. All three pass 4.5:1 on canvas and subtle.
- Status colors keep their meaning apart from the brand: danger, success, warning and info each have a `-text` and `-bg` pair. Always add a word or icon; color alone never signals state. Brand red never stands in for an error.
- Borders: `ce-color-border-default` is decorative only. Inputs, selects, swatches and secondary buttons use `ce-color-border-control` (3:1).
- Photography text uses `ce-color-text-inverse` over the `ce-color-overlay` gradient. Validate every final crop; a text shadow alone is never enough.

### Type

- One family: Noto Sans (variable, weights 400/600/700/800), with Arial as fallback. No second display face.
- Headings are bold (`ce-type-hero`, `ce-type-heading`, `ce-type-title`) with tight negative tracking (−0.035em). Body copy is `ce-type-body`, 16px on a 1.5 line height. Details and notes are `ce-type-small` in muted.
- The price is the largest type in any product composition: weight 800, tracking −0.045em, line height 1. The `S/` prefix is 46% of the amount and aligns to its top; decimals stay full size. Use `ce-type-price-card` (44px) in cards, `ce-type-price-callout` (48px) in callouts and up to `ce-type-price-campaign` (96px) on photography.
- Eyebrows (`ce-type-eyebrow`) are 12px bold uppercase with 0.1em tracking.

### Space and layout

- 4px base scale: `ce-space-2` … `ce-space-96`. Buttons pad `ce-space-12` × `ce-space-24`; product grids gap `ce-space-16` columns and `ce-space-48` rows on mobile, then `ce-space-24` columns from 640px.
- Content max width `ce-layout-content` (1440px). Gutters `ce-layout-gutter-mobile` 16px, `-tablet` 24px from 640px, `-desktop` 48px from 1024px.
- Product grids: 2 columns below 640px, 3 from 640px, 4 from 1024px. Cards have no fixed height; prices align to the bottom.
- Layouts are open and airy: white space separates sections instead of boxes and shadows.

### Shape, borders and depth

- Square by default (`ce-radius-none`) for photography, product codes and badges. Pills (`ce-radius-pill`) for buttons, icon buttons, chips and swatches. `ce-radius-small` (4px) for inputs, `ce-radius-price` (8px) for offer price blocks, `ce-radius-callout` (20px) for floating product cards.
- No drop shadows and no gradients except the photo scrim. Separate with white space, `ce-color-border-default` hairlines (`ce-stroke-thin`) or a change of surface.

### Imagery

- Product photos sit complete on white in square frames with `object-fit: contain`; never crop a product.
- Campaign photography shows products in use in real homes. Keep essential text inside an 8% safety margin (10% at the top of 9:16 stories).
- On web surfaces, codes, names and prices stay live HTML over the photo, never baked into the image.
- The supplied campaign images in Assets are composition references; their embedded prices are not current offers.

### States and motion

- Focus: `ce-stroke-focus` (2px) solid `ce-color-focus` outline with a `ce-stroke-offset` (3px) offset, on every interactive element.
- Hover darkens fills (`ce-color-action-primary-hover`) or adds a subtle surface (`ce-color-surface-subtle`). Selected chips and swatches gain an ink ring (`aria-pressed`, `aria-current`). Disabled controls drop to 45% opacity.
- Motion is limited to quick color and border transitions (`ce-motion-quick`, 160ms), removed under reduced motion. No autoplay.
- Targets are 44–48px tall.

## Logo

- Use the supplied files in Assets → Logos unchanged: `logo.png` (transparent wordmark) and `logo-brand.jpg` (red-ground lockup). Never redraw, recolor, stretch or add effects.
- Minimum width 96px. Clear space equals the height of “Casa” on every side.
- The transparent wordmark keeps its original warmer red and yellow; the interface palette was sampled from the red-ground lockup.

## Iconography

- Original outlined icons on a 24px grid, 1.7px stroke, round caps and joins, no fill (Assets → Icons). Draw them inline with `stroke="currentColor"` so they take the text color; the SVG files in Assets are drawn in ink `#111111`.
- Icons accompany words or carry an accessible name (`aria-label` on `ce-icon-button`). Decorative icons get `aria-hidden="true"`.
- No emoji. Simple text glyphs (✓, ↗) are acceptable inside status text.

## Components

Actions: `Button`, `IconButton`, `Link`, `Chip`. Forms: `Field`, `Swatch`. Feedback: `Badge`, `Status`. Commerce: `ProductCode`, `Price`, `ProductCard`, `Callout`, `PhotoPanel`. Data: `Table`. Each component's guidelines list its classes and the markup the consumer supplies. Behaviour (navigation, cart, validation, filters) belongs to the consuming application; a class never implements an action.

Further sections: `pricing.md` (product identifiers and price display contract) and `accessibility.md` (WCAG 2.2 AA baseline).
