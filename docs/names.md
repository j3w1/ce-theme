# Standard names

Every Casa Elida pattern has one name, used the same way in ce-theme, every CE app, designs and conversation. The registry is `recipes/names.mjs` (`NAMES`, `nameById()`); this page is its reading copy and a test keeps the two in step.

## Convention

- **Two names per pattern.** `Id` is the stable English identifier in PascalCase, for code, designs and tickets (`PricePromo`). **Nombre CE** is the Spanish name people say (“Precio Promo”). Both mean exactly one pattern.
- **Say the name, not the look.** “Use a Precio Promo” rather than “the yellow price”. Yellow means promotion only, so the yellow price is the Precio Promo.
- **A variant extends its base.** `Price` + role: `PriceRegular`, `PricePromo`, `PriceSale`, `PricePhoto`, `PricePack`, `PriceUnit`, `PriceHistory`. `Product` + part: `ProductName`, `ProductDescription`, `ProductSpecs`, `ProductIdentity`, `ProductStack`, `ProductTag`.
- **Names are stable.** Never reuse a name for another pattern and never rename one silently. A retired name stays in this page with the name that replaces it.
- **New pattern, new name.** Add the entry to `recipes/names.mjs` and this page in the same change as its recipe, and give it a card in the design system.

## Product NAME

Every product shown on any Casa Elida surface must have a **NAME**; `productView()` refuses a product without one. A NAME is invented, not descriptive: one or two uppercase words, three to eight letters each, pronounceable in Spanish, unique across the catalogue, never a real word, brand or person, and never a translation of the Description (MENE, NOME, TILEN, TALEN). Sizes and variants of the same Description each get their own NAME. The NAME is the first line of the product identity; the Description and specs follow it.

## Product display stack

The **ProductStack** (Pila de producto) is the one vertical order and spacing for a product on cards, lists, details and tools. Top to bottom: ProductTag, CECode, ProductName, ProductDescription, ProductSpecs, price, StockLine. The gaps are tokens (`size.product.*`):

| Between | Token | Value |
| --- | --- | --- |
| Photo and the first text line | `size.product.gap-media` | 16px |
| ProductTag and what follows | `size.product.gap-flag` | 4px |
| CECode and ProductName | `size.product.gap-code` | 8px |
| NAME, Description and specs | `size.product.gap-identity` | 2px |
| Specs and the price | `size.product.gap-price` | 12px |
| Price and StockLine or StoreNote | `size.product.gap-note` | 8px |

The price follows the specs at the same gap on every card. Never push it to the bottom of a tall card, and never add space to line prices up across cards.

## CECode

The **CECode** (Código CE) is white bold text on ink with tabular figures, padding 0.3em × 0.35em and a 2px corner (`radius.code`). It is always one line: `white-space: nowrap`, no hyphenation, no wrapping, in every context; the container gives it room, never the other way round. Sizes: `ce-code--sm` 12px for dense tables, default 14px for cards, lists and tools, `ce-code--lg` 16px for product pages, 3mm on the gondola label and 26px on the share card. The code is a string, never a number.

## Price styles and the price basis

- **Currency styles.** The default **CurrencyBaseline** (S/ en línea base) sets a small S/ on the baseline of the figures. The second option is **CurrencyJoined** (S/ unido), where S/ has the size of the figures and is attached to them (`ce-price--joined`). **CurrencyRaised** (S/ elevado, `ce-price--raised`) stays a supported variant.
- **PriceBasis** (Base del precio) is the short bold text that leans to the top after the price and says what it covers. It has two kinds that must not be mixed up:
  - **PriceUnit** (Unidad): “cada uno”, a general, direct way to say the price is for one piece. When a card or block is narrow it shows its short form “c/u” (`ce-price-unit-short`, switched by the card width or `ce-price-unit--short`).
  - **PricePresentation** (Presentación): the selling format the price is for, written after a slash: `/pack de 12`, `/par`. It identifies what is sold. It replaces the earlier name PricePack.
- In **PricePromo** and **PriceSale** the colour box surrounds only the **PriceAmount** (S/ and the figures); the basis stays outside it.
- **PriceOld** (Precio anterior) is “Antes” with the struck price; the **DiscountLabel** (Etiqueta de descuento) is the supplied percentage in red, tight around its text. The earlier name was PriceHistory.

## Add to cart

**AddToCart** (Añadir al carrito) is an icon button that appears only when a product card is hovered or focused. On touch and narrow screens it is replaced by a full-width “Añadir al carrito” button at the bottom of the card.

## Registry

