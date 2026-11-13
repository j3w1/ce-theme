# StoreContext

How the storefront shows that prices and availability depend on the chosen store: the store choice, the store name beside prices, the in-page store line, and the states for no store, loading and no price.

## Classes

- `ce-store-context`: the store button in the utility bar; `aria-busy="true"` while the new store's prices load (no stale amount stays on screen).
- `ce-choice-cards` > `ce-choice-card`: radio cards inside the store dialog (`ce-dialog`), with `ce-choice-card-title` and a note.
- `ce-store-note`: “Precio en Tacna”, “Precio no disponible en Arequipa.”
- `ce-price-pending`: replaces the price when no store is chosen (“Elige tu tienda para ver precio y disponibilidad.”) with a button that opens the dialog.
- `ce-stock`: availability per store in words.

## StoreBar

The **StoreBar** («Barra de tienda») is the in-page line that names the store the amounts and availability on the page belong to and lets the shopper change it. It is a `ce-store-note` whose action is a `ce-link`. It has no class of its own. The utility-bar button, the store dialog and the store drawer are separate and do not change.

```html
<p class="ce-store-note">
  <span>Importes en <strong>Tacna</strong></span>
  <button class="ce-link" type="button">Cambiar tienda</button>
</p>
```

| State | Lead (store label supplied) | Action |
| --- | --- | --- |
| Store chosen, money-bearing surface (cart, checkout, order) | «Importes en {tienda}» | «Cambiar tienda» |
| Store chosen, browsing surface (listing, product page, favourites, campaign) | «Precios y disponibilidad de {tienda}» | «Cambiar tienda» |
| No store | «Tienda: sin elegir» | «Elegir tienda» |
| Pending, after a committed change | The same lead with the new store | «Actualizando» in `ce-pill ce-pill--info`, instead of the action |

- Show it on every store-dependent page: every page whose amounts, prices or availability depend on the chosen store, including browsing pages that show only availability.
- The action is a `button.ce-link` that opens the same store dialog as the utility-bar button, or an `a.ce-link` to the store route. Inside `ce-store-note` it is at least 44px high (`--ce-size-target-public`) and shows the global focus ring.
- The pending bar carries `aria-busy="true"` and `role="status"` only while the change is pending (a recipe-level rule), and replaces the action with the word «Actualizando». The screen-reader announcement of this state has not been tested.
- The lead and the label sit in one `span`. A long store label wraps, and the recipe's gap (4px × 8px) separates it from the action. Add no `·` separator and no gap of your own.
- In the bar, «Tienda:» is used only for the empty state; «Tu tienda:» stays with the utility-bar button.

The page, not the bar, keeps these rules:

- No store means no amount and no stock claim. The no-store bar always sits with the no-store price message in place of every amount (`ce-price-pending`, or a `ce-store-note` where a card or line would show its price), never with a price.
- A committed store change removes the old store's amounts at once. While the bar is pending, the page's amounts are absent or marked pending. A late response for the previous store never replaces the active one.
- The bar names the store and nothing else: no amount, no availability claim, no invented address, hours or service promise.

## The consumer supplies

The store list, the chosen store and its label, the pending state of a store change, and per store the supplied price, offer and availability from the pricing and inventory services.

## Do and don't

- Do switch every price, offer and availability line together when the store changes.
- Do keep the store change cancellable; Escape keeps the current store.
- Do render the StoreBar's state as the application supplies it; the bar never decides that a store is chosen or that a change has finished.
- Don't present one store's price as universal, and never show `S/0` for a missing price.
