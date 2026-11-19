# Artifact synchronization

2026-11-14 · [B7 execution spec](https://github.com/j3w1/ce-theme/issues/33).

The three existing private artifacts were synchronized from reviewed CE Theme
`2fdfdeb199e3279ca698a34d1ae711269a330dfd` and the immutable
`@casaelida/vue` **0.5.0** release. The consumer reference is the implemented
application UI **0.2.0** snapshot; later records-only updates do not change this
visual source set.

| Artifact purpose | Native revision | Checked change |
| --- | --- | --- |
| Canonical Design System | 46 | Reviewed contracts, consumption guidance, assets and native generation |
| Messaging exploration | 36 | Foundation refresh and implemented / fixture / future labels |
| Retail & Systems archive | 65 | Foundation refresh and one tablet flex-row compatibility declaration |

Readbacks checked exact source forms, complete typed JSON objects, copied fonts,
logos and Inter OFL, and preserved identities, private status, unowned content,
archive history and frame geometry. The native editor generated CSS, API cards,
manifest and README consumption tail from the reviewed inputs, with separate
output hashes. The authored README body stayed exact. One forward correction
restored a final newline lost by the component-guideline editor.

The two cart SVGs retain identical canonical XML, attributes and path data;
their accepted stored form expands the self-closing path and omits the final
newline. Original and stored hashes are recorded separately. Preview media URL
rewrites were checked against exact expected forms. No arbitrary transformation
or generated-file patch was accepted.

Chromium mirror collection covered 209 boards at 100%, 150% and 200% text, plus
selected narrow layouts, accessibility and keyboard comparisons. Focused height
checks and sampled native-viewer checks covered the changed content, typography,
footer reachability and focus rings. One pre-existing definition-list
accessibility finding remains. Native checks cover sampled boards and their
scrolling areas. Artifact WebKit, screen-reader and physical-device acceptance
were not run. The Cover comparison used the source mirror. Repository CI browser
and packed-consumer checks are separate evidence.

Real messaging, business services and AI remain unconnected; application examples
are fixtures. The CR-02 documentation kit was excluded. This record does not
extend platform or backend acceptance.

## 2026-11-19 · CR-02 documentation kit and hosting note

[Issue #39](https://github.com/j3w1/ce-theme/issues/39). The same three private
artifacts were synchronized from reviewed CE Theme
`943744fdbfa697bd4d52a3efa1a8a5787ec91600` (PRs #36 and #38) and the unchanged
immutable `@casaelida/vue` **0.5.0** release. The CR-02 kit that B7 excluded is
now included.

| Artifact purpose | Native revision | Checked change |
| --- | --- | --- |
| Canonical Design System | 46 → 52 | Five authored files, the index, native generation |
| Messaging exploration | 36 → 38 | Pinned copy refreshed (record only) |
| Retail & Systems archive | 65 → 67 | Pinned copy refreshed (record only) |

**Canonical files.** Exactly five authored files differ from the previous
artifact: `README.md` (16192 B authored body), `apply-ce-theme.md` (6811 B),
`decisions.md` (37234 B), `doc-kit/README.md` (10175 B) and
`doc-kit/state-frame.css` (3326 B). One publish wrote them; each was read back in
full and matched its Git bytes. The index was written once, last, changing only
`lastChange`.

**Native generation.** The publish and the index write did not regenerate
anything, and neither did opening the page. The page generated its outputs only
after one real editor save. That save was one transient edit: a single space
appended to the last line of `doc-kit/README.md`, made in the item's own editor
and saved once with Ctrl+S. The editor stored the file without that space and
without its final newline (10174 B), and the page then added the two kit files
to `manifest.json` (22771 B → 22827 B) and the `Consuming` tail to `README.md`
(16192 B body + 11873 B tail = 28065 B), registered the kit README in the
index's `docs.sections` and reordered the `lastChange` keys (values unchanged).
`tokens.css`, `bundle.css`, `tokens.json`, the 55 API cards, the 50 previews and
the 24 stored blobs kept their hashes. One exact Git correction then replaced
`doc-kit/README.md` alone with its Git bytes (10175 B); no other file was
written. The final readback matched all five files, with `README.md` equal to the
authored body plus the unchanged tail, and `manifest.json` equal to its frozen
expectation. Private status, ownership, title, namespace, unowned files
(`ce-systems-organization.md` and the two legacy `bag` icons) and the
declaration were preserved.

**Pins.** Each exploration re-ran the supported dependency install: one publish
of its `canvas.json` plus a server-side copy of the pinned files. Only the
`designSystems` entry changed (new canonical version, new copy time). All 10
Messaging and 12 Retail & Systems copied files were verified by full SHA-256 and
are byte-identical to the previous copies and to the canonical. Boards (16 and
193), notes (9 and 44), pages (0 and 14), order, titles, geometry, status and
sharing are equal. No board file was in either publish, and no board was edited.

**Render checks.** Local mirror (Chromium only): the kit's CSS loaded after the
bundle with Inter, a labelled frame with the demonstration cue and a 520px
fragment in a scrolling body. At 1600px nothing overflowed; at 360px with 100%
and 200% root text the page and frames stayed inside the sheet, the fragment
kept its size and scrolled in its body, the title and note were not clipped, the
marker stayed 28px high (a pill at 200%) and the focused body showed a 2px ink
ring inside its edge. Live viewer, kept separate: the kit's item renders in the
canonical Overview without clipping, and both explorations open and draw all
their boards at overview zoom. Not run: per-board clipping, typography and focus
at 100% zoom in the live exploration viewers, live text scaling and narrow
widths, the 640px breakpoint, keyboard traversal of the explorations, WebKit,
screen readers and physical devices. Repository CI browser and packed-consumer
checks are separate evidence.

Real messaging, business services and AI remain unconnected. This record does not
extend platform or backend acceptance.
