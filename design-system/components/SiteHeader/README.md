# SiteHeader

The storefront top: a black utility bar with the chosen store, then the header with logo, primary links, pill search and account, favourites and bag actions.

## Classes

- `ce-utility-bar` > `ce-utility-bar-inner`: 44px black bar, 12px white text. `ce-store-context` is the store button (`ce-store-context-name` underlines on hover; `aria-busy="true"` shows a small loader while prices reload).
- `ce-site-header` (`--sticky` to stick) > `ce-site-header-inner`: on phones, logo and actions on the first row and full-width search below; from 1024px one row: `ce-site-brand`, `ce-site-nav`, `ce-search`, `ce-site-actions`.
- `ce-search`: a `role="search"` form with an icon and a 48px pill input on `ce-color-surface-subtle`.
- `ce-site-action`: 44px icon actions; `ce-site-action-label` shows text from 1024px (“Hola, inicia sesión”); `ce-count` is the bag count; `ce-site-menu` opens the navigation drawer below 1024px (`ce-drawer ce-drawer--start` with `ce-nav-list`).
- `ce-container`: content width with the responsive gutters. `ce-skip` provides “Saltar al contenido”.

## The consumer supplies

The supplied logo file, the category links, the chosen store from the commerce service, the account state and the bag count.

## Do and don't

- Do keep the chosen store visible and changeable on every page with prices.
- Do give icon-only actions an accessible name (“Bolsa, 3 productos”).
- Don't recolour the logo; use `logo-wordmark-color.png` on white.
