# Shared links

Status: **locked design rules (2026-10-23), implementation pending in the ecommerce application.** `ce-theme` owns the share-image template (`recipes/share-card.css`, exported as `exports/share-card.css`) and this presentation contract. The ecommerce application owns metadata rendering, image generation, caching and platform validation. A design file or this repository's examples do not implement any of it.

## Rules

1. **Default public previews never show a price.** This covers the image, `og:title`, `og:description`, the Twitter/X fields and the page `<title>` used for sharing. It applies to every case: regular, promotional, uniform across stores, store-specific and missing-photo fallbacks. Previous prices, discount percentages and location-dependent claims (“disponible solo en…”) are also excluded.
2. **The photograph leads.** The supplied wordmark identifies the source at a size that stays legible in a chat preview (240 px wide); it never takes a band of its own across the product.
3. **Only what helps recognise the destination.** Product: photo, NAME when available, Description, at most one short line of verified specifications. The product code is optional and off by default.
4. **Missing data stays missing.** No placeholders, no `S/0`, no invented copy. A missing photo produces the text-led card, not a price.
5. **Public content only.** No customer details, procurement costs, unpublished stock or internal notes in images or metadata.

## What the image shows, by page type

| Page | Variant | Content |
| --- | --- | --- |
| Product with catalogue cutout | `ce-share-card` | Three bands: NAME (small, heavy), Description (bold, loudest) and specs (semibold) on the left (x 32–272); the product filling the centre square (x 285–915); the wordmark, 240 px wide, on the right (x 930–1170). The optional code sits in `ce-share-card-foot`, bottom left. |
| Product with lifestyle photo | `ce-share-card--photo` | Photo across the canvas (`--ce-x`/`--ce-y` focal point); white card in the left band (x 20–272) with NAME, Description, specs, the code and the wordmark. |
| Product without approved photo | `ce-share-card--text` | Centred wordmark, NAME, Description, ≤ 1 spec line. |
| Category or collection | `ce-share-card` or `--photo` | Eyebrow (“Categoría”, “Colección”) and title in the left band. |
| Campaign | `ce-share-card--photo` or `--brand` | Eyebrow with the campaign period as supplied, campaign title; no monetary promise. |
| Store or service page | `ce-share-card--brand` or `--photo` | Eyebrow “Tienda” or the service name, store or service title. |
| Home | `ce-share-card--brand` | White-and-yellow wordmark, “Regalos, decoración y hogar”, tagline. |

## Crops and scale (tested 2026-10-23, revised the same day)

The canvas is 1200 × 630. Rendered in Chromium and scaled to the sizes receiving apps commonly use:

| Presentation | Finding | Design response |
| --- | --- | --- |
| Large preview, ~500–600px wide | All text legible. | — |
| Chat preview, ~300px wide (¼ scale) | The product is what reads; the app prints `og:title` and `og:description` under the image anyway. Small catalogue photos with wide white margins looked tiny when the template did not enlarge them. | The product fills the centre square and the photo is scaled up to it. Trim uniform background margins from the photo before composing. Image text follows the gondola label order: NAME 34px heavy, Description 36px bold, specs 25px semibold; the code is off by default. |
| Square thumbnail, centre crop (x 285–915), ~88–120px | A text column reaching into the square left sliced letters at its edge. | All text stays left of x 285 (the left band ends at x 272) and the wordmark right of x 915, so the crop shows the whole product and nothing cut. Text-only and brand variants are centred inside the square. |
| Long Spanish words in the narrow text band | Headless Chromium does not hyphenate, so “Antideslizante” split mid-word. | Run `fitShareCard(card)` from `recipes/behaviors.mjs` before capture: it adds break points after slashes and scales the band's text evenly (not below 60%) until every word fits. |

No alternate aspect ratio is added: the tests did not show a need, and platforms do not reliably choose an alternate image. Receiving apps add their own title, description, domain and crop; Casa Elida controls only the image and the metadata, and rendering will differ between apps.

## Metadata contract (ecommerce application)