Generated from `recipes/names.mjs` by `pnpm generate`; do not edit between the markers.

<!-- registry:start -->
### Producto

| Id | Nombre CE | Recipe | Rule |
| --- | --- | --- | --- |
| `ProductName` | NAME | `ce-product-name` | Mandatory on every product shown anywhere. Uppercase invented catalogue name, one or two words, unique (MENE, TILEN). |
| `ProductDescription` | Descripción | `ce-product-description` | Title Case, Spanish connectors in lowercase. Second line of the identity. |
| `ProductSpecs` | Especificaciones | `ce-product-specs` | Lowercase except units and abbreviations. Third line of the identity. |
| `ProductIdentity` | Identidad | `ce-product-heading` | NAME, then Description, then specs, at size.product.gap-identity. |
| `ProductStack` | Pila de producto | `ce-product-info` | Tag, CE code, identity, price, note, with the size.product gaps. The price follows the specs at 12px and is never pushed to the bottom. |
| `CECode` | Código CE | `ce-code`, `ce-code--sm`, `ce-code--lg` | White bold text on ink, 2px corners, tabular figures. Always one line; never wraps. |
| `ProductTag` | Etiqueta de producto | `ce-badge--novedad`, `ce-badge--promo`, `ce-badge--top`, `ce-badge--limited`, `ce-product-flag` | Novedad (green), Promo (amber), Top en ventas (crimson), Edición limitada (black). |

### Precios

| Id | Nombre CE | Recipe | Rule |
| --- | --- | --- | --- |
| `PriceRegular` | Precio normal | `ce-price` | Ink on white, S/ in the baseline style by default. |
| `CurrencyBaseline` | S/ en línea base | `ce-price-currency` | The default: S/ at 46% of the figures, sitting on their baseline. |
| `CurrencyJoined` | S/ unido | `ce-price--joined` | The second option: S/ at the size of the figures, attached to them (S/10). |
| `CurrencyRaised` | S/ elevado | `ce-price--raised` | A supported variant: S/ small at the top of the figures. |
| `PriceAmount` | Cifra del precio | `ce-price-amount` | S/ and the figures together. In Promo and Rebajas prices the colour box surrounds only the amount, never the basis beside it. |
| `PricePromo` | Precio Promo | `ce-price--offer` | The yellow price block: a promotion or discount price. Yellow means promotion and nothing else. |
| `PriceSale` | Precio Rebajas | `ce-price--sale` | The red price block for REBAJAS campaigns. |
| `PricePhoto` | Precio sobre foto | `ce-price--inverse` | White price on photography protected by an overlay. |
| `PriceBasis` | Base del precio | `ce-price-basis` | Short bold text leaning to the top after the price that says what it covers: a unit (cada uno) or a presentation (/pack de 12). |
| `PriceUnit` | Unidad | `ce-price-unit`, `ce-price-unit-short` | “cada uno”: the price is for one piece. Short form “c/u” when the card or block is narrow. |
| `PricePresentation` | Presentación | `ce-price-presentation` | The selling format the price is for, after a slash: /pack de 12, /par. It identifies what is sold; it is not a per-piece qualifier. Retired name: PricePack. |
| `PriceOld` | Precio anterior | `ce-price-history` | “Antes” with the struck previous price, then the DiscountLabel. Retired name: PriceHistory. |
| `DiscountLabel` | Etiqueta de descuento | `ce-discount` | The supplied discount percentage in red, tight around its text. Never calculated. |

### Superficies

| Id | Nombre CE | Recipe | Rule |
| --- | --- | --- | --- |
| `ProductCard` | Tarjeta de producto | `ce-product` | Photo, then the ProductStack. No borders, shadows or rounded corners. |
| `AddToCart` | Añadir al carrito | `ce-product-add`, `ce-icon-button--action` | On hover-capable screens an icon button appears on card hover or focus; on touch and narrow screens a full-width button sits at the bottom of the card. |
| `ProductCallout` | Tarjeta flotante | `ce-callout` | White floating card with a photo, identity and price for editorial pieces. |
| `Mosaic` | Mosaico | `ce-mosaic` | Editorial grid of tiles; one large tile, one wide, two small. |
| `MosaicTile` | Baldosa | `ce-tile`, `ce-tile--light` | One link in a mosaic. Neutral surface; yellow never sits behind or over a product photo. |
| `PromoTile` | Baldosa Promo | `ce-tile-offer` | A tile with the Promo tag and the supplied offer price in the yellow block. |
| `PromoPanel` | Panel Promo | `ce-statement`, `ce-grid-promo` | A campaign surface in brand yellow with ink text, for a promotion or campaign message. |

