# StandardNamesMessaging

Standard names for messaging: **ConversationList** (Lista de conversaciones), **MessageList** (Lista de mensajes), **InternalNote** (Nota interna), **MessageStatus** (Estado del mensaje), **MessageComposer** (Caja de mensaje), **ComposerNoteMode** (Modo nota interna).

## Classes

- **ConversationList** · Lista de conversaciones: `ce-conversation-list`, `ce-conversation`, `ce-conversation-name`, `ce-conversation-time`, `ce-conversation-preview`, `ce-conversation-draft`, `ce-conversation-unread`, `ce-conversation-meta`, `ce-conversation-empty`, `ce-avatar`, `ce-avatar--team`. One native button per conversation: name, time, preview, unread count, and the kind (Equipo, Cliente, Asistente) as a word. The selected row has aria-current. Filtering, sorting and who may see what belong to the application.
- **MessageList** · Lista de mensajes: `ce-message-list`, `ce-message-list-empty`, `ce-message`, `ce-message--incoming`, `ce-message--outgoing`, `ce-message--system`, `ce-message-author`, `ce-message-text`, `ce-message-meta`, `ce-message-time`. A scrollable log. Incoming and outgoing messages differ by alignment, border and a spoken sender; a system message is centred. It keeps the reader where they are, and follows only at the bottom or after their own message. Mount one list per conversation and key it by the conversation id.
- **InternalNote** · Nota interna: `ce-message--note`, `ce-message-note-label`. An internal note spans the full width in the informational palette, with a lock and the words “Nota interna · No la ve el cliente”. It is never drawn as an outgoing message. The styling is presentation; the service decides who may read a note.
- **MessageStatus** · Estado del mensaje: `ce-message-status`, `ce-message-status--failed`. The delivery state of an outgoing message, in words: Enviado, Entregado, Leído, No entregado. A simulated message says so (“Enviado · simulado”). Delivery is not acceptance or completion of work.
- **MessageComposer** · Caja de mensaje: `ce-composer`, `ce-composer-mode`, `ce-composer-mode-option`, `ce-composer-mode-draft`, `ce-composer-row`, `ce-composer-field`, `ce-composer-send`. A text area and a send action. Enter adds a line; Ctrl or ⌘ + Enter submits; a blank draft cannot be submitted. With notes enabled, “Responder al cliente” and “Nota interna” each keep their own draft.
- **ComposerNoteMode** · Modo nota interna: `ce-composer--note`, `ce-composer-notice`, `ce-composer-mode-option--note`. In note mode the whole composer takes the informational palette, says “No la ve el cliente” and offers “Guardar nota” instead of the red send action. Switching modes never sends or rewrites a draft.

## The consumer supplies

Real products, each with a NAME; supplied prices, discount labels and bases. Nothing in a sample is a live offer.

## Do and don't

- Do say the name, not the look: “Precio Promo”, not “the yellow price”.
- Don't rename a pattern or reuse a name for another one; add a new entry to `recipes/names.mjs` in the same change as its recipe.
