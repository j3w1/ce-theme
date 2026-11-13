# StoreContext

How the storefront shows that prices and availability depend on the chosen store: the store choice, the store name beside prices, and the states for no store, loading and no price.

## Classes

- `ce-store-context`: the store button in the utility bar; `aria-busy="true"` while the new store's prices load (no stale amount stays on screen).
- `ce-choice-cards` > `ce-choice-card`: radio cards inside the store dialog (`ce-dialog`), with `ce-choice-card-title` and a note.
- `ce-store-note`: “Precio en Tacna”, “Precio no disponible en Arequipa.”
- `ce-price-pending`: replaces the price when no store is chosen (“Elige tu tienda para ver precio y disponibilidad.”) with a button that opens the dialog.
- `ce-stock`: availability per store in words, one item per statement, in a list named `aria-label="Disponibilidad"`. `data-state` is `available` («Disponible en {tienda}»), `limited` («Pocas unidades en {tienda}»), `unavailable` («Agotado en {tienda}»), `unknown` («Disponibilidad por confirmar en {tienda}»; also the look of an item with no `data-state`) or `pending` («Consultando disponibilidad…», with `aria-busy="true"` on the list). With no store chosen there is no availability line: the `ce-price-pending` message takes its place. See the StockLine section of `names.md`.

## The consumer supplies

The store list, the chosen store, and per store the supplied price, offer and availability from the pricing and inventory services. Price and availability are supplied separately: a confirmed reading can sit next to a missing price.

## Do and don't

- Do switch every price, offer and availability line together when the store changes.
- Do keep the store change cancellable; Escape keeps the current store.
- Don't present one store's price as universal, and never show `S/0` for a missing price.
- Don't show «Agotado» for a failed, stale, conflicting or missing reading: that is `unknown`. `unavailable` is only a confirmed sold-out reading, and «Pocas unidades» is a supplied state, never a count or threshold worked out in the interface.
