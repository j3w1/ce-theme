Casa Elida (Comercial Elida EIRL) is a Peruvian home-goods retailer with stores (“sedes”) in Tacna and Arequipa, selling retail and wholesale, online and through WhatsApp. This system is the shared specification for its ecosystem: the casaelida.com store, CE Systems (retail, inventory, purchasing, logistics, finance, HR, reporting), CE Meta (customer messaging), CE Radio and future applications. It pairs image-led home-retail patterns with Casa Elida's own logos, red and yellow palette, product identity and distinctive prices. Light theme only in this version.

Products are understood through photography first, supported by verified data: NAME, Description, specifications, code, price and availability come from CE Systems and are presented, never invented. Approved decisions are recorded in `decisions.md`; this version has no open proposals for prices, promotions or shared links.

Load `tokens.css`, then `components/bundle.css`, and wrap every region in `class="ce-scope"`. Components are framework-neutral HTML and CSS recipes: there is no JavaScript bundle (optional reference behaviour lives in `recipes/behaviors.mjs` in the repository). Every class starts with `ce-` and every variable with `--ce-`. The recipes never reset the page.

Reference sections bundled with this system: `apply-ce-theme.md` (start here when applying the system), `product-identity.md`, `pricing.md`, `sharing.md`, `accessibility.md`, `coverage.md` (what is implemented, tested or still open), `decisions.md`, `sources.md` and `evolution.md`.

## Content fundamentals

- **Interface copy is Spanish (Peru).** Technical notes are English. Spell the brand `Casa Elida`, never all caps, never abbreviated.
- **Voice:** warm, short and plain. Address the shopper as *tú*. Short declarative sentences, often in pairs: “Que se vea. Que se entienda.” No exclamation marks, no emoji, no superlatives.
- **Taglines from the brand:** “El buen gusto, no cuesta más.” · “Todo lo que hace casa.” · “Diseñamos para la vida en casa.”
- **Casing:** sentence case for headings, buttons and labels (“Ver productos”). Uppercase only for eyebrows (`ce-type-eyebrow`) and the product NAME.
- **Product identity:**
  - **NAME** is the uppercase catalogue name (`MENE`, `WILUL`), bold.
  - **Description** is in Title Case with Spanish connectors lowercase except at the start (`Frasco con Cucharita`, `Taza de Vidrio Resistente al Calor`), regular weight, 1px larger than NAME at 16px.
  - **Specifications** are lowercase except abbreviations, proper names and case-sensitive units (`vidrio/bambú, 450ml`, `cuero PU`, `talla M`).
  - `productView()` applies these rules to supplied values.
- **Information order:** NAME → Description → specifications → price → availability. The code badge is optional on retail cards; internal tools, labels and campaign information cards show it. Show only fields the data supplies.
- **Buttons say what happens:** “Ver productos”, “Añadir al carrito”, “Usar esta tienda”. Errors explain how to continue.
- **Availability is per store, in words:** “Disponible en Tacna”, “Pocas unidades en Arequipa”, “Agotado en Arequipa”.
- **Product codes are strings.**
  - `CE26061509`, `7730744292227` and `CE26031111R12R` keep every character, case and leading zero.
  - Never format a code as a number, split its suffixes, truncate it or replace it with a NAME.
- **Prices:**
  - Write `S/` and the amount with no space, a decimal point and no thousands separator: `S/550`, `S/20`, `S/8.5`, `S/0.05`. Drop trailing zeros; never show `.00`.
  - A previous price reads “Antes S/15.5”. A supplied discount reads once as `−19.35%` (true minus sign).
  - Name the store when prices differ by store (“Precio en Tacna”).
  - Never show `S/0` for a missing price.
- **Never calculate commercial terms.** Display the prices, discounts and offers that are supplied. Do not compute a percentage, a total, a tax or a sale price. Label example prices as examples.

## Visual foundations

### Color