### Fotos

| Id | Nombre CE | Recipe | Rule |
| --- | --- | --- | --- |
| `TaggedPhoto` | Foto etiquetada | `ce-tagged-media` | Photo frame with markers and feature tags; clips anything outside it. |
| `Marker` | Marcador | `ce-hotspot` | Black circle with a white capital letter A, B, C. |
| `FeatureTag` | Rótulo | `ce-feature-tag` | Dot on the feature, a leader line and a label for it; the label sits in the empty area of the photo, stays inside it and never overlaps. |

### Tienda

| Id | Nombre CE | Recipe | Rule |
| --- | --- | --- | --- |
| `StockLine` | Disponibilidad | `ce-stock` | Per-store availability in words, with a state dot. |
| `StoreNote` | Nota de tienda | `ce-store-note` | Short store-specific text that replaces a missing price. |
| `StoreContext` | Tienda activa | `ce-store-context` | The button that shows and changes the chosen store; prices and availability follow it. |

### Salidas

| Id | Nombre CE | Recipe | Rule |
| --- | --- | --- | --- |
| `GondolaLabel` | Etiqueta de góndola | `ce-label` | 80 × 40 mm: NAME, Description, specs, price (the largest). |
| `ShareCard` | Tarjeta para compartir | `ce-share-card` | 1200 × 630 price-free link preview. |

### Interfaz

| Id | Nombre CE | Recipe | Rule |
| --- | --- | --- | --- |
| `ButtonPrimary` | Botón principal | `ce-button` | Action red with white text: the one main action of a view. |
| `ButtonSecondary` | Botón secundario | `ce-button--secondary` | White with a control border, for the other actions. |
| `ButtonInk` | Botón oscuro | `ce-button--ink` | Ink with white text, for neutral strong actions. |
| `IconButton` | Botón de ícono | `ce-icon-button` | A round icon-only button; always has an accessible name. |
| `Chip` | Filtro rápido | `ce-chip` | A pill toggle or filter; pressed state shows an ink ring. |
| `TextLink` | Enlace | `ce-link` | Bold, underlined text link in ink. |
| `TextField` | Campo de texto | `ce-field`, `ce-input` | A label above a bordered input. |
| `SelectField` | Selector | `ce-select` | A native select with the input styling. |
| `CheckOption` | Casilla | `ce-check` | A checkbox with its label in one tap target. |
| `Switch` | Interruptor | `ce-switch` | An on/off setting that applies at once. |
| `Swatch` | Muestra de color | `ce-swatch` | A round colour choice; the name is in its accessible label. |

### Retroalimentación

| Id | Nombre CE | Recipe | Rule |
| --- | --- | --- | --- |
| `Badge` | Distintivo | `ce-badge` | A small square label for a short fact; ProductTag is its product-specific form. |
| `StatusPill` | Estado | `ce-status`, `ce-status--success`, `ce-status--warning`, `ce-status--danger`, `ce-status--info` | A status with colour and a word, never colour alone. |
| `Pill` | Píldora | `ce-pill` | A compact neutral label for roles and densities in tools. |
| `Notice` | Aviso | `ce-notice` | An inline message with an icon, a title and a sentence. |
| `Toast` | Notificación | `ce-toast` | A short confirmation that disappears. |
| `Progress` | Barra de progreso | `ce-progress` | A thin determinate progress bar. |
| `Dialog` | Diálogo | `ce-dialog` | A modal window that asks for a decision. |
| `Disclosure` | Desplegable | `ce-disclosure` | A native details block that shows or hides content. |

### Navegación

| Id | Nombre CE | Recipe | Rule |
| --- | --- | --- | --- |
| `Breadcrumbs` | Ruta de navegación | `ce-breadcrumbs` | Where the page sits: Inicio, section, current page. |
| `SiteNav` | Navegación principal | `ce-site-nav` | The main sections of the store. |
| `SearchField` | Buscador | `ce-search` | The product search field. |
| `CategoryTile` | Categoría con foto | `ce-category-tile` | A photo tile with a label that links to a category. |
| `ModuleNav` | Navegación de módulos | `ce-module-nav` | The side navigation of CE apps, grouped by module. |
| `PageHeader` | Encabezado de página | `ce-page-header` | The title of a tool page with its main actions. |
| `DataTable` | Tabla de datos | `ce-data-table` | Dense, sortable table for tools; numbers right-aligned. |
| `BulkBar` | Barra de selección | `ce-bulk-bar` | Appears when rows are selected, with actions for the selection. |
<!-- registry:end -->
