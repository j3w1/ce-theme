# Messaging application retirement (B5)

The full messaging application lives in private `j3w1/ce-meta-app`. Its owning lead verified
[B4 PR #15](https://github.com/j3w1/ce-meta-app/pull/15) merged as
`ddaa6fd0c85066fb81da8c207930ce1e3acf5714` from reviewed `eebed5499aef`: Chromium and WebKit each
passed 67 parity scenarios plus 3 smoke/provenance cases using pinned `@casaelida/vue` 0.2.0.
The frozen public source is [`f2a808afcf40dde8e7b8723d41f715777bc65c64`](https://github.com/j3w1/ce-theme/tree/f2a808afcf40dde8e7b8723d41f715777bc65c64).
The authoritative private handoff is `docs/migration/mensajeria.md` at that B4 merge. It maps
source blobs and every title below; it was read for this classification. No private checkout,
source, data or credentials are required by this repository or its CI.

## Path ownership

| Old public path | B5 disposition |
| --- | --- |
| `site/components/MessagingDemo.vue` | Replace the application controller with a compact public-component composition: two examples, selection and local reply/note events. Remove warehouse transitions, incoming simulation, unread logic, clock, event history and responsive app navigation. |
| `site/data/messaging.ts` | Remove the domain catalogue/controller helpers; two small component inputs live in `site/data/messaging-example.mjs`. |
| `site/pages/mensajeria.astro` | Keep the route and Layout; shorten the Spanish composition explanation and keep a simulation cue. |
| `site/styles/site.css` messaging block (frozen lines 253–287) | Remove app pane/warehouse/event/scope rules; retain only example layout. Other site styles stay. |
| `tests/browser/messaging.spec.mjs` | Replace the 67 transferred application scenarios with compact route/selection/composition smoke checks. Keep the selection title phrase used by B2's live smoke. Public contracts are independently retained below. |
| `tests/messaging.test.mjs` | Retain shared guards; adapt the five mapped static titles below to the reduced example. |
| `public/references/shelf-gap-fictional.svg`, `public/references/manifest.json` | Keep unchanged: the compact composition, public AttachmentGroup specimen and generated design-system previews use this reference. The manifest description's “Reposición · Tacna” usage sentence is historical; provenance, rights and digest remain authoritative. |
| `packages/vue/`, `recipes/`, tokens, fonts, helpers, names and generated specimens | Keep all public components/contracts and unit tests. No packed content or version changes. The packed README's historical Reposición description awaits a separately versioned package change. |

## Retained independent component evidence

Before retiring the application scenarios, B5 adds and runs evidence in the existing harnesses:

- **K** — `tests/consumer/consumer.spec.mjs`, “standalone keyboard selection…”: Enter/Space selection, native tab order, computed focus rings, arrow-key radios and announcements.
- **D** — consumer “standalone reply and note drafts…” and “standalone supplied work states…”: separate drafts/intents, conversation reset, blank prevention, Enter/Ctrl/Meta shortcuts, button submit, field focus and notes disabled.
- **S** — consumer “standalone keyed logs…”: repeated separator ids, newest keyed mount, history/new incoming/own message/prepend and context grow/shrink scrolling.
- **A** — consumer “standalone attachment load…” and “standalone supplied work states…”: delayed-load geometry, uncropped image, forwarded IDs/index, focus, delivery/context separation, ordered step words/shapes and one supplied-status announcement.
- **L** — consumer “standalone components fit…” at 320/390/768/1440px and 100%/200% text: long identifiers/names, real overflow, targets and axe. `tests/browser/messaging-standalone.spec.mjs` retains all seven existing intrinsic-width/query-container cases and adds real rendered 1–5 attachment layouts and fit checks.
- **W** — standalone “standalone message delivery…” plus existing public unit tests: four simulated delivery words and distinct note identity.

The consumer fixture only supplies component inputs and neutral mutation controls. It installs the packed
package anonymously, imports its styles and preserves the existing file-list, integrity, single-Vue,
strict-typecheck and font proof. No showcase implementation is imported.

## Old browser titles

Every title is transferred application evidence in B4's `tests/browser/conversations.spec.ts`, unchanged
in title. A code in the second column additionally identifies the public contract retained here;
“App only” identifies the retired host composition/controller or fixture policy. Mixed rows transfer
the business scenario while retaining only its component contract. Titles are expanded from the actual
committed public suite; new standalone cases use neutral inputs rather than copying the application.

| Old title in `tests/browser/messaging.spec.mjs` | Additional public proof retained |
| --- | --- |
| shows the simulation notice, the fixtures and no real channel | App only |
| selecting a conversation opens its history, clears its unread count and moves the selection | K, S |
| sends a simulated reply: Ctrl+Enter or the button, explicit wording, draft cleared, focus kept | D |
| Enter adds a line, and a blank or whitespace-only draft cannot be submitted | D |
| an internal note is its own mode: labelled, informational, never an outgoing message | D, W |
| staff conversations have no note mode | D |
| each mode keeps its own draft and the other one is never shown or sent | D |
| the mode change is announced and the radios work with the arrow keys | K, D |
| keyboard order, activation and visible focus | K |
| at 320px the list and the thread are separate views, with focus handled | App only |
| at 390px the list and the thread are separate views, with focus handled | App only |
| at 768px the list and the thread sit side by side | App only |
| at 1440px the list and the thread sit side by side | App only |
| long text and identifiers wrap safely at 320px with 100% text | L |
| long text and identifiers wrap safely at 390px with 100% text | L |
| long text and identifiers wrap safely at 768px with 200% text | L |
| long text and identifiers wrap safely at 320px with 200% text | L |
| long text and identifiers wrap safely at 1440px with 200% text | L |
| the list shortens long names with an ellipsis instead of overflowing | L |
| a new message never moves a reader who is looking at earlier history | S |
| opening a thread on a narrow screen starts at the newest message | S |
| message statuses are words and say they are simulated; nothing claims acceptance or completion | W |
| the example makes no real-channel, stock, sales or catalogue claims | App only |
| touch targets are at least 44 px on a phone, in both views and both modes | L |
| has no accessibility violations at 320px, in the list, reply and note views | L |
| has no accessibility violations at 390px, in the list, reply and note views | L |
| has no accessibility violations at 768px, in the list, reply and note views | L |
| has no accessibility violations at 1440px, in the list, reply and note views | L |
| the example uses no network, messaging transport or browser storage while it is used | App only |
| the page says what is simulated and does not claim to test native features | App only |
| resizing from 1280px to 390px while composing keeps the conversation visible and focus in the composer | App only |
| resizing to 390px while on a conversation row keeps the list visible and the row focused | App only |
| widening from 390px while the Back button is focused moves focus to the selected conversation row | App only |
| the layout is read from the real layout: enlarged text moves a composing reader to the thread view | App only |
| a reader who has not focused anything is not moved by a resize | App only |
| opening another conversation always starts at its newest message, though every conversation starts with the same separator id | S |
| Reposición · Tacna shows the photo, the message, its delivery status and the request, each in its own place | A, W |
| the request steps are an ordered list that says every state in words, and the current step is marked | A |
| simulated warehouse actions advance the request Solicitado → Aceptado → Preparando → Resuelto, and each one is recorded | A |
| the alternative outcome: "No se puede atender" stops the request, says so apart from colour, and explains in the chat | A |
| keyboard users keep their place: activating an action moves focus to the next action, or to the log at the end | App only |
| opening the photo records a visible simulated event and says there is no viewer | A |
| each conversation keeps its own drafts and its own request state when you switch | D, S |
| the thread opens at the newest message, with the photo message above it intact | S, A |
| a reader in history is not moved when the request advances; a reader at the bottom stays at the newest message | S |
| a reader at the bottom stays at the newest message while the request block grows and shrinks | S |
| a late image never shifts the thread: the tile box is reserved before the image arrives | A |
| Reposición · Tacna fits at 320px: nothing overflows, the tile keeps its 4:3 box and the steps stay inside the bubble | L |
| Reposición · Tacna fits at 390px: nothing overflows, the tile keeps its 4:3 box and the steps stay inside the bubble | L |
| Reposición · Tacna fits at 768px: nothing overflows, the tile keeps its 4:3 box and the steps stay inside the bubble | L |
| Reposición · Tacna fits at 1440px: nothing overflows, the tile keeps its 4:3 box and the steps stay inside the bubble | L |
| enlarged text moves the steps to two columns and wraps the labels instead of overflowing | L |
| the attachment group lays out 1, 2, 3, 4 and 5 items as designed, and in two columns in a narrow container | L |
| photographic evidence is uncropped by default: the image is contained inside its tile | A |
| touch targets in Reposición are at least 44 px on a phone, in every state | L |
| Reposición · Tacna has no accessibility violations at 320px, in every request state | L |
| Reposición · Tacna has no accessibility violations at 320px when the request cannot be attended | L |
| Reposición · Tacna has no accessibility violations at 390px, in every request state | L |
| Reposición · Tacna has no accessibility violations at 390px when the request cannot be attended | L |
| Reposición · Tacna has no accessibility violations at 768px, in every request state | L |
| Reposición · Tacna has no accessibility violations at 768px when the request cannot be attended | L |
| Reposición · Tacna has no accessibility violations at 1440px, in every request state | L |
| Reposición · Tacna has no accessibility violations at 1440px when the request cannot be attended | L |
| Reposición uses no network, storage, dialog or viewer once its image has loaded | A |
| the page says the photo is an illustration, the states are illustrative and no viewer exists | App only |
| every conversation starts at its newest message after the new thread was added | S |
| the event history is not live: replies and request changes are announced once, by the log and by CEWorkStatus | A |

## Five transferred static titles

These also moved to B4's `tests/unit/messaging.test.ts`; their public/shared parts stay here:

| Old title in `tests/messaging.test.mjs` | B5 disposition |
| --- | --- |
| the shelf illustration is a self-contained fictional SVG with recorded provenance | Keep the shared SVG/provenance/hash checks; replace its coupling to the removed domain fixture. |
| the Reposición example keeps delivery status and work progress apart, with simulated actions and no viewer | Remove warehouse source assertions; A/W retain the generic delivery/context/open-event contracts. |
| the messaging components and the example add no network, transport, storage or provider code | Keep the shared component guard and scan the compact composition's actual paths. |
| the example fixtures are fictional: no catalogue codes, prices, stock or real domains | Replace the domain-catalogue assertion with the same boundary on the two small inputs. |
| every example conversation starts with the same separator id, so the list must be keyed by conversation | Replace the four-thread source regex with S's live repeated-id/keyed-mount proof; keep the shared contract guard. |

All other naming, generated-source, decision, helper and public component implementation tests stay.
The app's responsive pane focus controller and warehouse-action focus handoff transfer with B4;
the remaining example keeps both selection and composer controls visible when stacked, so it needs
neither controller. Local Chromium evidence is distinct from hosted Chromium/WebKit acceptance;
local WebKit remains unrun where its system libraries are unavailable.
