# Shared product links

Status: **proposed** (2026-10-23), pending owner review. The requirement itself, that product links shared through WhatsApp and social platforms are a first-class experience, is confirmed in [the decisions](decisions.md). This document splits the work into a design specification, which `ce-theme` owns, and an implementation contract, which the ecommerce application and CE Systems own. A prototype or design file does not implement any of it.

## Current state of casaelida.com (observed 2026-10-23)

| Observation | Effect on shared links |
| --- | --- |
| Home page has `og:title` and `og:description` but no `og:image`, `og:url` or canonical URL | Shared home links show text only, or whatever image a platform guesses. |
| Product page `/catalogo/tilen` repeats `og:title` (“Casa Elida”) and `og:description` with two different values, and lists two `og:image` entries | Platforms pick one of the conflicting values; the product name is not in `og:title`. |
| `og:image` points to a Dropbox URL with `dl=0` and a transparent 900 × 900 PNG | The host can change or rate-limit; transparency may render on black; the image is the bare catalogue cutout with no name or price. |
| No `twitter:*` tags, no JSON-LD structured data | No large card on X; no product rich results. |
| `<html lang="en">` on Spanish pages | Wrong language for crawlers and assistive technology. |
| Product prices differ by store (“Precio por Sucursal”: Tacna, Arequipa) | A shared link has no single price unless the link names a store. |

## Design specification (owned by `ce-theme`)

What a shared product link communicates, in priority order:

1. The product, shown whole and recognisable (approved product photo).
2. Its name and catalogue model, exactly as the record has them.
3. The price, only when one price applies to that link (see Open decisions).
4. The Casa Elida identity, using the supplied red-ground logo unchanged.
5. The product code, as an exact string.

Visual composition: the `ShareCard` recipe (`recipes/share-card.css`, exported as `exports/share-card.css`).

- Canvas 1200 × 630 (1.91:1), the size Open Graph consumers widely use for large previews.
- **Centre safe zone 630 × 630**: product photo, name (two lines at most) and price. Messaging apps that crop to a square keep this zone, so nothing essential sits outside it.
- Left band 285px in `ce-color-brand-red` with `logo-brand.jpg`; right band 285px with the code and `casaelida.com`.
- Offers use the existing offer price recipe and only the supplied previous price; no computed discount.
- Fallbacks:
  - No approved photo: the `ce-share-card--fallback` layout (subtle panel, name and price carry the card).
  - No single price: omit the price block. Never show `S/0`, “desde” or a price range unless the data supplies that wording.
  - No code: omit it.
  - Product unavailable or unpublished: share the category or home card instead.

Text for metadata (no invented copy):

| Field | Pattern | Example from fixtures |
| --- | --- | --- |
| `<title>`, `og:title`, `twitter:title` | `{name} {MODEL} \| Casa Elida` | `Taza de vidrio resistente al calor NOME \| Casa Elida` |
| `meta description`, `og:description` | `{details}. {price sentence if one price applies}` | `Vidrio borosilicato, 350ml. S/8.` |
| `og:image:alt`, `twitter:image:alt` | `{name} {MODEL}` | `Taza de vidrio resistente al calor NOME` |

## Implementation contract (owned by the ecommerce application)

Server-rendered in the initial HTML of every public product URL, readable without JavaScript or cookies:

```html
<html lang="es-PE">
<title>Taza de vidrio resistente al calor NOME | Casa Elida</title>
<meta name="description" content="Vidrio borosilicato, 350ml. S/8.">
<link rel="canonical" href="https://casaelida.com/catalogo/nome">
<meta property="og:type" content="product">
<meta property="og:site_name" content="Casa Elida">
<meta property="og:locale" content="es_PE">
<meta property="og:url" content="https://casaelida.com/catalogo/nome">
<meta property="og:title" content="Taza de vidrio resistente al calor NOME | Casa Elida">
<meta property="og:description" content="Vidrio borosilicato, 350ml. S/8.">
<meta property="og:image" content="https://casaelida.com/share/nome-<content-hash>.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Taza de vidrio resistente al calor NOME">
<meta property="product:price:amount" content="8.00">
<meta property="product:price:currency" content="PEN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Taza de vidrio resistente al calor NOME | Casa Elida">
<meta name="twitter:description" content="Vidrio borosilicato, 350ml. S/8.">
<meta name="twitter:image" content="https://casaelida.com/share/nome-<content-hash>.jpg">
<meta name="twitter:image:alt" content="Taza de vidrio resistente al calor NOME">
<script type="application/ld+json">{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Taza de vidrio resistente al calor NOME",
  "sku": "CE26061440",
  "image": ["https://casaelida.com/media/nome-1200.jpg"],
  "description": "Vidrio borosilicato, 350ml",
  "brand": { "@type": "Brand", "name": "Casa Elida" },
  "offers": {
    "@type": "Offer",
    "url": "https://casaelida.com/catalogo/nome",
    "price": "8.00",
    "priceCurrency": "PEN"
  }
}</script>
```

Rules:

- **One value per tag.** Remove the duplicated `og:title` and `og:description`. Emit price tags and the JSON-LD `offers` only under the price rule below.
- **Strings stay strings.** `sku` and codes are JSON strings; `price` is a decimal string from the record (`"8.00"`), never a computed or rounded number. Add `availability` (`https://schema.org/InStock` …) only from current stock data, and per store with `availableAtOrFrom` when stock is per store.
- **Image generation.**
  - Render the `ShareCard` template server-side from the record: a headless browser or an HTML-to-image renderer with the Inter files embedded.
  - Output JPEG, sRGB, flattened on white, 1200 × 630.
  - Keep each file small; under 300 KB is a common target for messaging previews and should be confirmed by testing.
  - Name files by product and a hash of the inputs (name, model, photo, price, code), so a price or photo change produces a new URL and platforms refetch.
  - Serve from Casa Elida's own domain or CDN with long cache lifetimes; never from personal file-sharing links.
- **Crawler access.** Product, image and canonical URLs return `200` to platform crawlers (WhatsApp, Facebook, X, LinkedIn) without login, geoblocking or bot challenges. `robots.txt` must not block `/share/`.
- **Responsive product images on the page itself.**
  - Serve AVIF or WebP with a JPEG fallback through `<picture>` or `srcset`/`sizes`.
  - Square 1:1 for catalogue photos (`contain` on white), 3:4 or 16:9 for lifestyle photos.
  - Reserve the box with `width`/`height` or `aspect-ratio`.
  - Load the first visible product image eagerly (`fetchpriority="high"`) and the rest lazily.
- **Validation before release.**
  - Facebook Sharing Debugger.
  - LinkedIn Post Inspector.
  - A real WhatsApp message on Android and iOS.
  - Google Rich Results Test for the JSON-LD.
  - An HTML fetch without JavaScript confirming every tag is present.

## Open decisions (owner)

1. **Price on shared links with per-store prices.** Options: (a) omit the price unless all stores share it; (b) store-scoped URLs (`?sede=tacna`) with that store's price; (c) show the online-store price if one exists. Recommendation: (a) now, (b) when store pages exist.
2. **Approved photo per product for sharing.** Catalogue cutouts are available; lifestyle photos from campaigns contain baked-in text and are not suitable as `og:image`.
3. **Monochrome wordmark.** Campaigns show the script wordmark in solid black or white; only the colour versions are supplied. Supply official monochrome files before they are used in generated images.
