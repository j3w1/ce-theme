# @casaelida/vue

Casa Elida's reusable Vue 3 + TypeScript components. Each component renders an approved ce-theme recipe and reuses the recipe helpers, so an application gets the same markup, classes and behaviour that the foundation documents. The package adds no CSS of its own.

Status: `0.1.0`, private. It is built and tested in this repository; how applications such as `j3w1/casaelida.com` install it (workspace, Git dependency or a registry) is still an owner decision.

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

**Standalone use of `CEAttachmentGroup` and `CEWorkStatus`.** Neither needs `CEMessageList` or any application CSS to respond to a narrow container: each draws its own query container (`ce-attachment-group` and `ce-work-status`), so the layout follows the component's own width, in a message bubble, a side panel or a plain page, at any text size. A query container has no intrinsic width. Place the component in a block-level parent (the normal case: it then takes the parent's width) or give it a width. In a shrink-to-fit parent (`display: inline-flex`, a float, an auto table cell) it collapses; give that parent a width. `CEMessageList` itself is not a query container and keeps its intrinsic width.

Load the foundation CSS once in the application: `fonts.css`, `tokens.css` and `recipes.css` from `exports/` (see `docs/apply-ce-theme.md`). Without it the components render unstyled.

When several Vue apps render on one page (for example Astro islands), give each `CETextField` an `id`; generated ids are unique only within one app.

## Develop

From the repository root: `pnpm check` typechecks, tests and builds this package with the rest of the foundation. In this folder: `pnpm typecheck`, `pnpm test`, `pnpm build`. See [CONTRIBUTING.md](CONTRIBUTING.md).
