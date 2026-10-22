# Product identifiers and pricing

The owner's reference set establishes four price treatments: regular dark text on white, yellow offer blocks, inverse white prices on photography, and white product-information callouts. Product identification is a separate rectangular black/white label.

## Data and hierarchy

Product codes are opaque strings. Preserve characters, case, separators, and leading zeros. A value such as `7730744292227` is not a numeric amount. Do not infer a relationship between a catalogue alias (MENE or DEBUL), a CE-prefixed identifier, and a numeric identifier. Show only the fields supplied by the consumer.

The order is: optional product code; product title or supplied catalogue alias; description; material/capacity/dimensions; price. In photo compositions the identifier precedes the title, followed by details and the largest element, the price. Long codes wrap rather than truncate. Product images remain complete inside square `contain` regions.

The simple product reference component accepts `model`, `name`, `details`, `image`, and `amount`, plus optional `code`, `previousAmount`, `discountLabel`, and `badge`. These are demonstration view fields, not a production catalogue API.

## Display rules

- Prefix `S/` at 46% of the amount size; keep the fractional digits full-size.
- Display compact amounts: `S/20`, `S/8.5`, `S/0.05`. Do not force `.00` or shrink the decimal fraction.
- Use black on white for regular prices, black on brand yellow for offers, and white with verified photographic contrast for inverse prices.
- Render an optional previous price as `Antes` and a readable struck-through amount. It must be higher than the current amount.
- A supplied discount appears once as `−31.25%`. Do not reproduce erroneous reference labels such as duplicated minus signs or zero discounts.
- Keep optional quantity qualifiers such as `cada uno` close to the amount without inventing a unit rule.

The shared JavaScript helper performs exact comparisons in integer cents using BigInt. It does not compute percentages. Consumers own commercial accuracy; a syntactically valid percentage is not proof that it matches the price pair.

Examples are fixtures, not current retail offers. All prices in the public reference site carry that context.
