/** Standard names of Casa Elida patterns. One name per pattern, used in code, documentation, designs and conversation across
 * ce-theme and every CE app. `id` is the stable English identifier; `es` is the name people use in Spanish; `recipe` lists the
 * classes that draw it. Names are never reused for another pattern; to retire one, keep it in `aliases` of its replacement. */
export const NAMES = [
  // Product information
  { id: 'ProductName', es: 'NAME', group: 'Producto', recipe: ['ce-product-name'], rule: 'Mandatory on every product shown anywhere. Uppercase invented catalogue name, one or two words, unique (MENE, TILEN).' },
  { id: 'ProductDescription', es: 'Descripción', group: 'Producto', recipe: ['ce-product-description'], rule: 'Title Case, Spanish connectors in lowercase. Second line of the identity.' },
  { id: 'ProductSpecs', es: 'Especificaciones', group: 'Producto', recipe: ['ce-product-specs'], rule: 'Lowercase except units and abbreviations. Third line of the identity.' },
  { id: 'ProductIdentity', es: 'Identidad', group: 'Producto', recipe: ['ce-product-heading'], rule: 'NAME, then Description, then specs, at size.product.gap-identity.' },
  { id: 'ProductStack', es: 'Pila de producto', group: 'Producto', recipe: ['ce-product-info'], rule: 'Tag, CE code, identity, price, note, with the size.product gaps. The price follows the specs at 12px and is never pushed to the bottom.' },
  { id: 'CECode', es: 'Código CE', group: 'Producto', recipe: ['ce-code', 'ce-code--sm', 'ce-code--lg'], rule: 'White bold text on ink, 2px corners, tabular figures. Always one line; never wraps.' },
  { id: 'ProductTag', es: 'Etiqueta de producto', group: 'Producto', recipe: ['ce-badge--novedad', 'ce-badge--promo', 'ce-badge--top', 'ce-badge--limited', 'ce-product-flag'], rule: 'Novedad (green), Promo (amber), Top en ventas (crimson), Edición limitada (black).' },
  // Prices
  { id: 'PriceRegular', es: 'Precio normal', group: 'Precios', recipe: ['ce-price'], rule: 'Ink on white; raised S/ by default (fallback: ce-price--baseline).' },
  { id: 'PricePromo', es: 'Precio Promo', group: 'Precios', recipe: ['ce-price--offer'], rule: 'The yellow price block: a promotion or discount price. Yellow means promotion and nothing else.' },
  { id: 'PriceSale', es: 'Precio Rebajas', group: 'Precios', recipe: ['ce-price--sale'], rule: 'The red price block for REBAJAS campaigns.' },
  { id: 'PricePhoto', es: 'Precio sobre foto', group: 'Precios', recipe: ['ce-price--inverse'], rule: 'White price on photography protected by an overlay.' },
  { id: 'PricePack', es: 'Precio por pack', group: 'Precios', recipe: ['ce-price-pack'], rule: 'The supplied basis after a slash, bold, on the baseline of the figures: /pack de 12.' },
  { id: 'PriceUnit', es: 'Precio por unidad', group: 'Precios', recipe: ['ce-price-unit'], rule: 'A short qualifier beside the figures, such as “cada uno”.' },
  { id: 'PriceHistory', es: 'Precio anterior', group: 'Precios', recipe: ['ce-price-history'], rule: '“Antes” with the struck previous price and the supplied discount label.' },
  // Surfaces
  { id: 'ProductCard', es: 'Tarjeta de producto', group: 'Superficies', recipe: ['ce-product'], rule: 'Photo, then the product stack. No borders, shadows or rounded corners.' },
  { id: 'ProductCallout', es: 'Tarjeta flotante', group: 'Superficies', recipe: ['ce-callout'], rule: 'White floating card with a photo, identity and price for editorial pieces.' },
  { id: 'Mosaic', es: 'Mosaico', group: 'Superficies', recipe: ['ce-mosaic'], rule: 'Editorial grid of tiles; one large tile, one wide, two small.' },
  { id: 'MosaicTile', es: 'Baldosa', group: 'Superficies', recipe: ['ce-tile', 'ce-tile--light'], rule: 'One link in a mosaic. Neutral surface; yellow never sits behind or over a product photo.' },
  { id: 'PromoTile', es: 'Baldosa Promo', group: 'Superficies', recipe: ['ce-tile-offer'], rule: 'A tile with the Promo tag and the supplied offer price in the yellow block.' },
  { id: 'PromoPanel', es: 'Panel Promo', group: 'Superficies', recipe: ['ce-statement', 'ce-grid-promo'], rule: 'A campaign surface in brand yellow with ink text, for a promotion or campaign message.' },
  // Photos
  { id: 'TaggedPhoto', es: 'Foto etiquetada', group: 'Fotos', recipe: ['ce-tagged-media'], rule: 'Photo frame with markers and feature tags; clips anything outside it.' },
  { id: 'Marker', es: 'Marcador', group: 'Fotos', recipe: ['ce-hotspot'], rule: 'Black circle with a white capital letter A, B, C.' },
  { id: 'FeatureTag', es: 'Rótulo', group: 'Fotos', recipe: ['ce-feature-tag'], rule: 'Dot, line and label for one feature; stays inside its photo and never overlaps.' },
  // Availability and notes
  { id: 'StockLine', es: 'Disponibilidad', group: 'Tienda', recipe: ['ce-stock'], rule: 'Per-store availability in words, with a state dot.' },
  { id: 'StoreNote', es: 'Nota de tienda', group: 'Tienda', recipe: ['ce-store-note'], rule: 'Short store-specific text that replaces a missing price.' },
  // Print and sharing
  { id: 'GondolaLabel', es: 'Etiqueta de góndola', group: 'Salidas', recipe: ['ce-label'], rule: '80 × 40 mm: NAME, Description, specs, price (the largest).' },
  { id: 'ShareCard', es: 'Tarjeta para compartir', group: 'Salidas', recipe: ['ce-share-card'], rule: '1200 × 630 price-free link preview.' },
];

export const nameById = (id) => NAMES.find((entry) => entry.id === id);
