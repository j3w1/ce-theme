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

## Cart line

The **Cart** composition uses the ProductStack in `ce-cart-line-body`: optional CECode, linked NAME/Description, optional specifications, supplied line amount or missing/pending-price explanation, optional StockLine, then quantity/remove controls. These are existing recipes, not a new Vue component or behaviour API. Remove stays `button.ce-link`, named «Quitar {NAME} del carrito» and at least `size.target.public` (44px); the product link has a centred minimum 44px hit area without changing its content height, and the quantity input has a 44px target too. The decorative image has empty alt when the adjacent link names the product.

Code→heading 8px, NAME→Description 2px, heading→specs 2px, specs→amount-or-note 12px, amount-or-note→StockLine 8px, StockLine→controls 12px, controls→pending/failed save message 8px. With optional fields absent, the next present part keeps its semantic offset (amount-or-note remains 12px after the heading, controls 12px after amount-or-note without a StockLine). Unbroken codes get intrinsic room; the body may reflow below the image. No uniform-gap or frozen-board patch belongs in new markup. Availability follows [StockLine](#stockline), independently of price. The application supplies amounts, quantity limits, eligibility and all states; it owns operations and totals. See the [Cart guideline](../design-system/components/Cart/README.md) for eleven supplied-state scenarios and unrun screen-reader checks.

## Price styles and the price basis

- **Currency styles.** The default **CurrencyBaseline** (S/ en línea base) sets a small S/ on the baseline of the figures. The second option is **CurrencyJoined** (S/ unido), where S/ has the size of the figures and is attached to them (`ce-price--joined`). **CurrencyRaised** (S/ elevado, `ce-price--raised`) stays a supported variant.
- **PriceBasis** (Base del precio) is the short bold text that leans to the top after the price and says what it covers. It has two kinds that must not be mixed up:
  - **PriceUnit** (Unidad): “cada uno”, a general, direct way to say the price is for one piece. When a card or block is narrow it shows its short form “c/u” (`ce-price-unit-short`, switched by the card width or `ce-price-unit--short`).
  - **PricePresentation** (Presentación): the selling format the price is for, written after a slash: `/pack de 12`, `/par`. It identifies what is sold. It replaces the earlier name PricePack.
- In **PricePromo** and **PriceSale** the colour box surrounds only the **PriceAmount** (S/ and the figures); the basis stays outside it.
- **PriceOld** (Precio anterior) is “Antes” with the struck price; the **DiscountLabel** (Etiqueta de descuento) is the supplied percentage in red, tight around its text. The earlier name was PriceHistory.

## Add to cart

**AddToCart** (Añadir al carrito) is an icon button that appears only when a product card is hovered or focused. On touch and narrow screens it is replaced by a full-width “Añadir al carrito” button at the bottom of the card.

## Demonstration cue

**DemoCue** (Aviso de demostración, `ce-demo-cue`) says in words that what a page or frame shows is simulated: its data and its operations. It is a note, not a status and not a button.

```html
<p class="ce-demo-cue" role="note">Demostración — datos y operaciones simulados</p>
```

- **The consumer supplies the words.** The recipe is appearance only and holds no text. Wherever the design canon's wording is required, as in CE Theme's own examples and the design workbench, the text is exactly «Demostración — datos y operaciones simulados», with an em dash (U+2014). An application's demonstration mode may say that its data is simulated in its own words.
- **`role="note"` is required** on the element. Add `lang="es"` when the surrounding page is in another language.
- **One form.** The bordered block is the only demonstration cue. The compact forms seen in earlier designs (an information pill in a page header, a badge, a quiet strip) are not used in new work and have no modifier.
- **Placement on a page.** Once, at the top of the main content of a page that shows simulated data: the first element of the main region, before the page header or the `h1` (breadcrumbs, which are navigation, may come first). The recipe has no margin; the page sets the space around it.
- **Frames.** In a state sheet, every frame that shows simulated commercial or staff data carries its own cue inside the frame, because a frame is viewed and cropped on its own. A cue for the whole sheet may be added above the frames; it never counts as the cue of any frame. Only a frame with no simulated data, such as a route shell or a documentation-only fragment, carries none.
- **Scenarios.** The cue never replaces the «Escenario» label of a scenario frame.
- **Production.** Production output does not contain the element at all. Hiding it with CSS, the `hidden` attribute or `aria-hidden` is not enough. The recipe cannot tell a forgotten cue on real data; leaving it out is the application's job.
- **Look.** Words and a 2px ink border that reuses the focus stroke (`stroke.focus`); no colour carries the meaning. Small bold text at the heading line height, as wide as its words and never wider than its container, inside which it wraps.

The boards of the frozen design-workbench snapshot keep their own local drawings of the cue; new boards and examples use this recipe. The decisions behind these rules are in [decisions.md](decisions.md) (“Demonstration cue”).

## StockLine

The **StockLine** (Disponibilidad, `ce-stock`) says in words whether a product is available in a store; the dot beside each statement is a second signal, never the only one. One list, one item per statement:

```html
<ul class="ce-stock" aria-label="Disponibilidad">
  <li data-state="unknown">Disponibilidad por confirmar en Tacna</li>
</ul>
```

| State | `data-state` | Wording (`{tienda}` is the supplied store label) | Dot |
| --- | --- | --- | --- |
| Available | `available` | «Disponible en {tienda}» | success |
| Few units: a confirmed reading supplied by the inventory service | `limited` | «Pocas unidades en {tienda}» | warning |
| Sold out: a confirmed reading supplied by the inventory service | `unavailable` | «Agotado en {tienda}» | hollow danger ring |
| Unknown, stale, conflicting, missing or no response | `unknown`; an item with no `data-state` looks the same | «Disponibilidad por confirmar en {tienda}» | neutral |
| Being read | `pending`, with `aria-busy="true"` on the list | «Consultando disponibilidad…» | neutral |
| No store chosen | no availability line | «Elige tu tienda para ver precio y disponibilidad» (`ce-price-pending`) takes its place | none |

- `unavailable` is only a confirmed sold-out reading. A failed, missing or unanswered reading is `unknown`, never «Agotado».
- The list carries `aria-label="Disponibilidad"`. It has no `role="status"`: announcing a change stays the application's choice, and only for a meaningful change.
- Price and availability are supplied separately, so a confirmed reading can sit next to a missing price («Precio no disponible en Arequipa.» with «Agotado en Arequipa»).
- The interface counts nothing. «Pocas unidades» is a supplied state, never a threshold worked out from a count; the line reserves nothing and infers no eligibility, which stays with the application or service.
- A control inside a line, such as a «Reintentar» link, is a separate control with its own 44px target.
- In a ProductStack the line sits `size.product.gap-note` (8px) below the price or StoreNote.
- `ce-availability`, the dotless supplied sentence of the `Specs` card, is a separate recipe and stays as it is.

## Registry

Generated from `recipes/names.mjs` by `pnpm generate`; do not edit between the markers.

<!-- registry:start -->
### Producto

| Id | Nombre CE | Recipe | Vue | Rule |
| --- | --- | --- | --- | --- |
| `ProductName` | NAME | `ce-product-name` | — | Mandatory on every product shown anywhere. Uppercase invented catalogue name, one or two words, unique (MENE, TILEN). |
| `ProductDescription` | Descripción | `ce-product-description` | — | Title Case, Spanish connectors in lowercase. Second line of the identity. |
| `ProductSpecs` | Especificaciones | `ce-product-specs` | — | Lowercase except units and abbreviations. Third line of the identity. |
| `ProductIdentity` | Identidad | `ce-product-heading` | — | NAME, then Description, then specs, at size.product.gap-identity. |
| `ProductStack` | Pila de producto | `ce-product-info` | — | Tag, CE code, identity, price, note, with the size.product gaps. The price follows the specs at 12px and is never pushed to the bottom. |
| `CECode` | Código CE | `ce-code`, `ce-code--sm`, `ce-code--lg` | `CEProductCode` | White bold text on ink, 2px corners, tabular figures. Always one line; never wraps. |
| `ProductTag` | Etiqueta de producto | `ce-badge--novedad`, `ce-badge--promo`, `ce-badge--top`, `ce-badge--limited`, `ce-product-flag` | — | Novedad (green), Promo (amber), Top en ventas (crimson), Edición limitada (black). |

### Precios

| Id | Nombre CE | Recipe | Vue | Rule |
| --- | --- | --- | --- | --- |
| `PriceRegular` | Precio normal | `ce-price` | `CEPrice` | Ink on white, S/ in the baseline style by default. |
| `CurrencyBaseline` | S/ en línea base | `ce-price-currency` | — | The default: S/ at 46% of the figures, sitting on their baseline. |
| `CurrencyJoined` | S/ unido | `ce-price--joined` | — | The second option: S/ at the size of the figures, attached to them (S/10). |
| `CurrencyRaised` | S/ elevado | `ce-price--raised` | — | A supported variant: S/ small at the top of the figures. |
| `PriceAmount` | Cifra del precio | `ce-price-amount` | `CEPrice` | S/ and the figures together. In Promo and Rebajas prices the colour box surrounds only the amount, never the basis beside it. |
| `PricePromo` | Precio Promo | `ce-price--offer` | `CEPrice` | The yellow price block: a promotion or discount price. Yellow means promotion and nothing else. |
| `PriceSale` | Precio Rebajas | `ce-price--sale` | `CEPrice` | The red price block for REBAJAS campaigns. |
| `PricePhoto` | Precio sobre foto | `ce-price--inverse` | `CEPrice` | White price on photography protected by an overlay. |
| `PriceBasis` | Base del precio | `ce-price-basis` | `CEPrice` | Short bold text leaning to the top after the price that says what it covers: a unit (cada uno) or a presentation (/pack de 12). |
| `PriceUnit` | Unidad | `ce-price-unit`, `ce-price-unit-short` | `CEPrice` | “cada uno”: the price is for one piece. Short form “c/u” when the card or block is narrow. |
| `PricePresentation` | Presentación | `ce-price-presentation` | `CEPrice` | The selling format the price is for, after a slash: /pack de 12, /par. It identifies what is sold; it is not a per-piece qualifier. Retired name: PricePack. |
| `PriceOld` | Precio anterior | `ce-price-history` | `CEPrice` | “Antes” with the struck previous price, then the DiscountLabel. Retired name: PriceHistory. |
| `DiscountLabel` | Etiqueta de descuento | `ce-discount` | `CEPrice` | The supplied discount percentage in red, tight around its text. Never calculated. |

### Superficies

| Id | Nombre CE | Recipe | Vue | Rule |
| --- | --- | --- | --- | --- |
| `ProductCard` | Tarjeta de producto | `ce-product` | — | Photo, then the ProductStack. No borders, shadows or rounded corners. |
| `Cart` | Carrito | `ce-cart`, `ce-cart-lines`, `ce-cart-line`, `ce-cart-line-body`, `ce-cart-line-actions` | — | Optional unbroken code, linked NAME/Description and specs, supplied line amount or note, StockLine, then quantity and remove as button.ce-link named Quitar … del carrito. ProductStack gaps 8/2/2/12/8, then 12 to controls and 8 to save text. All values and states are supplied; no arithmetic or controller. |
| `AddToCart` | Añadir al carrito | `ce-product-add`, `ce-icon-button--action` | — | On hover-capable screens an icon button appears on card hover or focus; on touch and narrow screens a full-width button sits at the bottom of the card. |
| `ProductCallout` | Tarjeta flotante | `ce-callout` | — | White floating card with a photo, identity and price for editorial pieces. |
| `Mosaic` | Mosaico | `ce-mosaic` | — | Editorial grid of tiles; one large tile, one wide, two small. |
| `MosaicTile` | Baldosa | `ce-tile`, `ce-tile--light` | — | One link in a mosaic. Neutral surface; yellow never sits behind or over a product photo. |
| `PromoTile` | Baldosa Promo | `ce-tile-offer` | — | A tile with the Promo tag and the supplied offer price in the yellow block. |
| `PromoPanel` | Panel Promo | `ce-statement`, `ce-grid-promo` | — | A campaign surface in brand yellow with ink text, for a promotion or campaign message. |

### Fotos

| Id | Nombre CE | Recipe | Vue | Rule |
| --- | --- | --- | --- | --- |
| `TaggedPhoto` | Foto etiquetada | `ce-tagged-media` | — | Photo frame with markers and feature tags; clips anything outside it. |
| `Marker` | Marcador | `ce-hotspot` | — | Black circle with a white capital letter A, B, C; only for media that cannot hover (social posts, print, share images). |
| `ProductPin` | Punto de producto | `ce-pin`, `ce-pin-dot` | — | The web tag: a black dot with a white centre on the photo; hover, focus or tap opens its product card. |
| `ProductPinCard` | Ficha del punto | `ce-pin-card`, `ce-pin-text`, `ce-pin-chevron` | — | The card a pin opens: NAME, Description, the store price and a chevron link to the product. |
| `FeatureTag` | Rótulo | `ce-feature-tag` | — | Dot on the feature, a leader line and a label for it; the label sits in the empty area of the photo, stays inside it and never overlaps. |

### Tienda

| Id | Nombre CE | Recipe | Vue | Rule |
| --- | --- | --- | --- | --- |
| `StockLine` | Disponibilidad | `ce-stock` | — | Per-store availability in words, with a state dot, in a list named «Disponibilidad». An unknown, stale, conflicting or missing reading reads «Disponibilidad por confirmar en {tienda}», never «Agotado»; «Pocas unidades» and «Agotado» only from a confirmed reading the inventory service supplies. |
| `StoreNote` | Nota de tienda | `ce-store-note` | — | Short store-specific text that replaces a missing price. |
| `StoreContext` | Tienda activa | `ce-store-context` | — | The button that shows and changes the chosen store; prices and availability follow it. |

### Salidas

| Id | Nombre CE | Recipe | Vue | Rule |
| --- | --- | --- | --- | --- |
| `GondolaLabel` | Etiqueta de góndola | `ce-label` | — | 80 × 40 mm: NAME, Description, specs, price (the largest). |
| `ShareCard` | Tarjeta para compartir | `ce-share-card` | — | 1200 × 630 price-free link preview: NAME, Description, specs on the left, the product in the centre square, the wordmark on the right. |
| `ShareCardFoot` | Pie de la vista previa | `ce-share-card-foot` | — | The optional product code, bottom left of a share card, like the foot of a gondola label. |
| `ShareCardPhoto` | Vista previa con foto | `ce-share-card--photo` | — | A full-bleed photograph with the white identification card in the left band. |
| `ShareCardText` | Vista previa solo texto | `ce-share-card--text` | — | No approved photograph: centred text on the subtle surface. Never a price. |
| `ShareCardBrand` | Vista previa de marca | `ce-share-card--brand` | — | Home, store and campaign links: brand surface, large title, no monetary promise. |

### Interfaz

| Id | Nombre CE | Recipe | Vue | Rule |
| --- | --- | --- | --- | --- |
| `ButtonPrimary` | Botón principal | `ce-button` | `CEButton` | Action red with white text: the one main action of a view. |
| `ButtonSecondary` | Botón secundario | `ce-button--secondary` | `CEButton` | White with a control border, for the other actions. |
| `ButtonInk` | Botón oscuro | `ce-button--ink` | `CEButton` | Ink with white text, for neutral strong actions. |
| `IconButton` | Botón de ícono | `ce-icon-button` | — | A round icon-only button; always has an accessible name. |
| `Chip` | Filtro rápido | `ce-chip` | — | A pill toggle or filter; pressed state shows an ink ring. |
| `TextLink` | Enlace | `ce-link` | — | Bold, underlined text link in ink. |
| `TextField` | Campo de texto | `ce-field`, `ce-input` | `CETextField` | A label above a bordered input. |
| `SelectField` | Selector | `ce-select` | — | A native select with the input styling. |
| `CheckOption` | Casilla | `ce-check` | — | A checkbox with its label in one tap target. |
| `Switch` | Interruptor | `ce-switch` | — | An on/off setting that applies at once. |
| `Swatch` | Muestra de color | `ce-swatch` | — | A round colour choice; the name is in its accessible label. |
| `TextArea` | Área de texto | `ce-textarea` | — | A multi-line native textarea with the field look. |
| `RadioOption` | Opción única | `ce-radio` | — | A native radio drawn as a ring with an ink dot; one choice per group. |
| `RangeSlider` | Deslizador | `ce-range` | — | A native range with a thin track and an ink thumb. |
| `DateField` | Campo de fecha | `ce-input` | — | A native date, time, month or week field; the pop-up picker belongs to the browser. |
| `FileField` | Campo de archivo | `ce-input`, `ce-upload` | — | A native file input with a secondary-button file selector, or the dashed dropzone. |
| `ColorField` | Selector de color | `ce-color` | — | A native colour input as a square swatch; the pop-up belongs to the browser. |
| `MeterBar` | Medidor | `ce-meter` | — | A native meter: green is good, amber is low, red is critical. |
| `Tooltip` | Ayuda emergente | `ce-tooltip` | — | A short ink hint with role tooltip; never the only place for essential information. |
| `Menu` | Menú | `ce-menu`, `ce-menu-item` | — | A popover menu with role menu and 44px items. |
| `MediaFrame` | Marco de medios | `ce-media` | — | Audio and video keep the browser controls; the frame and caption are ours. |

### Retroalimentación

| Id | Nombre CE | Recipe | Vue | Rule |
| --- | --- | --- | --- | --- |
| `Badge` | Distintivo | `ce-badge` | — | A small square label for a short fact; ProductTag is its product-specific form. |
| `StatusPill` | Estado | `ce-status`, `ce-status--success`, `ce-status--warning`, `ce-status--danger`, `ce-status--info` | — | A status with colour and a word, never colour alone. |
| `Pill` | Píldora | `ce-pill` | — | A compact neutral label for roles and densities in tools. |
| `Notice` | Aviso | `ce-notice` | — | An inline message with an icon, a title and a sentence. |
| `DemoCue` | Aviso de demostración | `ce-demo-cue` | — | A bordered note (role note) saying that the data and operations are simulated, in the words the consumer supplies. One at the top of the main content and one inside every frame that shows simulated commercial or staff data. Left out of production output, never just hidden. |
| `Toast` | Notificación | `ce-toast` | — | A short confirmation that disappears. |
| `Progress` | Barra de progreso | `ce-progress` | — | A thin determinate progress bar. |
| `Dialog` | Diálogo | `ce-dialog` | — | A modal window that asks for a decision. |
| `Disclosure` | Desplegable | `ce-disclosure` | — | A native details block that shows or hides content. |

### Navegación

| Id | Nombre CE | Recipe | Vue | Rule |
| --- | --- | --- | --- | --- |
| `Breadcrumbs` | Ruta de navegación | `ce-breadcrumbs` | — | Where the page sits: Inicio, section, current page. |
| `SiteNav` | Navegación principal | `ce-site-nav` | — | The main sections of the store. |
| `SearchField` | Buscador | `ce-search` | — | The product search field. |
| `CategoryTile` | Categoría con foto | `ce-category-tile` | — | A photo tile with a label that links to a category. |
| `ModuleNav` | Navegación de módulos | `ce-module-nav` | — | The side navigation of CE apps, grouped by module. The application supplies the modules and their icons; one link marks the current page, and the link height follows density. |
| `PageHeader` | Encabezado de página | `ce-page-header` | — | The title of a tool page with its main actions. |
| `DataTable` | Tabla de datos | `ce-data-table` | — | Dense, sortable table for tools; numbers right-aligned. |
| `BulkBar` | Barra de selección | `ce-bulk-bar` | — | Appears when rows are selected, with actions for the selection. |

### Mensajería

| Id | Nombre CE | Recipe | Vue | Rule |
| --- | --- | --- | --- | --- |
| `ConversationList` | Lista de conversaciones | `ce-conversation-list`, `ce-conversation`, `ce-conversation-name`, `ce-conversation-time`, `ce-conversation-preview`, `ce-conversation-draft`, `ce-conversation-unread`, `ce-conversation-meta`, `ce-conversation-empty`, `ce-avatar`, `ce-avatar--team` | `CEConversationList` | One native button per conversation: name, time, preview, unread count, and the kind (Equipo, Cliente, Asistente) as a word. The selected row has aria-current. Filtering, sorting and who may see what belong to the application. |
| `MessageList` | Lista de mensajes | `ce-message-list`, `ce-message-list-empty`, `ce-message`, `ce-message--incoming`, `ce-message--outgoing`, `ce-message--system`, `ce-message-author`, `ce-message-text`, `ce-message-meta`, `ce-message-time` | `CEMessageList` | A scrollable log. Incoming and outgoing messages differ by alignment, border and a spoken sender; a system message is centred. It keeps the reader where they are, and follows only at the bottom or after their own message. Mount one list per conversation and key it by the conversation id. |
| `InternalNote` | Nota interna | `ce-message--note`, `ce-message-note-label` | `CEMessageList` | An internal note spans the full width in the informational palette, with a lock and the words “Nota interna · No la ve el cliente”. It is never drawn as an outgoing message. The styling is presentation; the service decides who may read a note. |
| `MessageStatus` | Estado del mensaje | `ce-message-status`, `ce-message-status--failed` | `CEMessageList` | The delivery state of an outgoing message, in words: Enviado, Entregado, Leído, No entregado. A simulated message says so (“Enviado · simulado”). Delivery is not acceptance or completion of work. |
| `MessageComposer` | Caja de mensaje | `ce-composer`, `ce-composer-mode`, `ce-composer-mode-option`, `ce-composer-mode-draft`, `ce-composer-row`, `ce-composer-field`, `ce-composer-send` | `CEMessageComposer` | A text area and a send action. Enter adds a line; Ctrl or ⌘ + Enter submits; a blank draft cannot be submitted. With notes enabled, “Responder al cliente” and “Nota interna” each keep their own draft. |
| `ComposerNoteMode` | Modo nota interna | `ce-composer--note`, `ce-composer-notice`, `ce-composer-mode-option--note` | `CEMessageComposer` | In note mode the whole composer takes the informational palette, says “No la ve el cliente” and offers “Guardar nota” instead of the red send action. Switching modes never sends or rewrites a draft. |
| `AttachmentGroup` | Grupo de adjuntos | `ce-attachment-group`, `ce-attachments`, `ce-attachments--1`, `ce-attachments--2`, `ce-attachments--4`, `ce-attachments--cover`, `ce-attachment`, `ce-attachment-open`, `ce-attachment-image`, `ce-attachment-caption` | `CEAttachmentGroup` | Images that were already sent. Each is a native button that only asks the application to open it; its name says the position (“1 de 3”), the caption and the description once. Photographic evidence is shown uncropped (contain) unless the group asks for cover, and every tile reserves its box so a late image never shifts the layout. One item fills the width, two and four make two columns, any other count three, and two in a narrow container. No upload, capture, zoom or viewer. It is its own query container, so it has no width of its own: a block parent or a grid cell gives it that width, and a parent that sizes it to its content collapses it to zero width. Correct: in a flex row, give the component flex: 1. Collapsing: the same flex row without flex: 1, or an inline-block, float or max-content parent without a width. |
| `WorkStatus` | Estado del trabajo | `ce-work-status`, `ce-work-status-head`, `ce-work-status-title`, `ce-work-status-now`, `ce-work-steps`, `ce-work-step`, `ce-work-step--done`, `ce-work-step--current`, `ce-work-step--pending`, `ce-work-step--stopped`, `ce-work-status-summary`, `ce-work-status-actions`, `ce-message-context` | `CEWorkStatus` | The progress of one piece of work that the application supplies: a title, ordered steps with their state in words (hecho, actual, pendiente, se detuvo), the current state as text, who and when, and the application’s own actions. Shape as well as words carry the state. It never decides or changes a state, and it is never the delivery status of a message: “Leído” is not “Aceptado”, and “Aceptado” is not “Resuelto”. It is its own query container, so it has no width of its own: a block parent or a grid cell gives it that width, and a parent that sizes it to its content collapses it to zero width. Correct: in a flex row, give the component flex: 1. Collapsing: the same flex row without flex: 1, or an inline-block, float or max-content parent without a width. |
<!-- registry:end -->
