# @casaelida/vue

Casa Elida's reusable Vue 3 + TypeScript components. Each component renders an approved ce-theme recipe and reuses the recipe helpers, so an application gets the same markup, classes and behaviour that the foundation documents. The components add no CSS of their own: the package ships the foundation stylesheet they render, built from the same tokens and recipes.

Status: `0.3.2`, private. `private: true` is the publication safeguard: the package is never published to a registry; each version is one package file, `casaelida-vue-X.Y.Z.tgz`, made with `pnpm pack`.

## Install

1. Install one pinned package file with pnpm, and commit `package.json` and `pnpm-lock.yaml`. The lockfile records the file's integrity hash, so every install, including a clean CI checkout, gets the same package and styles.
   - Each version is published once, from merged `main`, as the asset of an immutable GitHub Release of `j3w1/ce-theme`: `pnpm add https://github.com/j3w1/ce-theme/releases/download/vue-v<version>/casaelida-vue-<version>.tgz`. The newest `vue-v` release on the [Releases page](https://github.com/j3w1/ce-theme/releases) is the current version; its notes give the file's sha256.
   - For a commit without a release, use a local package file: in a ce-theme checkout at a pinned commit, `pnpm install`, `pnpm build:vue`, then `pnpm pack` in `packages/vue`; copy `casaelida-vue-0.3.2.tgz` into the application, run `pnpm add ./casaelida-vue-0.3.2.tgz` and commit the file with the manifest and lockfile: a local file is part of the pin, so a clean checkout needs it. Keep the previous file while it may be needed for a rollback.
2. Import the styles once, in the application entry: `import '@casaelida/vue/styles.css';`. It holds Inter (400, 600, 700 and 800, with its fonts beside it), the `--ce-` tokens and the `ce-` recipes. It resets nothing: every rule sits under a `ce-` class, and the tokens are custom properties on `:root`.
3. Wrap the application region in `class="ce-scope"`. Without the styles or the scope the components render unstyled.

Vue is a peer dependency, `^3.5.0`: the application installs Vue itself, and the package bundles no Vue runtime.

**Upgrade** by changing the pinned URL (or file) to the newer version and committing the updated lockfile. **Roll back** by restoring the previous URL and lockfile, then `pnpm install --frozen-lockfile`.

The package file contains the built components with their declarations and source maps, `dist/styles.css`, `dist/fonts/` (the four Inter WOFF2 files and `OFL.txt`), this README and `NOTICE`: the Casa Elida name, logo and brand assets are not licensed by the package.

## Components

| Component | Recipe | Standard names | What it does |
| --- | --- | --- | --- |
| `CEButton` | `ce-button` | ButtonPrimary, ButtonSecondary, ButtonInk | `variant`: `primary`, `secondary`, `ink`. `type` defaults to `button`. `href` renders a link. `loading` sets `aria-busy` and disables it. |
| `CETextField` | `ce-field`, `ce-input` | TextField | Visible `label`, `v-model`, `note`, `error` (sets `aria-invalid` and `aria-describedby`), optional `prefix` such as `S/`. Native attributes go to the input. |
| `CEPrice` | `ce-price` | PriceRegular, PricePromo, PriceSale, PricePhoto, PriceOld, PriceUnit, PricePresentation | Formats supplied decimal strings with `recipes/price.mjs`. Never calculates a discount. Invalid input throws. |
| `CEProductCode` | `ce-code` | CECode | Shows a code exactly as supplied; underlines the four-digit number of a Casa Elida code. `size`: `sm`, `md`, `lg`. |
| `CEConversationList` | `ce-conversation-list`, `ce-conversation`, `ce-avatar` | ConversationList | `conversations`, `label`, `v-model` for the selected id, and a `select` event on every activation (also of the selected row). One native button per conversation with `aria-current`, a spoken unread count, a "Borrador:" marker and the kind as a word. Never filters, sorts or assigns. |
| `CEMessageList` | `ce-message-list`, `ce-message` | MessageList, InternalNote, MessageStatus | `messages`, `label`. A focusable `role="log"`. Incoming, outgoing, internal-note and system messages; statuses written as Enviado, Entregado, Leído, No entregado (plus "· simulado"). A message may carry `attachments` (drawn with `CEAttachmentGroup`; emits `openAttachment(messageId, attachmentId, index)`) and the `context` slot (`{ message }`) draws application content inside the bubble, with no wrapper when it draws nothing. Follows new messages only at the bottom or after the reader's own message, also when attachments or contextual content change height. |
| `CEAttachmentGroup` | `ce-attachments`, `ce-attachment` | AttachmentGroup | `items` (`{ id, label, src, alt }`), `label` (the group's accessible name), `fit` (`contain` by default, or `cover`). A list of native buttons that emit `open(index, id)`; each name gives the action, the position, the caption and the description once. Tiles reserve their box with `aspect-ratio`. Draws its own query container (`ce-attachment-group`), so it goes to two columns under 21rem wide, also when enlarged text narrows it, on its own. No upload, capture, zoom or viewer. |
| `CEWorkStatus` | `ce-work-status`, `ce-work-steps` | WorkStatus | `title`, `steps` (`{ id, label, state }`, state `done`, `current`, `pending` or `stopped`), `status` (the current state as text, announced politely when it changes), `summary`, `headingLevel`, and an `actions` slot that renders no wrapper when empty. States are written in words and drawn by shape. It is its own query container, so the steps reflow to two columns under 21rem wide without help from an ancestor. It owns no transitions, rules, permissions or persistence. |
| `CEMessageComposer` | `ce-composer` | MessageComposer, ComposerNoteMode | `label`, `recipient`, `allowNotes`, `v-model:mode`, `v-model:reply`, `v-model:note`. Emits `submitReply` and `saveNote`, never one generic event. Enter adds a line, Ctrl or ⌘ + Enter submits, blank drafts cannot be submitted. |

## Use

```ts
import { CEButton, CEPrice, CEProductCode, CETextField } from '@casaelida/vue';
```

```vue
<CEProductCode code="CE26061441" />
<CEPrice amount="6.00" previous-amount="7.50" discount-label="20%" />
<CETextField v-model="email" label="Correo electrónico" type="email" :error="emailError" />
<CEButton type="submit" :loading="saving">Guardar</CEButton>
```

### Messaging components

They draw conversations and send nothing. The application owns the drafts (`v-model:reply`, `v-model:note`), the selected conversation, delivery states, authorization and transport. `CEMessageComposer` emits `submitReply(text)` or `saveNote(text)`; an internal note can never leave through the reply event. Drawing a note differently is presentation, not a security control: the service must still decide who may read it. The message bubble is part of `CEMessageList` and is not exported. **Mount one `CEMessageList` per conversation and key it** (`<CEMessageList :key="conversation.id" ... />`): the list never infers a conversation change from its messages, so ids may repeat across conversations (each can start with the same day separator) and older messages may be added above. A keyed mount opens at the newest message. See the interactive fixture example on `/mensajeria/` in the showcase. It shows the fictional conversation “Reposición · Tacna”: a photo and a replenishment request inside one message, the delivery status in the message meta and the request's progress in `CEWorkStatus` (read is not accepted, accepted is not resolved), simulated warehouse actions, and a simulated attachment-open event. The states are illustrative, not business rules of any system.

**Standalone use of `CEAttachmentGroup` and `CEWorkStatus`.** Neither needs `CEMessageList` or any application CSS to respond to a narrow container: each draws its own query container (`ce-attachment-group` and `ce-work-status`), so the layout follows the component's own width, in a message bubble, a side panel or a plain page, at any text size.

**Give them a definite width.** A query container has no width of its own. In a block-level parent or a grid cell it takes the parent's width (the normal case). In a flex row (`display: flex` or `inline-flex`) a flex item is as wide as its content, so the component collapses to zero width even when the row has a width: give the component `flex: 1` (or a `width`). Any other parent that sizes itself to its content (`inline-block`, a float, `width: max-content`, an auto-width table cell) collapses it too, until that parent gets a width.

```vue
<!-- Correct: the flex row gives the component its free width. -->
<div style="display: flex; gap: 8px">
  <CEWorkStatus style="flex: 1" title="Pedido de reposición" :steps="steps" status="Aceptado" />
</div>

<!-- Collapses to zero width: a flex item is as wide as its content, and a query container has none. -->
<div style="display: flex; gap: 8px">
  <CEWorkStatus title="Pedido de reposición" :steps="steps" status="Aceptado" />
</div>
```

`CEMessageList` itself is not a query container and keeps its intrinsic width.

When several Vue apps render on one page (for example Astro islands), give each `CETextField` an `id`; generated ids are unique only within one app.

## Develop

From the repository root: `pnpm check` typechecks, tests and builds this package with the rest of the foundation. `pnpm test:consumer` packs it and proves a clean install in an empty application outside the checkout (`tests/consumer/`). In this folder: `pnpm typecheck`, `pnpm test`, `pnpm build`. See [CONTRIBUTING.md](CONTRIBUTING.md).
