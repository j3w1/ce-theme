# ShareCard

The 1200 × 630 image served as a page's `og:image`, so links shared on WhatsApp and social platforms show what the link is about. It never shows a price: prices differ by store and change, and the page carries them. It reads like the gondola label: NAME small and heavy, Description loudest, specs semibold, then the foot.

## Types

| Type | Class | Use |
| --- | --- | --- |
| Product | `ce-share-card` | Catalogue cutout in the centre square; NAME, Description and specs on the left; the wordmark on the right. |
| Product with code | `ce-share-card` + `ce-share-card-foot` | The optional code sits in the foot, bottom left, as on the gondola label. |
| Collection or category | `ce-share-card` | `ce-share-card-eyebrow` and `ce-share-card-title` replace NAME and Description. |
| Photograph (store, campaign, product in use) | `ce-share-card--photo` | Full-bleed photograph (focal point `--ce-x`, `--ce-y`) with a white identification card in the left band; the wordmark and code sit in the card's foot. |
| Text only | `ce-share-card--text` | No approved photograph: centred wordmark, NAME, Description and one specs line on the subtle surface. |
| Home or store | `ce-share-card--brand` | Brand red with the white-and-yellow wordmark, an eyebrow and a large title. |
| Campaign | `ce-share-card--brand` | The campaign period as supplied in the eyebrow and the campaign title; no monetary promise. |

The preview card shows each type, the centre-square crop and the 300px chat size. The photograph in the preview is an illustrative reference image, not a production asset.

## Layout

- `ce-share-card`: fixed 1200 × 630 canvas on `ce-color-surface-canvas`, rendered to JPEG by the commerce application (never in the browser of the person sharing). `--ce-product-text` scales the Description and, with it, NAME and specs (36px default).
- Three bands sized for the centre-square crop (x 285–915) that chat apps use: `ce-share-card-text` on the left (x 32–272), `ce-share-card-media` filling the square, and `ce-share-card-logo` on the right (240 × 106px, x 930–1170). A square crop shows the whole product and no cut letters.
- Hierarchy: `ce-product-name` heavy and small; `ce-product-description` bold, the loudest text, up to 4 lines; `ce-product-specs` semibold in the secondary colour, lowercase as supplied, up to 3 lines; the optional `ce-code` in `ce-share-card-foot`.
- `ce-share-card-media`: the photo is whole (`contain`) and scaled up to the square; trim white margins from the photo before composing.
- Long words: the renderer runs `fitShareCard` from `behaviors.mjs` after fonts load, so “Antideslizante” is never split mid-word.

## The consumer supplies

From CE Systems or the commerce service: NAME, Description, specs, one approved photo flattened on white, optionally the code, and the page type. Missing fields are left out, never filled with placeholder text. Metadata rules are in `sharing.md`.

## Do and don't

- Do test the image at chat size (about 300px wide) and as a centre square crop; at that size the photo, the wordmark, NAME and Description need to read.
- Do regenerate and version the image URL when the photo or text changes.
- Don't show a price, a discount or availability on the card. A photograph that has a price printed in it is not a valid source.
- Don't use a transparent PNG as `og:image`; some platforms render transparency as black.
