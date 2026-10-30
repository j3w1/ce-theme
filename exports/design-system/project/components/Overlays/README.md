# Overlays

Dialogs, drawers, menus, tooltips and feedback: notices, toasts, empty states, skeletons and spinners. Native elements first; the reference behaviour is `recipes/behaviors.mjs`.

## Classes

- `ce-dialog` (`<dialog>` with `showModal()`): `ce-dialog-header`, `ce-dialog-body`, `ce-dialog-footer`; backdrop uses `ce-color-overlay`. Focus returns to the control that opened it; Escape closes.
- `ce-drawer`: full-height side panel from the end edge, `ce-drawer--start` from the start edge (navigation); below 640px the end drawer becomes a bottom sheet.
- `ce-menu` with `ce-menu-item` (`aria-disabled` with a reason) and `ce-tooltip`, opened with the `popover` attribute; positioning is left to the application.
- `ce-notice` (`--success`, `--warning`, `--danger`; info by default): icon, bold title and text. `ce-toast-region` (`role="status"`) with `ce-toast`.
- `ce-empty`, `ce-skeleton`, `ce-spinner`, `ce-progress`.

## The consumer supplies

The messages, actions and the state that opens each overlay.

## Do and don't

- Do give every dialog a visible title referenced by `aria-labelledby`.
- Do say what happened and what to do next in notices.
- Don't use a toast for errors that need action; use a notice.
