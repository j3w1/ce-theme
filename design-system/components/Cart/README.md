# Cart

The bag and checkout: steps, product lines with quantity, the fulfilment choice and an order summary whose amounts come from the commerce service.

## Classes

- `ce-steps`: numbered steps; `aria-current="step"` marks the current one and `data-state="done"` finished ones. On phones only the current label shows (`ce-step-label`).
- `ce-cart`: lines and summary side by side from 1024px (the summary sticks).
- `ce-cart-lines` > `ce-cart-line`: image, `ce-cart-line-body` with the product heading, specs and `ce-cart-line-actions` (quantity, line amount, remove as `button.ce-link`).
- `ce-choice-cards` for store pickup or delivery; a disabled card explains why.
- `ce-order-summary` with `ce-summary` (`dl` rows) and `ce-summary-total`.

## The consumer supplies

Lines, quantities and every amount (line totals, subtotal, delivery, total) as decimal strings from the commerce service, the chosen store and the available fulfilment options.

## Do and don't

- Do say which store the bag is priced in.
- Don't compute totals, taxes or discounts in the interface.
- Don't hide fees until the last step.
