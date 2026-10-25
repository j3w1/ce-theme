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

## Registry

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
| `PriceRegular` | Precio normal | `ce-price` | Ink on white; raised S/ by default (fallback: ce-price--baseline). |
| `PricePromo` | Precio Promo | `ce-price--offer` | The yellow price block: a promotion or discount price. Yellow means promotion and nothing else. |
| `PriceSale` | Precio Rebajas | `ce-price--sale` | The red price block for REBAJAS campaigns. |
| `PricePhoto` | Precio sobre foto | `ce-price--inverse` | White price on photography protected by an overlay. |
| `PricePack` | Precio por pack | `ce-price-pack` | The supplied basis after a slash, bold, on the baseline of the figures: /pack de 12. |
| `PriceUnit` | Precio por unidad | `ce-price-unit` | A short qualifier beside the figures, such as “cada uno”. |
| `PriceHistory` | Precio anterior | `ce-price-history` | “Antes” with the struck previous price and the supplied discount label. |

### Superficies

| Id | Nombre CE | Recipe | Rule |
| --- | --- | --- | --- |
| `ProductCard` | Tarjeta de producto | `ce-product` | Photo, then the product stack. No borders, shadows or rounded corners. |
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
| `FeatureTag` | Rótulo | `ce-feature-tag` | Dot, line and label for one feature; stays inside its photo and never overlaps. |

### Tienda

| Id | Nombre CE | Recipe | Rule |
| --- | --- | --- | --- |
| `StockLine` | Disponibilidad | `ce-stock` | Per-store availability in words, with a state dot. |
| `StoreNote` | Nota de tienda | `ce-store-note` | Short store-specific text that replaces a missing price. |

### Salidas

| Id | Nombre CE | Recipe | Rule |
| --- | --- | --- | --- |
| `GondolaLabel` | Etiqueta de góndola | `ce-label` | 80 × 40 mm: NAME, Description, specs, price (the largest). |
| `ShareCard` | Tarjeta para compartir | `ce-share-card` | 1200 × 630 price-free link preview. |

