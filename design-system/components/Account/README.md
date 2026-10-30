# Account

Sign-in and order tracking: a two-panel sign-in with the form column at most 448px wide, a vertical order timeline, and service link rows.

## Classes

- `ce-auth`: one column, two panels from 1024px. `ce-auth-aside` is a campaign surface (action red by default, white-yellow wordmark); `ce-auth-main` holds the `h1`, the form (`ce-field`, `ce-input`), a full-width 56px `ce-button`, a `ce-divider` (“o”) and secondary actions.
- `ce-timeline`: ordered steps; `data-state="done"` fills the dot and line, `aria-current="step"` marks the current one in action red. `ce-timeline-title` and `ce-timeline-meta` per step.
- `ce-link-rows` > `ce-link-row`: 72px rows with a bold label, optional `small` note and an arrow.
- Store locator: `ce-locator`, `ce-location-list`, `ce-location` (`aria-current` for the chosen store) and a `ce-map-slot`.

## The consumer supplies

The identity provider's fields and errors, the order status vocabulary and dates, store addresses and hours.

## Do and don't

- Do keep the page heading in the form column, not in the decorative panel.
- Do describe each order step in words; colour only supports it.
- Don't invent addresses, hours or delivery dates.
