# Label

The 80 × 40 mm gondola price label in black ink, on white paper or on yellow paper for promotions, and the A4 sheet of 2 × 7 labels.

## Classes

- `ce-label`: fixed 80 × 40 mm grid with 2.5 × 3 mm padding; Reading order on the paper: NAME, Description, specs, price. The price is the largest element, the Description is the loudest text and the NAME is small.
- `ce-label-ident` (NAME 4mm heavy; Description 4.6mm bold, up to 3 lines), `ce-label-specs` (lowercase specs, 3.4mm semibold, below the Description), `ce-label-foot` (`ce-label-logo` from `logo-wordmark-black.png`, `ce-code`).
- `ce-label-qr`: 12mm QR area, top right; the payload comes from the consuming system.
- `ce-label-prices`: optional `ce-label-bulk` quantity prices, optional `ce-label-previous` with `ce-label-discount`, then the price at 11.5mm with a raised `S/` (9mm with `ce-label--wide-price` for long amounts).
- `ce-label--yellow-paper`: yellow on screen only; prints transparent for pre-printed yellow stock. `ce-label-sheet`: A4, 2 × 7, dashed cut guides.
- The on-screen code underline is removed in print.

## The consumer supplies

NAME, Description, specs, code, the store's supplied price, previous price, discount label and quantity prices, and the QR payload.

## Do and don't

- Do print at 100% and validate on the real printer, paper and scanner.
- Don't use this for product barcode labels (40 × 20 mm) or carton marks; those belong to 1688toPL and stay unchanged.
- Don't calculate quantity prices or discounts on the label.