Rendered in the initial HTML of every public URL, without client-side scripts, login, cookies or a saved store selection:

```html
<html lang="es-PE">
<title>Frasco con Cucharita · Casa Elida</title>
<meta name="description" content="Frasco con cucharita de vidrio y bambú, 250ml.">
<link rel="canonical" href="https://casaelida.com/catalogo/frasco-con-cucharita-250">
<meta property="og:type" content="product">
<meta property="og:site_name" content="Casa Elida">
<meta property="og:locale" content="es_PE">
<meta property="og:url" content="https://casaelida.com/catalogo/frasco-con-cucharita-250">
<meta property="og:title" content="Frasco con Cucharita · Casa Elida">
<meta property="og:description" content="Vidrio y bambú, 250ml.">
<meta property="og:image" content="https://casaelida.com/share/CE26061477-3f9a1c.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Frasco de vidrio con tapa y cucharita de bambú">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Frasco con Cucharita · Casa Elida">
<meta name="twitter:description" content="Vidrio y bambú, 250ml.">
<meta name="twitter:image" content="https://casaelida.com/share/CE26061477-3f9a1c.jpg">
<meta name="twitter:image:alt" content="Frasco de vidrio con tapa y cucharita de bambú">
```

- **One value per property.** The current site repeats `og:title` and `og:description` with conflicting values; remove the duplicates. Do not emit `product:price:*` tags.
- **Text.** Title: Description (and NAME when the page leads with it) plus “· Casa Elida”. Description: supplied specifications in a sentence. Alt text describes the photo, not the brand.
- **Images.**
  - Generate from approved public fields with the share-card template and the self-hosted Inter files: a headless browser or an HTML-to-image renderer.
  - Before capture, trim uniform white or transparent margins from the product photo, wait for `document.fonts.ready`, then run `fitShareCard` on the card.
  - Output sRGB JPEG 1200 × 630, flattened on white (transparent catalogue PNGs can render on black). Aim for a small file; under 300 KB is a common target, to be confirmed by testing.
  - Version the file name with a hash of its inputs (photo, NAME, Description, specs, code if shown), so a change produces a new URL.
  - Serve from Casa Elida's own domain or CDN, publicly and with long cache lifetimes. Never use personal file-sharing links.
- **Refreshing.** Messaging apps cache previews. A new image URL is picked up by new shares, and by platform debuggers that force a re-scrape; it does not change messages already sent.
- **Crawler access.** Page and image URLs return `200` to platform crawlers without bot challenges or geoblocking; `robots.txt` must not block share images.
- **Fallback chain.** Product photo → text-led card → the category or home card. Never an empty or broken `og:image`.

### Structured data is separate from the preview

Price-free previews do not forbid a product page from publishing verified commercial data in Schema.org JSON-LD:

- `Product` with `name`, `sku` (the code as a string), `image`, `description` and `brand`.
- `Offer` only when the page itself shows a verified selling price for a defined context. With prices that differ by store, publish one `Offer` per store with `availableAtOrFrom` (a `Place` for that sede), or omit `offers`. Never publish one store's price as a universal offer.
- `price` is the supplied decimal string; `priceCurrency` is `PEN`. Include `availability` only from current stock data.

### Validation before release

- Fetch each page without JavaScript and confirm every tag is present.
- Facebook Sharing Debugger and LinkedIn Post Inspector.
- Real WhatsApp messages on Android and iOS, in both the large and compact preview.
- Google Rich Results Test for the JSON-LD.
- Record which apps were checked and when; results change as platforms change.

## Observed on casaelida.com (2026-10-23)

| Observation | Effect |
| --- | --- |
| Home page: `og:title` and `og:description` only; no `og:image`, `og:url` or canonical URL. | Text-only previews or a guessed image. |
| Product page `/catalogo/tilen`: duplicated `og:title`/`og:description` with different values; two `og:image` entries on a Dropbox `dl=0` URL with a transparent PNG. | Unpredictable title; fragile image host; possible black background. |
| No `twitter:*` tags, no JSON-LD, `<html lang="en">`. | No large X card, no structured data, wrong language. |