- The page is white: `ce-color-surface-canvas`. Use `ce-color-surface-subtle` for search, chips, category tiles, footers and quiet bands, and `ce-color-surface-inverse` (ink) for the utility bar, badges, markers and ink buttons.
- **Brand red** `ce-color-brand-red` (#E6303D) is for large brand surfaces, logo grounds and large text only: white on brand red is 4.33:1.
  - Primary buttons and any small white text use action red `ce-color-action-primary-bg` (#DA2E3A, 4.74:1), then `-hover` and `-active`.
- **Brand yellow** `ce-color-brand-yellow` (#F9EB10) is the promotion colour: the default offer price block, promo panels and in-grid promotions. It always carries `ce-color-text-primary`, never white.
- **Campaign colours** change per campaign through `--ce-campaign-surface` and `--ce-campaign-text` on the component (`ce-campaign`, `ce-split-promo-panel`, `ce-grid-promo`, `ce-statement`, `ce-tile--light`, `ce-auth-aside`), never by editing global tokens.
  - `.ce-campaign` defaults to action red with white text.
  - Check every pair with `campaignColors()`.
- **Text:**
  - `ce-color-text-primary` for headings, NAME and prices.
  - `ce-color-text-secondary` for Description and supporting text.
  - `ce-color-text-muted` for specifications and notes.
- **Status** colours keep their meaning apart from the brand. Always add a word; colour alone never signals state. Brand red never stands in for an error.
- **Borders:** `ce-color-border-default` is decorative only. Inputs, swatches, choice cards and secondary buttons use `ce-color-border-control` (3:1).

### Type

- One family: Inter (400/600/700/800), with Arial as fallback.
- **Headings** are bold with tight negative tracking. Body copy is 16px on a 1.5 line height.
- **Product text:** set `--ce-product-text` on a container to scale NAME, Description and specs together. The values are 16px in cards, 1.5rem on product pages, 40–52px in share images and 3.9mm on labels.
- **Price:**
  - The price is the largest type in any product composition: weight 800, tracking −0.045em, line height 1.
  - `S/` is 46% of the amount and is raised by default; `ce-price--baseline` is the fallback.
  - Decimals stay full size.
  - Sizes: `ce-type-price-card` (44px) in cards, `ce-type-price-callout` (48px) in callouts, and up to `ce-type-price-campaign` (96px) on photography.
- Eyebrows (`ce-type-eyebrow`, `ce-eyebrow`) are 12px bold uppercase with 0.1em tracking.

### Space and layout

- 4px base scale: `ce-space-2` … `ce-space-96`. Content max width `ce-layout-content` (1440px); gutters 16px, 24px from 640px, 48px from 1024px (`ce-container`).
- **Retail rhythm:**
  - The editorial mosaic uses 12px gaps.
  - Rails use 20px gaps and always show part of the next card.
  - Sections are separated by 40px, and by 64px from 640px.
- **Product grids:** 2 columns below 640px and 3 from 640px. Listings with the filter sidebar show 3 columns from 1024px and 4 from 1300px; without it, 4 from 1024px.
- Prices align to the bottom of cards. Separate sections with white space, not boxes and shadows.
- **Internal tools** use `data-ce-density`:
  - compact: 36px controls, 40px rows;
  - comfortable: the default;
  - touch: 56px controls, for receiving and point of sale.

### Shape, borders and depth

- Photography, cards, tiles and badges are square (`ce-radius-none`).
- Pills (`ce-radius-pill`) are for buttons, icon buttons, chips, search and category links.
- The code badge has a 0.2em radius (`ce-radius-code` reference 3px).
- Other radii:
  - `ce-radius-small` (4px) for inputs and choice cards;
  - `ce-radius-price` (8px) for offer and sale price blocks;
  - `ce-radius-callout` (20px) for floating product callouts.
- No drop shadows and no gradients except the photo scrim.

### Imagery

- Catalogue photos sit complete on white in square frames with `object-fit: contain`; never crop a catalogue product.
- Lifestyle photos may be cropped (`--ce-x`, `--ce-y` focal point) without misrepresenting the product.
- When no approved lifestyle photo exists, `ce-tile--light` places the catalogue cut-out on a campaign surface.
- Keep essential text inside an 8% safety margin (10% at the top of 9:16 stories).
- On web surfaces, NAME, codes and prices stay live HTML over the photo, never baked into the image.
- The images in Assets → References are historical or reference material; their embedded prices are not current offers.

### States and motion

- Focus is a 2px solid outline (`ce-stroke-focus`, `ce-color-focus`) with a 3px offset on every interactive element. On photography and the black utility bar, the outline turns white with an ink halo.
- Hover darkens fills or adds the subtle surface. Selected chips, category links, variants and choice cards gain an ink ring (`aria-pressed`, `aria-current`, `:checked`). Pressed favourites fill the heart.
- Motion is limited to quick colour and transform transitions (`ce-motion-quick`, 160ms), removed under reduced motion. No autoplay; rails never auto-advance.
- Targets are 44–48px tall, 40px for card actions, never under 24px.

## Tagging products on photography

Customers must be able to tell which product is priced and what is being described. On any photo that shows more than one product, or a feature worth naming:

- **On the website, use pins:** mark each product with a `ce-pin`, a 28px black dot with a white centre. Hovering, focusing or tapping it opens a white card with NAME, Description, the store's price and a chevron link to the product. Run `enhancePins()` for tap-to-open and to keep each card inside the photo.
- **On media that cannot hover** (social posts, print, share images), mark each product with a lettered `ce-hotspot` instead.
  - A marker is a 32px black circle with a bold white capital letter `A`, `B`, `C` in reading order.
  - It has no period, no white ring and no promotional colour.
  - Focus adds a separate outline and halo.
- **Answer the pins and markers with a `TagList`** next to or below the photo: the same letter, then NAME, Description, specs, price and availability for each product. The photo is never the only place a name or price appears.
- **Hiding markers:** a “Mostrar etiquetas” toggle may hide pins and markers (`data-ce-markers="hidden"`); the list stays.
- **Features:** name a feature with a `ce-feature-tag`, using only supplied attributes. Show a hidden detail with a round `ce-detail-inset`.
- **Single product:** for one product on a campaign photo, use the white `Callout` with the speech-bubble tail (`ce-callout--bubble`).
- **Limits:** a marker letter is not a variant code. Use at most about five markers and three feature tags per image.

## Shared links

A shared link shows the `ShareCard`: a 1200 × 630 image that never carries a price, because prices differ by store and change.

- **Product links:** the catalogue photo fills the centre square, NAME, Description and specs sit in the left band and the wordmark in the right band, so a square crop shows only the product.
- **Other page types:** category, collection and campaign links use an eyebrow and a title. Home and store links use the brand surface.
- **Scale:** the card is tested at chat size (about 300px wide) and as a centre-square crop.
- Metadata rules are in `sharing.md`.

## Campaign conventions

Instagram campaigns use full-bleed lifestyle photography, the script wordmark, large titles and seasonal devices. Treat these as campaign treatments; product interfaces keep Inter, the token palette and the recipes. Campaign colours are set per campaign through the campaign variables, not by changing tokens. A REBAJAS sale uses `ce-price--sale` (red block, white text) and a campaign surface.

## Logo

- **Files:** use the supplied files in Assets → Logos unchanged.
  - `logo-wordmark-color.png`: default, on white and light surfaces.
  - `logo-wordmark-black.png`: monochrome black, for quiet treatments, receipts and labels.
  - `logo-wordmark-white-yellow.png`: on brand red and dark photography.
  - `logo-on-white.jpg`, `logo-on-yellow.jpg`, `logo-on-red.png`: lockups on their grounds.
  - `logo-matte-red.jpg`, `logo-matte-red-tagline.jpg`: matte red, the latter with “Regalos Decoración y Hogar”.
  - `logo-square-red.jpg`: square red-ground lockup for avatars and app icons.
- **Usage:**
  - Choose the file made for the background; never redraw, recolour, stretch or add effects.
  - Minimum width is 96px on screen and 18mm in print.
  - Clear space equals the height of “Casa”.

## Iconography

- Original outlined icons on a 24px grid, 1.7px stroke, round caps and joins, no fill (Assets → Icons). Draw them inline with `stroke="currentColor"`.
- Icons accompany words or carry an accessible name. Decorative icons get `aria-hidden="true"`. Social platforms are named in text, not drawn with their marks.
- No emoji.

## Standard names

Every pattern has one stable English id for code and designs and one Spanish name for people: **PricePromo** (Precio Promo) is the yellow price, **ProductIdentity** (Identidad) is NAME, Description and specs, **ProductStack** (Pila de producto) is the full vertical order and spacing of a product, **CECode** (Código CE) is the black one-line code badge, **PriceUnit** (Unidad: “cada uno” / “c/u”), **PricePresentation** (Presentación: “/pack de 12”), **PriceOld** (Precio anterior) and **DiscountLabel** (Etiqueta de descuento). Say the name, not the look. Every product shown anywhere must have a NAME. The full registry, with a Muestra for each name, is in the Components view under the group “Standard names” (`StandardNamesProduct`, `StandardNamesPrices`, `StandardNamesSurfaces`, `StandardNamesPhotos`, `StandardNamesStore`, `StandardNamesOutputs`, `StandardNamesInterface`, `StandardNamesFeedback`, `StandardNamesNavigation`) and in `names.md`; the source is `recipes/names.mjs`.

## Components

- **Actions:** `Button`, `IconButton`, `Link`, `Chip`.
- **Forms:** `Field`, `FormControls`, `Swatch`.
- **Feedback and interface:** `Badge`, `Status`, `Overlays`.
- **Retail navigation:** `SiteHeader`, `CategoryRail`, `Footer`.
- **Retail discovery:** `Mosaic`, `Rail`, `FilterBar`.
- **Commerce and product:** `ProductCode`, `Price`, `Specs`, `ProductCard`, `Callout`, `PhotoPanel`, `ProductDetail`, `StoreContext`.
- **Tagging:** `TaggedMedia`, `TagList`.
- **Customer journeys:** `Cart`, `Account`.
- **Workspace:** `AppShell`, `RecordEditor`, `Table`.
- **Print:** `Label`.
- **Sharing:** `ShareCard`.
- **Standard names:** nine cards, one per group of names, each with a sample.
- **CE Radio (an application built on ce-theme):** `RadioPlayer`, `RadioStates`, `RadioPlaylists`, `RadioAdmin`. They show the real CE Radio window (DOM and stylesheets captured from the app), not new recipes: CE Radio uses the ce-theme recipes and draws its player-only parts with `--ce-*` tokens.
- **Cover:** the system cover card.

Each component's guidelines list its classes and what the consumer supplies. Behaviour and data belong to the consuming application: CE Systems and the commerce services own records, prices, stock, permissions and workflows. A hidden or disabled control is presentation, not authorization.
