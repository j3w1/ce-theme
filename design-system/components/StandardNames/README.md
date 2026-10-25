# StandardNames

The names of Casa Elida's standard patterns. Say the name, not the look: “Precio Promo”, not “the yellow price”.

## Classes

- Each row pairs the stable English id (`PricePromo`), the Spanish name people say (Precio Promo) and the recipe that draws it, with a live sample.
- The full registry is `recipes/names.mjs` (`NAMES`) and `names.md`: ProductName, ProductIdentity, ProductStack, CECode and ProductTag; PriceRegular, PricePromo, PriceSale, PricePhoto, PricePack, PriceUnit and PriceHistory; ProductCard, Mosaic, MosaicTile, PromoTile and PromoPanel; TaggedPhoto, Marker and FeatureTag; StockLine and StoreNote; GondolaLabel and ShareCard.

## The consumer supplies

Real products with a NAME each. Every product shown anywhere must have a NAME; `productView()` refuses a product without one.

## Do and don't

- Do use the English id in code, designs and tickets, and the Spanish name when speaking.
- Don't rename a pattern or reuse a name for another one; add a new entry in the same change as its recipe.
